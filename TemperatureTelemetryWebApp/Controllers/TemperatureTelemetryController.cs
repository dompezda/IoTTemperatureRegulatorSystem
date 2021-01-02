using DatabaseAccessLayer;
using DatabaseAccessLayer.Models;
using DatabaseAccessLayer.ViewModels;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace TemperatureTelemetryWebApp.Controllers
{
    [Route("api/[controller]/[action]")]
    public class TemperatureTelemetryController : Controller
    {
        private DbContext _dal;

        public TemperatureTelemetryController()
        {
            _dal = new DbContext();
        }

        [HttpPost]
        public ActionResult<string> CheckEnteredPassword(string password)
        {
            if (_dal.CheckPassword(password))
            {
                return Ok();
            }
           
            ModelState.AddModelError("Overall", "Wrong password");
            return BadRequest(ModelState);
        }

        [HttpGet]
        public ActionResult<HeaterSettingsViewModel> GetHeaterSettings()
        {
            HeaterSettings heaterSettings = _dal.GetHeaterSettings();
            HeaterSettingsViewModel settingsViewModel = new HeaterSettingsViewModel
            {
                StateOn = heaterSettings.StateOn,
                SetTemperature = heaterSettings.SetTemperature,
                Hysteresis = heaterSettings.Hysteresis,
                PowerLevel = heaterSettings.PowerLevel
            };

            return Ok(settingsViewModel);
        }

        [HttpGet]
        public ActionResult<TemperatureViewModel[]> GetTemperaturesMeasurements(int quantity)
        {
            List<Temperature> temperaturesMeasurement = _dal.GetTemperatures().ToList();
            temperaturesMeasurement = temperaturesMeasurement.OrderBy(z => z.MeasurementDate).Take(quantity).ToList();

            TemperatureViewModel[] reducedTemperatures = new TemperatureViewModel[quantity];

            for (int i = 0; i < temperaturesMeasurement.Count; i++)
            {
                reducedTemperatures[i].Date = temperaturesMeasurement[i].MeasurementDate.ToString();
                reducedTemperatures[i].Temp = temperaturesMeasurement[i].TemperatureValue;
            }

            return Ok(reducedTemperatures);
        }

        [HttpPost]
        public ActionResult<HeaterSettingsReducedViewModel> ChangeHeaterSettings(HeaterSettingsReducedViewModel heaterSettingsReduced)
        {
            if (ModelState.IsValid)
            {
                HeaterSettings heaterSettings = _dal.GetHeaterSettings();

                heaterSettings.SetTemperature = heaterSettingsReduced.SetTemperature;
                heaterSettings.Hysteresis = heaterSettingsReduced.Hysteresis;
                heaterSettings.PowerLevel = heaterSettings.PowerLevel;

                _dal.UpdateHeaterSettings(heaterSettings);

                return Ok();
            }
            else
            {
                ModelState.AddModelError("Overall", "ValidationError");
                return BadRequest(ModelState);
            }
        }
    }
}
