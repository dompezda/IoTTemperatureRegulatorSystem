using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DatabaseAccessLayer.Models
{
    public class Password
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string PasswordId { get; set; }

        public string PasswordValue { get; set; }
    }
}
