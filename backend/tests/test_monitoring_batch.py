from unittest.mock import patch
import pytest
from services.weather_cache import (
    get_cached_weather, get_cached_aqi,
    _weather_cache, _aqi_cache,
)


@pytest.fixture(autouse=True)
def clean_caches():
    _weather_cache.clear()
    _aqi_cache.clear()
    yield
    _weather_cache.clear()
    _aqi_cache.clear()


def test_deduplicate_zones_by_city():
    """Zones sharing a city should result in one API call per city."""
    with patch("services.weather.get_current_weather") as mock_w, \
         patch("services.aqi.get_current_aqi") as mock_a:
        mock_w.return_value = {"city": "bangalore", "temp_c": 30, "rain_mm_1h": 0}
        mock_a.return_value = {"city": "bangalore", "aqi": 100}

        cities = ["bangalore"] * 5
        for city in cities:
            get_cached_weather(city)
            get_cached_aqi(city)

        mock_w.assert_called_once_with("bangalore")
        mock_a.assert_called_once_with("bangalore")


def test_batch_zones_helper():
    """batch_zones should split a list into chunks."""
    from main import batch_zones
    zones = list(range(7))
    batches = list(batch_zones(zones, batch_size=3))
    assert len(batches) == 3
    assert batches[0] == [0, 1, 2]
    assert batches[1] == [3, 4, 5]
    assert batches[2] == [6]


def test_batch_zones_empty_list():
    """batch_zones should handle empty input."""
    from main import batch_zones
    batches = list(batch_zones([], batch_size=3))
    assert len(batches) == 0
