using DatabaseAccessLayer;
using DatabaseAccessLayer.Models;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Client.Options;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace TemperatureHubController
{
    public class Program
    {
        const string MQTTHOST = "broker.hivemq.com";
        const int MQTTPORT = 1883;

        const string MQTTDEVICE = "TemperatureHubController";
        const string MQTTUSER = "";
        const string MQTTPASSWORD = "";

        const string MQTTSUBTOPIC = "TemperatureSensor/";
        const string MQTTPUBTOPIC = "ESP8266_Heater/";

        const string SWITCH_OFF_HEATER = "0";

        static void Main(string[] args)
        {
            DbContext dal = new DbContext();

            var factory = new MqttFactory();
            var mqttClient = factory.CreateMqttClient();

            var options = new MqttClientOptionsBuilder()
                         .WithClientId(MQTTDEVICE)
                         .WithTcpServer(MQTTHOST, MQTTPORT)
                         //.WithCredentials(MQTTUSER, MQTTPASSWORD)
                         //.WithTls()
                         .WithCleanSession()
                         .Build();

            mqttClient.ConnectAsync(options, CancellationToken.None).Wait();
            mqttClient.SubscribeAsync(new MqttTopicFilterBuilder().WithTopic(MQTTSUBTOPIC).Build());

            mqttClient.UseDisconnectedHandler(e =>
            {
                Console.WriteLine("### DISCONNECTED FROM SERVER ###");
                Task.Delay(TimeSpan.FromSeconds(5)).Wait();

                try
                {
                    mqttClient.ConnectAsync(options, CancellationToken.None).Wait(); // Since 3.0.5 with CancellationToken
                }
                catch
                {
                    Console.WriteLine("### RECONNECTING FAILED ###");
                }
            });

            mqttClient.UseApplicationMessageReceivedHandler(e =>
            {
                string temperatureValue = Encoding.UTF8.GetString(e.ApplicationMessage.Payload);

                Console.WriteLine("### RECEIVED APPLICATION MESSAGE " + DateTime.Now + " ###");
                Console.WriteLine($"+ Topic = {e.ApplicationMessage.Topic}");
                Console.WriteLine($"+ Payload = {temperatureValue}");
                Console.WriteLine($"+ QoS = {e.ApplicationMessage.QualityOfServiceLevel}");
                Console.WriteLine($"+ Retain = {e.ApplicationMessage.Retain}");
                Console.WriteLine("########################################################");
                Console.WriteLine();

                //DateTime dateToSave = DateTime.Now;
                //Azure
                DateTime dateToSave = DateTime.Now.AddHours(1);

                Temperature temp = new Temperature
                {
                    MeasurementDate = dateToSave,
                    TemperatureValue = Math.Round(double.Parse(temperatureValue, CultureInfo.InvariantCulture), 1)
                };

                dal.AddTemperatureLevel(temp);
            });

            mqttClient.UseConnectedHandler(e =>
            {
                Console.WriteLine("### CONNECTED WITH SERVER ###");

                // Subscribe to a topic
                mqttClient.SubscribeAsync(new MqttTopicFilterBuilder().WithTopic(MQTTSUBTOPIC).Build()).Wait();

                Console.WriteLine("### SUBSCRIBED ###");
            });

            while (true)
            {
                List<Temperature> temperatures = dal.GetTemperatures().ToList();
                HeaterSettings heaterSettings = dal.GetHeaterSettings();

                Temperature lastMeasuredTemperature = temperatures.LastOrDefault();
                double setTemperatureWithHysteresis = heaterSettings.Hysteresis + heaterSettings.SetTemperature;

                if (heaterSettings.StateOn == false && lastMeasuredTemperature.TemperatureValue <= heaterSettings.SetTemperature)
                {
                    heaterSettings.StateOn = true;
                    heaterSettings.PowerLevelHasChanged = false;
                    dal.UpdateHeaterSettings(heaterSettings);

                    string payload = heaterSettings.PowerLevel.ToString();
                    var message = new MqttApplicationMessageBuilder()
                                 .WithTopic(MQTTPUBTOPIC)
                                 .WithPayload(payload)
                                 .WithExactlyOnceQoS()
                                 .WithRetainFlag()
                                 .Build();

                    Task.Run(() => mqttClient.PublishAsync(message, CancellationToken.None).Wait());
                }
                else if (heaterSettings.StateOn == true)
                {
                    if (lastMeasuredTemperature.TemperatureValue >= setTemperatureWithHysteresis)
                    {
                        heaterSettings.StateOn = false;
                        heaterSettings.PowerLevelHasChanged = false;
                        dal.UpdateHeaterSettings(heaterSettings);

                        string payload = SWITCH_OFF_HEATER;
                        var message = new MqttApplicationMessageBuilder()
                                     .WithTopic(MQTTPUBTOPIC)
                                     .WithPayload(payload)
                                     .WithExactlyOnceQoS()
                                     .WithRetainFlag()
                                     .Build();

                        Task.Run(() => mqttClient.PublishAsync(message, CancellationToken.None).Wait());
                    }
                    if (heaterSettings.PowerLevelHasChanged)
                    {
                        heaterSettings.PowerLevelHasChanged = false;
                        dal.UpdateHeaterSettings(heaterSettings);

                        string payload = heaterSettings.PowerLevel.ToString();
                        var message = new MqttApplicationMessageBuilder()
                                     .WithTopic(MQTTPUBTOPIC)
                                     .WithPayload(payload)
                                     .WithExactlyOnceQoS()
                                     .WithRetainFlag()
                                     .Build();

                        Task.Run(() => mqttClient.PublishAsync(message, CancellationToken.None).Wait());
                    }
                }

                Task.Delay(TimeSpan.FromSeconds(10)).Wait();
            }
        }
    }
}
