def calculate_risk_premium(zone_base_premium: int, weather_data: dict, aqi_data: dict) -> int:
    """
    Simplified heuristic Risk Profiler logic based on real API data.
    """
    multiplier = 1.0
    
    if weather_data and not weather_data.get("error"):
        rain = weather_data.get("rain_mm_1h", 0)
        temp = weather_data.get("temp_c", 0)
        
        if rain > 10:
            multiplier += 0.5
        elif rain > 2:
            multiplier += 0.2
            
        if temp > 40:
            multiplier += 0.4
            
    if aqi_data and not aqi_data.get("error"):
        aqi = aqi_data.get("aqi", 0)
        try:
            aqi_val = int(aqi)
            if aqi_val > 300:
                multiplier += 0.3
        except (ValueError, TypeError):
            pass
            
    multiplier = min(multiplier, 2.5)
    
    return int(zone_base_premium * multiplier)

def estimate_income_loss(rider_avg_daily_income: int, event_type: str, severity: float) -> int:
    """
    Simplified Income Loss Estimator.
    event_type: 'rain', 'heat', 'aqi'
    severity: multiplier based on how extreme the event is
    """
    base_loss = rider_avg_daily_income * 0.4 
    
    if event_type == 'rain':
        adjusted_loss = base_loss * 1.2 * severity
    elif event_type == 'heat':
        adjusted_loss = base_loss * 0.8 * severity
    else:
        adjusted_loss = base_loss * severity
        
    return int(min(adjusted_loss, rider_avg_daily_income * 0.8))
