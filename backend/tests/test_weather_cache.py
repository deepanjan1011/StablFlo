from unittest.mock import patch
import pytest
from services.weather_cache import (
    get_cached_weather, get_cached_aqi,
    get_cache_stats, clear_all_caches,
    _weather_cache, _aqi_cache,
)


@pytest.fixture(autouse=True)
def clean_caches():
    """Clear caches before each test to prevent cross-test pollution."""
    _weather_cache.clear()
    _aqi_cache.clear()
    yield
    _weather_cache.clear()
    _aqi_cache.clear()


def test_cached_weather_returns_data():
    """First call should hit the real API function."""
    with patch("services.weather.get_current_weather") as mock_weather:
        mock_weather.return_value = {"city": "bangalore", "temp_c": 35, "rain_mm_1h": 0}

        result = get_cached_weather("bangalore")
        assert result["city"] == "bangalore"
        assert result["temp_c"] == 35
        mock_weather.assert_called_once_with("bangalore")


def test_cached_weather_deduplicates():
    """Second call for same city should NOT hit the API again."""
    with patch("services.weather.get_current_weather") as mock_weather:
        mock_weather.return_value = {"city": "bangalore", "temp_c": 35, "rain_mm_1h": 0}

        get_cached_weather("bangalore")
        get_cached_weather("bangalore")
        mock_weather.assert_called_once()


def test_cached_weather_normalizes_city_case():
    """'Bangalore' and 'bangalore' should share the same cache entry."""
    with patch("services.weather.get_current_weather") as mock_weather:
        mock_weather.return_value = {"city": "bangalore", "temp_c": 35, "rain_mm_1h": 0}

        get_cached_weather("Bangalore")
        get_cached_weather("bangalore")
        get_cached_weather("  BANGALORE  ")
        mock_weather.assert_called_once()


def test_cached_aqi_returns_data():
    """First call should hit the real AQI API function."""
    with patch("services.aqi.get_current_aqi") as mock_aqi:
        mock_aqi.return_value = {"city": "bangalore", "aqi": 150}

        result = get_cached_aqi("bangalore")
        assert result["city"] == "bangalore"
        assert result["aqi"] == 150
        mock_aqi.assert_called_once_with("bangalore")


def test_cached_aqi_deduplicates():
    """Second call for same city should NOT hit the AQI API again."""
    with patch("services.aqi.get_current_aqi") as mock_aqi:
        mock_aqi.return_value = {"city": "bangalore", "aqi": 150}

        get_cached_aqi("bangalore")
        get_cached_aqi("bangalore")
        mock_aqi.assert_called_once()


def test_error_responses_are_not_cached():
    """API errors should not be stored in cache."""
    with patch("services.weather.get_current_weather") as mock_weather:
        mock_weather.return_value = {"error": "API Key missing"}

        get_cached_weather("bangalore")
        get_cached_weather("bangalore")
        assert mock_weather.call_count == 2


def test_different_cities_cached_separately():
    """Each city gets its own cache entry."""
    with patch("services.weather.get_current_weather") as mock_weather:
        mock_weather.side_effect = [
            {"city": "bangalore", "temp_c": 35, "rain_mm_1h": 0},
            {"city": "chennai", "temp_c": 38, "rain_mm_1h": 5},
        ]

        r1 = get_cached_weather("bangalore")
        r2 = get_cached_weather("chennai")
        assert r1["city"] == "bangalore"
        assert r2["city"] == "chennai"
        assert mock_weather.call_count == 2


def test_cache_stats_tracking():
    """Cache should track hits and misses."""
    with patch("services.weather.get_current_weather") as mock_weather:
        mock_weather.return_value = {"city": "bangalore", "temp_c": 35, "rain_mm_1h": 0}

        get_cached_weather("bangalore")
        get_cached_weather("bangalore")

        stats = get_cache_stats()
        assert stats["weather_size"] >= 1


def test_clear_all_caches():
    """clear_all_caches should empty both caches."""
    with patch("services.weather.get_current_weather") as mock_w, \
         patch("services.aqi.get_current_aqi") as mock_a:
        mock_w.return_value = {"city": "bangalore", "temp_c": 35, "rain_mm_1h": 0}
        mock_a.return_value = {"city": "bangalore", "aqi": 150}

        get_cached_weather("bangalore")
        get_cached_aqi("bangalore")
        assert get_cache_stats()["weather_size"] == 1
        assert get_cache_stats()["aqi_size"] == 1

        clear_all_caches()
        assert get_cache_stats()["weather_size"] == 0
        assert get_cache_stats()["aqi_size"] == 0
