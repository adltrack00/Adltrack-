"""Public marketing documents must never replace the React authentication/dashboard shell."""
import os
import sys
import tempfile
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
static = tempfile.TemporaryDirectory()
root = Path(static.name)
shutil.copytree(ROOT / 'frontend/public/marketing', root / 'marketing')
(root / 'index.html').write_text('<div id="root">React application shell</div>')
os.environ['STATIC_DIR'] = str(root)
os.environ['DATA_DIR'] = tempfile.mkdtemp()
os.environ.pop('DATABASE_URL', None)
sys.path.insert(0, str(ROOT / 'backend'))
from fastapi.testclient import TestClient
from marketing import ROUTES, marketing_file
import server

with TestClient(server.app) as client:
    for route in ROUTES:
        response = client.get('/' + route)
        assert response.status_code == 200, route
        assert 'data-marketing-route="/' + route + '"' in response.text, route
        assert 'https://delivery-ctab.onrender.com' not in response.text, route
        assert 'logo-mark' not in response.text, route
        assert 'React application shell' not in response.text, route
    for route in ['signin', 'signup/company', 'get-started', 'join', 'join/ABC123', 'company', 'vendor', 'rider', 'setup', 'account', 'app']:
        response = client.get('/' + route)
        assert response.status_code == 200 and 'React application shell' in response.text, route
    assert client.get('/marketing/landing-rest.js').status_code == 200
    assert client.get('/api/not-a-real-endpoint').status_code == 404
    for route in ['../index.html', '../../etc/passwd', 'signin', 'signup/company']:
        assert marketing_file(str(root), route) is None, route
print('PASS: 13 marketing routes, 11 app/auth routes, static assets, API boundary and path allowlist.')
static.cleanup()
