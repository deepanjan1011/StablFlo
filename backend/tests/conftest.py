import os
import sys
import pytest
from unittest.mock import MagicMock


@pytest.fixture(autouse=True)
def mock_firebase_admin():
    import os
    import sys
    from unittest.mock import MagicMock

    mock_fa = MagicMock()
    # Clear any pre-existing _apps to prevent "app already exists" errors
    mock_fa._apps = {}
    sys.modules['firebase_admin'] = mock_fa
    sys.modules['firebase_admin.credentials'] = mock_fa.credentials
    sys.modules['firebase_admin.auth'] = mock_fa.auth

    os.environ.setdefault('FIREBASE_SERVICE_ACCOUNT', '{"type":"service_account","project_id":"test","private_key_id":"x","private_key":"x","client_email":"x@x.iam.gserviceaccount.com","client_id":"x","auth_uri":"x","token_uri":"x","auth_provider_x509_cert_url":"x","client_x509_cert_url":"x"}')
    os.environ.setdefault('DATABASE_URL', 'sqlite:///./test.db')
    os.environ.setdefault('ADMIN_SECRET_KEY', 'test-admin-key')

    yield mock_fa

    for key in ['firebase_admin', 'firebase_admin.credentials', 'firebase_admin.auth']:
        sys.modules.pop(key, None)
    sys.modules.pop('main', None)
