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
            temperaturesMeasurement = temperaturesMeasurement.OrderByDescending(z => z.MeasurementDate).Take(quantity).ToList();
            temperaturesMeasurement = temperaturesMeasurement.OrderBy(z => z.MeasurementDate).ToList();

            TemperatureViewModel[] reducedTemperatures = new TemperatureViewModel[temperaturesMeasurement.Count];

            for (int i = 0; i < temperaturesMeasurement.Count; i++)
            {
                TemperatureViewModel tmp = new TemperatureViewModel
                {
                    Date = temperaturesMeasurement[i].MeasurementDate.ToString("dd/MM/yyyy HH:mm"),
                    Temperature = temperaturesMeasurement[i].TemperatureValue
                };

                reducedTemperatures[i] = tmp;
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

                if (heaterSettings.PowerLevel != heaterSettingsReduced.PowerLevel)
                {
                    heaterSettings.PowerLevelHasChanged = true;
                    heaterSettings.PowerLevel = heaterSettingsReduced.PowerLevel;
                }

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
