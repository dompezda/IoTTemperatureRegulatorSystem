using DatabaseAccessLayer.Models;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;

namespace DatabaseAccessLayer
{
    public class DbContext
    {
        private string _databaseName = "xxx";
        private string _connectionstring = @$"xxx";
       
        private string _temperaturesDataSetName = "temperature";
        private string _heaterSettingsDataSetName = "heaterSettings";
        private string _passwordDataSetName = "password";

        private MongoClient _mongoClient;
        private IMongoDatabase _database;

        public DbContext()
        {
            _mongoClient = new MongoClient(_connectionstring);
            _database = _mongoClient.GetDatabase(_databaseName);
        }

        public ICollection<Temperature> GetTemperatures()
        {
            return _database.GetCollection<Temperature>(_temperaturesDataSetName).AsQueryable().ToList();
        }

        public HeaterSettings GetHeaterSettings()
        {
            return _database.GetCollection<HeaterSettings>(_heaterSettingsDataSetName).AsQueryable().FirstOrDefault();
        }

        public void AddTemperatureLevel(Temperature temperature)
        {
            _database.GetCollection<Temperature>(_temperaturesDataSetName).InsertOne(temperature);
        }

        public void UpdateHeaterSettings(HeaterSettings heaterSettings)
        {
            var filter = Builders<HeaterSettings>.Filter.Exists(z=> z.StateOn);
            var result = _database.GetCollection<HeaterSettings>(_heaterSettingsDataSetName).ReplaceOne(filter, heaterSettings);
        }

        public bool CheckPassword(string enteredPassword)
        {
            string validPassword = _database.GetCollection<Password>(_passwordDataSetName).AsQueryable().FirstOrDefault().PasswordValue;

            if (validPassword == enteredPassword)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
