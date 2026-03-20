import os
import requests

def get_current_aqi(city: str):
    """
    Fetch current AQI from public API (e.g. WAQI - World Air Quality Index).
    """
    api_key = os.getenv("AQI_API_KEY")
    if not api_key:
        return {"error": "API Key missing"}
        
    url = f"https://api.waqi.info/feed/{city}/?token={api_key}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if data.get("status") == "ok":
            aqi = data["data"]["aqi"]
            return {"city": city, "aqi": aqi}
        else:
            return {"error": data.get("data")}
    except Exception as e:
        return {"error": str(e)}
