"""Teste real do acervo privado. Cria duas contas fictícias e exibe seus IDs."""
import json
import os
import secrets
from urllib.error import HTTPError
from urllib.request import Request, urlopen

base = os.environ.get('API_URL', 'http://localhost:8080')


def call(method, path, expected, data=None, token=None, headers=None):
    h = {'Content-Type': 'application/json', **(headers or {})}
    if token:
        h['Authorization'] = 'Bearer ' + token
    req = Request(base + path, data=json.dumps(data).encode() if data is not None else None, headers=h, method=method)
    try:
        response = urlopen(req, timeout=15)
    except HTTPError as error:
        response = error
    with response:
        raw = response.read()
        assert response.status == expected, f'{method} {path}: esperado {expected}, recebido {response.status}; {raw[:200]}'
        return json.loads(raw) if raw else None


def cpf():
    values = [secrets.randbelow(10) for _ in range(9)]
    for size in (9, 10):
        digit = sum(n * (size + 1 - i) for i, n in enumerate(values)) * 10 % 11
        values.append(0 if digit == 10 else digit)
    return ''.join(map(str, values))


run = secrets.token_hex(8)
accounts = [call('POST', '/api/auth/register', 201, {
    'name': 'Teste Acervo', 'email': f'catalog-{run}-{n}@example.invalid',
    'cpf': cpf(), 'password': 'Teste-acervo-123!',
}) for n in (1, 2)]
print('Contas fictícias deste teste:', *(a['user']['id'] for a in accounts), flush=True)
a, b = (account['accessToken'] for account in accounts)
animal = {'category': 'ANIMAL', 'name': 'Estrela de Teste', 'species': 'Equino', 'breed': 'Mangalarga Marchador', 'sex': 'FEMALE', 'birthDate': '2020-01-15', 'state': 'mg'}
material = {'category': 'GENETIC_MATERIAL', 'name': 'Doses de Teste', 'species': 'Equino', 'geneticType': 'SEMEN', 'quantity': 3, 'sourceAnimal': 'Garanhão de Teste'}
call('GET', '/api/items', 401)
assert call('GET', '/api/items', 200, token=a)['totalElements'] == 0
horse = call('POST', '/api/items', 201, {**animal, 'ownerId': accounts[1]['user']['id']}, a)
assert horse['state'] == 'MG'
assert call('GET', '/api/items', 200, token=b)['totalElements'] == 0
other_animal = call('POST', '/api/items', 201, {**animal, 'name': 'Bovino de Teste', 'species': 'Bovino', 'breed': 'Nelore', 'sex': 'MALE'}, a)
genetic = call('POST', '/api/items', 201, material, a)
assert genetic['quantity'] == 3 and genetic['sex'] is None
assert call('GET', '/api/items?category=GENETIC_MATERIAL', 200, token=a)['totalElements'] == 1
assert call('GET', '/api/items?q=Nelore', 200, token=a)['totalElements'] == 1
page = call('GET', '/api/items?size=1&page=1', 200, token=a)
assert page['totalElements'] == 3 and len(page['content']) == 1 and page['page'] == 1
for bad in ({**animal, 'name': ''}, {**animal, 'state': 'XX'}, {**animal, 'birthDate': '2999-01-01'},
            {**animal, 'geneticType': 'SEMEN'}, {**animal, 'sex': None},
            {**material, 'quantity': 0}, {**material, 'quantity': None},
            {**material, 'geneticType': None}, {**material, 'sex': 'MALE'}):
    call('POST', '/api/items', 400, bad, a)
for bad_query in ('size=0', 'page=-1', 'size=101', 'category=INVALID'):
    call('GET', '/api/items?' + bad_query, 400, token=a)
path = '/api/items/' + horse['id']
assert call('GET', path, 200, token=a)['name'] == animal['name']
call('GET', path, 404, token=b)
call('PUT', path, 404, animal, b)
call('DELETE', path, 404, token=b)
assert call('PUT', path, 200, {**animal, 'name': 'Estrela Atualizada'}, a)['name'] == 'Estrela Atualizada'
changed = call('PUT', path, 200, material, a)
assert changed['category'] == 'GENETIC_MATERIAL' and changed['sex'] is None
call('DELETE', path, 204, token=a)
call('GET', path, 404, token=a)
call('PUT', path, 404, animal, a)
call('DELETE', path, 404, token=a)
assert call('GET', '/api/items', 200, token=a)['totalElements'] == 2
for item in (other_animal, genetic):
    call('DELETE', '/api/items/' + item['id'], 204, token=a)
assert call('GET', '/api/items', 200, token=a)['totalElements'] == 0
print('CRUD de animais e material, filtros, paginação, validação e isolamento entre usuários: aprovados.')
