#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

const int AIR_PIN = 34;

#define DHTPIN 18
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);
HTTPClient http;

const char* ssid = "RN12";                    // Имя сети Wi-Fi
const char* password = "12345678";                    // Пароль от сети Wi-Fi
const char* serverURL = "http://192.168.145.201:6969";  // Адрес сервера

long currentMillis;
long timer1Millis = 0;
long timer2Millis = 0;
long timer3Millis = 0;
void setup() {
  Serial.begin(115200);
  dht.begin();
  // Подключение к Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void loop() {
  currentMillis = millis();

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  float air = analogRead(AIR_PIN);

  if (WiFi.status() == WL_CONNECTED) {
    sendSensorData(10000, temperature, humidity,air);
    showInConsole(10000, temperature, humidity, air);
  }
}
void sendSensorData(int delay, float temperature, float humidity, float air) {
  if (currentMillis - timer1Millis >= delay) {
    timer1Millis = currentMillis;
    String endpoint = String(serverURL) + "/add-sensor-data";
    http.begin(endpoint);
    http.addHeader("Content-Type", "application/json");
 
    int httpResponseCode = http.POST(getJsonFromSensor("Temperature", temperature));
    int httpResponseCode1 = http.POST(getJsonFromSensor("Humidity", humidity));
    int httpResponseCode2 = http.POST(getJsonFromSensor("Air", air));

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error on sending POST: " + String(httpResponseCode));
    }
    http.end();
  }
}
void showInConsole(int delay, float temperature, float humidity, float air) {
  if (currentMillis - timer3Millis >= delay) {
    timer3Millis = currentMillis;
    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Error reading DHT");
      return;
    }
    Serial.print("Temperature : ");
    Serial.print(temperature);
    Serial.print(" °C  |  Humidity: ");
    Serial.print(humidity);
    Serial.print(" % | Air: ");
    Serial.println(air);

  }
}