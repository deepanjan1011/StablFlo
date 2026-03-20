import os
import requests

def get_current_weather(city: str):
    """
    Fetch current weather from OpenWeather API for a city.
    """
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        return {"error": "API Key missing"}
        
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Calculate heuristics
        rain_mm = data.get("rain", {}).get("1h", 0) # e.g. 1 hour rain volume
        temp_c = data.get("main", {}).get("temp", 0)
        
        return {
            "city": city,
            "temp_c": temp_c,
            "rain_mm_1h": rain_mm,
            "raw": data
        }
    except Exception as e:
        return {"error": str(e)}
