import React, { Component } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { Temperature } from 'react-environment-chart';
import { MDBBtn } from "mdbreact";


export class Charts extends Component {
    static displayName = Charts.name;

    constructor(props) {
        super(props);

        this.state = {
            refreshNeeded: false,

            setTemperature: 0,
            hysteresis: 0,
            heaterStateOn: false,

            temperatures: [
                {
                    date: 'Page A', temp: 22,
                },
                {
                    date: 'Page B', temp: 24,
                },
            ]
        }
    }

    RefreshComponent = () => {
        this.setState({
            refreshNeeded: !this.state.refreshNeeded
        });
    }

    getHeaterSettings = async (e) => {
        e.preventDefault();

        await axios.get("/api/TemperatureTelemetry/GetHeaterSettings", null,
            {
                params: {
                    quantity: 50
                }
            }).then(res => {
                this.setState({
                    setTemperature: res.setTemperature,
                    hysteresis: res.hysteresis,
                    powerLevel: res.heaterPowerLevel
                });
            }).catch(err => {
            })
    };

    getTemperatures = async (e) => {
        e.preventDefault();

        await axios.get("/api/TemperatureTelemetry/GetTemperaturesMeasurements", null,
            {
                params: {
                }
            }).then(response => response.json())
            .then(result => {
                this.setState({
                    temperatures: result
                });
            })
            .catch(err => {
            })
    };

    componentDidMount() {
        getHeaterSettings();
        getTemperatures();
        this.interval = setInterval(() => this.RefreshComponent(), 60000);
    }

    render() {
        return (
            <div>

                <LineChart width={500} height={300} data={this.state.temperatures} margin={{ top: 20, right: 50, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine y={this.state.setTemperature} label="Temperature Set" stroke="red" />
                    <ReferenceLine y={this.state.setTemperature + this.state.hysteresis} label="Hysteresis" stroke="yellow" />
                    <Line type="monotone" dataKey="temp" stroke="#8884d8" />
                </LineChart>

                <Temperature value={this.state.setTemperature} width={500} height={300} />

                <div>
                    <MDBBtn gradient="blue">{this.state.setTemperature}</MDBBtn>

                    <div className='custom-control custom-switch'>
                        <label className='custom-control-label' htmlFor='customSwitches'>
                            Disabled
                        </label>
                        <input
                            type='checkbox'
                            className='custom-control-input'
                            id='customSwitches'
                            checked={this.state.heaterStateOn}
                            readOnly />
                        <label className='custom-control-label' htmlFor='customSwitches'>
                            Enabled
                        </label>
                    </div>

                </div>

            </div>
        );
    }
}
