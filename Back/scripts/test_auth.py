"""Teste HTTP contra API e PostgreSQL reais. Cria dois usuários fictícios.

Execute com a API ativa: python3 scripts/test_auth.py
As contas de teste ficam no banco; seus IDs são exibidos para remoção opcional.
"""
import json
import os
import secrets
from urllib.error import HTTPError
from urllib.request import Request, urlopen

BASE = os.environ.get('API_URL', 'http://localhost:8080')


def call(method, path, expected, data=None, token=None, headers=None):
    request_headers = {'Content-Type': 'application/json', **(headers or {})}
    if token:
        request_headers['Authorization'] = 'Bearer ' + token
    payload = json.dumps(data).encode() if data is not None else None
    req = Request(BASE + path, data=payload, headers=request_headers, method=method)
    try:
        response = urlopen(req, timeout=15)
    except HTTPError as error:
        response = error
    with response:
        raw = response.read()
        assert response.status == expected, f'{method} {path}: esperado {expected}, recebido {response.status}'
        return json.loads(raw) if raw else None


def cpf():
    digits = [secrets.randbelow(10) for _ in range(9)]
    for size in (9, 10):
        value = sum(n * (size + 1 - i) for i, n in enumerate(digits)) * 10 % 11
        digits.append(0 if value == 10 else value)
    return ''.join(map(str, digits))


suffix = secrets.token_hex(8)
email = f'auth-test-{suffix}@example.invalid'
password = 'Teste-local-123!'
data = {'name': 'Teste automatizado', 'email': email, 'cpf': cpf(), 'password': password}
call('GET', '/api/auth/me', 401)
call('POST', '/api/auth/register', 400, {})
call('POST', '/api/auth/register', 400, {**data, 'cpf': '11111111111'})
call('POST', '/api/auth/register', 400, {**data, 'password': 'curta'})
call('POST', '/api/auth/register', 400, {**data, 'password': 'á' * 40})
registered = call('POST', '/api/auth/register', 201, {**data, 'role': 'ADMIN'})
assert registered['user']['role'] == 'USER', 'Cadastro público não pode criar ADMIN'
assert registered['expiresIn'] == 900 and registered['tokenType'] == 'Bearer'
assert 'password' not in registered['user'] and 'passwordHash' not in registered['user']
token = registered['accessToken']
call('POST', '/api/auth/register', 409, {**data, 'cpf': cpf()})
call('POST', '/api/auth/register', 409, {**data, 'email': f'duplicate-{suffix}@example.invalid'})
call('POST', '/api/auth/login', 401, {'email': email, 'password': 'incorreta'})
call('POST', '/api/auth/login', 401, {'email': f'missing-{suffix}@example.invalid', 'password': password})
login = call('POST', '/api/auth/login', 200, {'email': email.upper(), 'password': password})
me = call('GET', '/api/auth/me', 200, token=login['accessToken'])
assert me['id'] == registered['user']['id'] and me['email'] == email
call('GET', '/api/admin/test', 403, token=token)
call('GET', '/api/auth/me', 401, token=token[:-8] + 'tampered')
other = call('POST', '/api/auth/register', 201, {**data, 'email': f'other-{suffix}@example.invalid', 'cpf': cpf()})
assert call('GET', '/api/auth/me', 200, token=other['accessToken'])['id'] != me['id']
call('POST', '/api/auth/logout', 204, token=login['accessToken'])
call('GET', '/api/auth/me', 401, token=token)
call('GET', '/api/auth/me', 401, token=login['accessToken'])
call('GET', '/api/auth/me', 200, token=other['accessToken'])
fresh = call('POST', '/api/auth/login', 200, {'email': email, 'password': password})
call('GET', '/api/auth/me', 200, token=fresh['accessToken'])
print('Cadastro, validação, duplicidade, login, JWT, isolamento, USER/ADMIN e logout: aprovados.')
print('IDs das duas contas fictícias:', me['id'], other['user']['id'])
