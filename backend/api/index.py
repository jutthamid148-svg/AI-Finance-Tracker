import os
import sys
import json
import traceback

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finance_tracker.settings')

CORS_HEADERS = [
    ('Access-Control-Allow-Origin', '*'),
    ('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS'),
    ('Access-Control-Allow-Headers',
     'Authorization, Content-Type, Accept, X-CSRFToken, X-Requested-With'),
    ('Access-Control-Allow-Credentials', 'true'),
    ('Access-Control-Max-Age', '86400'),
]

_init_error = None
_django_app = None

try:
    import django
    django.setup()

    try:
        from django.core.management import call_command
        call_command('migrate', '--run-syncdb', verbosity=0, interactive=False)
    except Exception:
        pass

    from django.core.wsgi import get_wsgi_application
    _django_app = get_wsgi_application()

except Exception:
    _init_error = traceback.format_exc()


def app(environ, start_response):
    # OPTIONS preflight — always allow
    if environ.get('REQUEST_METHOD') == 'OPTIONS':
        start_response('200 OK', CORS_HEADERS + [('Content-Length', '0')])
        return [b'']

    # If Django failed to start — return the error as JSON
    if _django_app is None:
        body = json.dumps({'error': _init_error or 'Django failed to initialize'}).encode()
        start_response('500 Internal Server Error', CORS_HEADERS + [
            ('Content-Type', 'application/json'),
            ('Content-Length', str(len(body))),
        ])
        return [body]

    # Normal request — inject CORS headers
    def cors_start_response(status, headers, exc_info=None):
        clean = [(k, v) for k, v in headers
                 if not k.lower().startswith('access-control-')]
        return start_response(status, clean + CORS_HEADERS, exc_info)

    return _django_app(environ, cors_start_response)
