"""Gera segredos locais sem sobrescrever configurações existentes."""
from pathlib import Path
import secrets

target = Path(__file__).resolve().parents[1] / '.env'
try:
    with target.open('x') as output:
        target.chmod(0o600)
        output.write(
            'POSTGRES_DB=semearas\nPOSTGRES_USER=semearas\n'
            f'POSTGRES_PASSWORD={secrets.token_urlsafe(24)}\n'
            f'JWT_SECRET={secrets.token_urlsafe(48)}\n'
            'POSTGRES_PORT=5433\nAPI_PORT=8080\n'
            'CORS_ORIGINS=http://localhost:8082,http://localhost:8081,http://localhost:19006\n'
        )
    print('Back/.env criado. Consulte POSTGRES_PASSWORD nesse arquivo para usar no DBeaver.')
except FileExistsError:
    print('Back/.env já existe; configuração preservada.')
