#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

#define DHTPIN 18
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);
HTTPClient http;

const char* ssid = "TP-Link_82E1";                    // Имя сети Wi-Fi
const char* password = "67652112";                    // Пароль от сети Wi-Fi
const char* serverURL = "http://192.168.0.103:6969";  // Адрес сервера

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
  showInConsole(1000, temperature, humidity);
  if (WiFi.status() == WL_CONNECTED) {

    sendSensorData(1000, temperature, humidity);
    if (currentMillis - timer2Millis >= 250) {
      timer2Millis = currentMillis;
      Serial.println("Printing Staff");
    }
  }
}
void sendSensorData(int delay, float temperature, float humidity) {
  if (currentMillis - timer1Millis >= delay) {
    timer1Millis = currentMillis;
    String endpoint = String(serverURL) + "/add-sensor-data";
    http.begin(endpoint);
    http.addHeader("Content-Type", "application/json");
    // Тело запроса (например, отправляем данные сенсора)
    String tempJson = "{\"sensor_type\":\"Temperature\", \"sensor_value\":" + String(temperature) + "}";
    String humiJson = "{\"sensor_type\":\"Humidity\", \"sensor_value\":" + String(humidity) + "}";

    // Отправляем POST запрос
    int httpResponseCode = http.POST(tempJson);
    // delay(100);
    int httpResponseCode1 = http.POST(humiJson);

    // Обрабатываем ответ сервера
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error on sending POST: " + String(httpResponseCode));
    }
    http.end();
  }
}
void showInConsole(int delay, float temperature, float humidity) {
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
    Serial.println(" %");
  }
}