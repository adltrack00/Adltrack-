"""Focused regression checks for the APIs used by the redesigned authentication forms."""
import os
import sys
import tempfile
os.environ['DATA_DIR'] = tempfile.mkdtemp()
os.environ.pop('DATABASE_URL', None)
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
import server

def data(response):
    assert response.status_code == 200, (response.status_code, response.text)
    return response.json()

with TestClient(server.app) as company:
    me = data(company.post('/api/auth/signup/company', json={'company':'Ada Test Logistics','name':'Jane','email':'jane@example.com','phone':'08031112041','city':'Lagos','password':'password1'}))
    assert me['user']['role'] == 'company'
    assert data(company.get('/api/auth/me'))['user']['id'] == me['user']['id']
    data(company.post('/api/auth/signout'))
    assert company.get('/api/auth/me').status_code == 401
    assert company.post('/api/auth/signin', json={'login':'jane@example.com','password':'incorrect'}).status_code == 401
    signed = data(company.post('/api/auth/signin', json={'login':'jane@example.com','password':'password1'}))
    assert signed['user']['id'] == me['user']['id']
    workspace = data(company.get('/api/workspace'))
    state = workspace['state']
    state['vendors'].append({'id':'test-vendor','name':'Glow','color':'#528c35'})
    state['riders'].append({'id':'test-rider','name':'Tunde','short':'Tunde','online':True,'dailyUnits':10})
    data(company.put('/api/workspace',json={'base_rev':workspace['rev'],'state':state}))
    for role, ref in [('vendor','test-vendor'),('rider','test-rider')]:
        invite = data(company.post('/api/invites',json={'role':role,'ref':ref}))
        with TestClient(server.app) as member:
            checked = data(member.get('/api/invites/' + invite['code']))
            assert checked['role'] == role
            joined = data(member.post('/api/auth/join',json={'code':invite['code'],'name':role.title(),'email':role+'@example.com','password':'password1'}))
            assert joined['user']['role'] == role
            assert data(member.get('/api/auth/me'))['user']['ref'] == ref
            data(member.post('/api/auth/signout'))
            assert data(member.post('/api/auth/signin',json={'login':role+'@example.com','password':'password1'}))['user']['role'] == role
with TestClient(server.app) as phone:
    assert data(phone.post('/api/auth/signup/company',json={'company':'Phone Logistics','name':'Tayo','phone':'08031112042','password':'password1'}))['user']['role'] == 'company'
print('PASS: company email/phone signup, session cookies, invalid password, signout, vendor/rider invitations and role-preserving sign-in.')
