import os
import threading
from cachetools import TTLCache
from services import weather, aqi

_CACHE_TTL = int(os.getenv("WEATHER_CACHE_TTL_SECONDS", "600"))  # 10 minutes
_CACHE_MAXSIZE = int(os.getenv("WEATHER_CACHE_MAXSIZE", "1000"))  # up to 1000 cities

_weather_cache = TTLCache(maxsize=_CACHE_MAXSIZE, ttl=_CACHE_TTL)
_aqi_cache = TTLCache(maxsize=_CACHE_MAXSIZE, ttl=_CACHE_TTL)
_lock = threading.Lock()

# Stats counters
_stats = {"weather_hits": 0, "weather_misses": 0, "aqi_hits": 0, "aqi_misses": 0}


def _normalize_city(city: str) -> str:
    """Normalize city name to prevent duplicate cache entries."""
    return city.lower().strip()


def get_cached_weather(city: str) -> dict:
    """Fetch weather with TTL caching. Errors are not cached."""
    key = _normalize_city(city)
    with _lock:
        if key in _weather_cache:
            _stats["weather_hits"] += 1
            return _weather_cache[key]
        _stats["weather_misses"] += 1

    result = weather.get_current_weather(city)

    if not result.get("error"):
        with _lock:
            _weather_cache[key] = result

    return result


def get_cached_aqi(city: str) -> dict:
    """Fetch AQI with TTL caching. Errors are not cached."""
    key = _normalize_city(city)
    with _lock:
        if key in _aqi_cache:
            _stats["aqi_hits"] += 1
            return _aqi_cache[key]
        _stats["aqi_misses"] += 1

    result = aqi.get_current_aqi(city)

    if not result.get("error"):
        with _lock:
            _aqi_cache[key] = result

    return result


def get_cache_stats() -> dict:
    """Return cache statistics for monitoring/debugging."""
    with _lock:
        return {
            "weather_size": len(_weather_cache),
            "aqi_size": len(_aqi_cache),
            **_stats,
        }


def clear_all_caches():
    """Clear both caches. Useful for testing or manual refresh."""
    with _lock:
        _weather_cache.clear()
        _aqi_cache.clear()
