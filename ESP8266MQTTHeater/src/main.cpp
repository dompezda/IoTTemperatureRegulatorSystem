#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

#define Heater D1
#define heaterOff 0

//Łukasz Czepielik

int heaterPower = 0;
int previousHeaterPower = 0;

//Dane logowania WiFi
char ssid[] = "xxx";  
char password[] = "xxx";          

WiFiClient  client;
PubSubClient mqttClient(client);

//Dane do IoT Hub
const char* MQTT_HOST = "xxx";
const char* MQTT_USER = "xxx";
const char* MQTT_PASS = "xxx";
const char* MQTT_DEVICE = "xxx";
const char* MQTT_SUB_TOPIC = "xxx";
int MQTT_PORT = 1883;
//int MQTT_PORT = 8883;

void changeHeaterPower()
{
  if (previousHeaterPower != heaterPower)
  {
      analogWrite(Heater, heaterPower);
      Serial.print("Heater power level [0-1024]: ");
      Serial.print(heaterPower);
      Serial.println();
  }
}

void OnMessageCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] : ");

  String message = "";

  for (unsigned int i = 0; i < length; i++) 
  {
    Serial.print((char)payload[i]);
    message += (char)payload[i];
  }

  Serial.println("");
  
  if(message == "0")
  {
    previousHeaterPower = heaterPower;
    heaterPower = 0;
    changeHeaterPower();
  }
  else if (message.length() > 0)
  {
    int powerLevel;

    powerLevel = message.toInt();

    if(powerLevel > 0 && powerLevel < 5)
    {
      previousHeaterPower = heaterPower;
      heaterPower = 256 * message.toInt();
      changeHeaterPower();
    }
  }
}

void initializeWiFi()
{
  WiFi.mode(WIFI_STA); 

  if(WiFi.status() != WL_CONNECTED)
  {
    Serial.println("|||||||||||||||||||||||");
    Serial.print("Proba polaczenia z siecia...");

    while(WiFi.status() != WL_CONNECTED)
    {
      WiFi.begin(ssid, password); 
      Serial.print(".");
      delay(10000);     
    } 

    Serial.println();
    Serial.println("Polaczenie zostalo ustanowione");
  }
}

void setupMQTT()
{
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setCallback(OnMessageCallback);
}

void connectToMQTTBroker()
{
  while (!mqttClient.connected()) 
  {
    Serial.print("Connecting to MQTT Server ... ");

    if (mqttClient.connect(MQTT_USER)) 
    {
      Serial.println("connected.");
      mqttClient.subscribe(MQTT_SUB_TOPIC);
    }
    else
    {
      Serial.print("failed, status code =");
      Serial.print(mqttClient.state());
      Serial.println(".Try again in 5 seconds.");
        
      /* Wait 5 seconds before retrying */
      delay(5000);
    }
  }
}

void setup() {
  // put your setup code here, to run once:
  pinMode(Heater, OUTPUT);
  analogWrite(Heater, heaterPower);
 
  Serial.begin(9600);
  
  initializeWiFi();
  setupMQTT();
  connectToMQTTBroker();
}

void loop() {
  // put your main code here, to run repeatedly:
  connectToMQTTBroker();
  mqttClient.loop();

  delay(200);
}