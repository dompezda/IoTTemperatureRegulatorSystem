using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace DatabaseAccessLayer.Models
{
    public class Temperature
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string TemperatureId { get; set; }

        public DateTime MeasurementDate { get; set; }
        public double TemperatureValue { get; set; }
    }
}
