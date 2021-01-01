using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DatabaseAccessLayer.Models
{
    public class HeaterSettings
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string HeaterSettingsId { get; set; }

        public bool StateOn { get; set; }

        public double Hysteresis { get; set; }
        public double SetTemperature { get; set; }

        public int PowerLevel { get; set; }
        public bool PowerLevelHasChanged { get; set; }
    }
}
