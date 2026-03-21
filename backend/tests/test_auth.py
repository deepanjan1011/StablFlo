import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException

# We test the auth utilities in isolation — no real Firebase calls needed.

def _setup_firebase_mock():
    """Import get_verified_phone after mocking firebase_admin to avoid init errors."""
    import importlib
    import sys
    # Provide a mock firebase_admin so main.py can import without real credentials
    mock_fa = MagicMock()
    sys.modules['firebase_admin'] = mock_fa
    sys.modules['firebase_admin.credentials'] = mock_fa.credentials
    sys.modules['firebase_admin.auth'] = mock_fa.auth
    # Also mock env var so init block doesn't raise
    import os
    os.environ.setdefault('FIREBASE_SERVICE_ACCOUNT', '{"type":"service_account","project_id":"test","private_key_id":"x","private_key":"x","client_email":"x@x.iam.gserviceaccount.com","client_id":"x","auth_uri":"x","token_uri":"x","auth_provider_x509_cert_url":"x","client_x509_cert_url":"x"}')
    os.environ.setdefault('DATABASE_URL', 'sqlite:///./test.db')
    os.environ.setdefault('ADMIN_SECRET_KEY', 'test-admin-key')
    return mock_fa

def test_get_verified_phone_valid_indian_number():
    mock_fa = _setup_firebase_mock()
    mock_fa.auth.verify_id_token.return_value = {"phone_number": "+919876543210"}
    import importlib
    import main as m
    importlib.reload(m)
    import asyncio
    result = asyncio.run(m.get_verified_phone("Bearer fake-token"))
    assert result == "9876543210"

def test_get_verified_phone_non_indian_number_raises_400():
    mock_fa = _setup_firebase_mock()
    mock_fa.auth.verify_id_token.return_value = {"phone_number": "+15551234567"}
    import importlib
    import main as m
    importlib.reload(m)
    import asyncio
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(m.get_verified_phone("Bearer fake-token"))
    assert exc_info.value.status_code == 400

def test_get_verified_phone_invalid_token_raises_401():
    mock_fa = _setup_firebase_mock()
    mock_fa.auth.verify_id_token.side_effect = Exception("Token expired")
    import importlib
    import main as m
    importlib.reload(m)
    import asyncio
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(m.get_verified_phone("Bearer bad-token"))
    assert exc_info.value.status_code == 401

def test_assert_owns_rider_matching_phone():
    _setup_firebase_mock()
    import importlib
    import main as m
    importlib.reload(m)
    mock_db = MagicMock()
    mock_rider = MagicMock()
    mock_rider.phone_number = "9876543210"
    mock_db.query.return_value.filter.return_value.first.return_value = mock_rider
    result = m.assert_owns_rider(1, "9876543210", mock_db)
    assert result == mock_rider

def test_assert_owns_rider_wrong_phone_raises_403():
    _setup_firebase_mock()
    import importlib
    import main as m
    importlib.reload(m)
    mock_db = MagicMock()
    mock_rider = MagicMock()
    mock_rider.phone_number = "9876543210"
    mock_db.query.return_value.filter.return_value.first.return_value = mock_rider
    with pytest.raises(HTTPException) as exc_info:
        m.assert_owns_rider(1, "9999999999", mock_db)
    assert exc_info.value.status_code == 403

def test_assert_owns_rider_not_found_raises_404():
    _setup_firebase_mock()
    import importlib
    import main as m
    importlib.reload(m)
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = None
    with pytest.raises(HTTPException) as exc_info:
        m.assert_owns_rider(999, "9876543210", mock_db)
    assert exc_info.value.status_code == 404

def test_require_admin_key_valid():
    _setup_firebase_mock()
    import importlib
    import main as m
    importlib.reload(m)
    import asyncio
    # Should not raise — returns None
    result = asyncio.run(m.require_admin_key("test-admin-key"))
    assert result is None

def test_require_admin_key_wrong_key_raises_403():
    _setup_firebase_mock()
    import importlib
    import main as m
    importlib.reload(m)
    import asyncio
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(m.require_admin_key("wrong-key"))
    assert exc_info.value.status_code == 403

def test_require_admin_key_empty_env_raises_403():
    _setup_firebase_mock()
    import os
    import importlib
    os.environ['ADMIN_SECRET_KEY'] = ''
    import main as m
    importlib.reload(m)
    import asyncio
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(m.require_admin_key("any-key"))
    assert exc_info.value.status_code == 403
    # Restore for other tests
    os.environ['ADMIN_SECRET_KEY'] = 'test-admin-key'
