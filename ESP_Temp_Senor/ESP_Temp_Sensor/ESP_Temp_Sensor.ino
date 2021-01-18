#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>
#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#define SSID "***"
#define Password "***"
//

long last_time = 0;
char data[100];

// MQTT client
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient); 
const int oneWireBus = 4;
OneWire oneWire(oneWireBus);
DallasTemperature sensors(&oneWire);

char *mqttServer = "***";
int mqttPort = ***;
char *login ="***";
char *pass= "***";

void connectToWiFi() {
  Serial.print("Connectiog to ");
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, Password);
  Serial.println(SSID);

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.print("Connected.");
  
} 

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Callback - ");
  Serial.print("Message:");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
}

void setupMQTT() {
  mqttClient.setServer(mqttServer, mqttPort);
  // set the callback function
  mqttClient.setCallback(callback);
  
}


void setup() {
  Serial.begin(115200);
  sensors.begin();
  connectToWiFi();

  setupMQTT();
  mqttClient.connect("TempSensor",login,pass);
    
}

void reconnect() {
  Serial.println("Connecting to MQTT Broker...");
  while (!mqttClient.connected()) {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println("Reconnecting to MQTT Broker..");
      String clientId = "ESP32Client-";
      clientId += String(random(0xffff), HEX);
      
      if (mqttClient.connect("TempSensor",login,pass)) {
        Serial.println("Connected.");
        // subscribe to topic
        mqttClient.subscribe("/TemperatureSensor");
      }
      
  }
}


void loop() {

  if (!mqttClient.connected())
    reconnect();

  mqttClient.loop();

  long now = millis();
  if (now - last_time > 60000) {
      
      sensors.requestTemperatures(); 



      float temperatureC = sensors.getTempCByIndex(0);
      Serial.print(temperatureC);
      Serial.println("ºC");
      float temp = temperatureC;
      sprintf(data, "%f", temp);
      Serial.println(data);
      mqttClient.publish("/TemperatureSensor", data);

      last_time = now;
  }

}
