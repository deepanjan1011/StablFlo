import pytest
import importlib
import asyncio
from fastapi import HTTPException


def test_get_verified_phone_valid_indian_number(mock_firebase_admin):
    mock_firebase_admin.auth.verify_id_token.return_value = {"phone_number": "+919876543210"}
    import main as m
    importlib.reload(m)
    result = asyncio.run(m.get_verified_phone("Bearer fake-token"))
    assert result == "9876543210"


def test_get_verified_phone_non_indian_number_raises_400(mock_firebase_admin):
    mock_firebase_admin.auth.verify_id_token.return_value = {"phone_number": "+15551234567"}
    import main as m
    importlib.reload(m)
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(m.get_verified_phone("Bearer fake-token"))
    assert exc_info.value.status_code == 400


def test_get_verified_phone_invalid_token_raises_401(mock_firebase_admin):
    mock_firebase_admin.auth.verify_id_token.side_effect = Exception("Token expired")
    import main as m
    importlib.reload(m)
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(m.get_verified_phone("Bearer bad-token"))
    assert exc_info.value.status_code == 401


def test_get_verified_phone_missing_bearer_raises_401(mock_firebase_admin):
    import main as m
    importlib.reload(m)
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(m.get_verified_phone("raw-token-no-prefix"))
    assert exc_info.value.status_code == 401


def test_assert_owns_rider_matching_phone(mock_firebase_admin):
    from unittest.mock import MagicMock
    import main as m
    importlib.reload(m)
    mock_db = MagicMock()
    mock_rider = MagicMock()
    mock_rider.phone_number = "9876543210"
    mock_db.query.return_value.filter.return_value.first.return_value = mock_rider
    result = m.assert_owns_rider(1, "9876543210", mock_db)
    assert result == mock_rider


def test_assert_owns_rider_wrong_phone_raises_403(mock_firebase_admin):
    from unittest.mock import MagicMock
    import main as m
    importlib.reload(m)
    mock_db = MagicMock()
    mock_rider = MagicMock()
    mock_rider.phone_number = "9876543210"
    mock_db.query.return_value.filter.return_value.first.return_value = mock_rider
    with pytest.raises(HTTPException) as exc_info:
        m.assert_owns_rider(1, "9999999999", mock_db)
    assert exc_info.value.status_code == 403


def test_assert_owns_rider_not_found_raises_404(mock_firebase_admin):
    from unittest.mock import MagicMock
    import main as m
    importlib.reload(m)
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = None
    with pytest.raises(HTTPException) as exc_info:
        m.assert_owns_rider(999, "9876543210", mock_db)
    assert exc_info.value.status_code == 404


def test_require_admin_key_valid(mock_firebase_admin):
    import main as m
    importlib.reload(m)
    result = asyncio.run(m.require_admin_key("test-admin-key"))
    assert result is None


def test_require_admin_key_wrong_key_raises_403(mock_firebase_admin):
    import main as m
    importlib.reload(m)
    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(m.require_admin_key("wrong-key"))
    assert exc_info.value.status_code == 403


def test_require_admin_key_empty_env_raises_403(mock_firebase_admin):
    import os
    import main as m
    os.environ['ADMIN_SECRET_KEY'] = ''
    try:
        importlib.reload(m)
        with pytest.raises(HTTPException) as exc_info:
            asyncio.run(m.require_admin_key("any-key"))
        assert exc_info.value.status_code == 403
    finally:
        os.environ['ADMIN_SECRET_KEY'] = 'test-admin-key'
