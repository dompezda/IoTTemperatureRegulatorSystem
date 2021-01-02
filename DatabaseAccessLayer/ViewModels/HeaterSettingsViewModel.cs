namespace DatabaseAccessLayer.ViewModels
{
    public class HeaterSettingsViewModel
    {
        public bool StateOn { get; set; }
        public double Hysteresis { get; set; }
        public double SetTemperature { get; set; }
        public int PowerLevel { get; set; }
    }
}
