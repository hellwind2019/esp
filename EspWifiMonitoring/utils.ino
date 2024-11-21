String getJsonFromSensor(String name, float value){
  return "{\"sensor_type\":\"" + String(name) + "\", \"sensor_value\":" + String(value) + "}";
}

