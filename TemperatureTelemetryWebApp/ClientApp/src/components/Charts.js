import React, { Component } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { Temperature } from 'react-environment-chart';
import { MDBBtn, MDBRow, MDBCol, MDBCard, MDBCardBody } from "mdbreact";
import qs from 'qs';
import axios from 'axios';

export class Charts extends Component {
    static displayName = Charts.name;

    constructor(props) {
        super(props);

        this.state = {
            refreshNeeded: false,
            quantityOfDownloadedTemperatures: 50,

            setTemperature: 0,
            hysteresis: 0,
            heaterStateOn: false,
            lastTemperature: 0,

            temperatures: [
                {
                    date: 'Page A', temperature: 22,
                },
                {
                    date: 'Page B', temperature: 24,
                },
            ]
        }
    }

    RefreshComponent = () => {
        console.log("refreshed - downloaded new data");

        this.getHeaterSettings();
        this.getTemperatures();

        this.setState({
            refreshNeeded: !this.state.refreshNeeded
        });
    }

    getHeaterSettings = async (e) => {
        await axios.get("/api/TemperatureTelemetry/GetHeaterSettings",
            {
                params: {
                },
            }).then(res => {
                this.setState({
                    setTemperature: res.data.setTemperature,
                    hysteresis: res.data.hysteresis,
                    powerLevel: res.data.heaterPowerLevel,
                    heaterStateOn: res.data.stateOn
                });
            }).catch(err => {
            })
    };

    getTemperatures = async (e) => {
        await axios.get("/api/TemperatureTelemetry/GetTemperaturesMeasurements",
            {
                params: {
                    quantity: this.state.quantityOfDownloadedTemperatures
                },
                paramsSerializer: params => {
                    return qs.stringify(params)
                }
            }).then(response => {
                this.setState({
                    temperatures: response.data,
                    lastTemperature: response.data[this.state.quantityOfDownloadedTemperatures-1].temperature
                });
            })
            .catch(err => {
            })
    };

    componentDidMount() {
        this.RefreshComponent();
        this.interval = setInterval(() => this.RefreshComponent(), 10000);
    }

    render() {
        return (
            <MDBRow center middle>
                <MDBCol md="10" className="mt-4">
                    <MDBCard>
                        <MDBCardBody>
                            <p className="h4 text-center py-4">Visualization</p>

                            <MDBRow center middle>

                                <Temperature value={this.state.lastTemperature} width={500} height={300} />

                                <LineChart width={1000} height={400} data={this.state.temperatures} margin={{ top: 20, right: 50, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <ReferenceLine y={this.state.setTemperature} label="Temperature Set" stroke="red" />
                                    <ReferenceLine y={this.state.setTemperature + this.state.hysteresis} label="Hysteresis" stroke="yellow" />
                                    <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
                                </LineChart>

                                <div>
                                    <MDBBtn gradient="blue" size="lg" style={{ width: 250, height: 114 }}>Current Temperature <br></br>
                                        <strong style={{ fontSize: 40 }}>{this.state.lastTemperature} &#8451;</strong>
                                    </MDBBtn>

                                    <br></br>

                                    <MDBBtn gradient="blue" size="lg" style={{ width: 250, height:114 }}>
                                        Heater Status
                                        <div className='custom-control custom-switch'>
                                            <input
                                                type='checkbox'
                                                className='custom-control-input'
                                                id='customSwitches'
                                                checked={this.state.heaterStateOn}
                                                readOnly />
                                            <label className='custom-control-label' htmlFor='customSwitches'>
                                                <strong style={{ fontSize: 24 }}>{this.state.heaterStateOn === true ? "Enabled" : "Disabled"}</strong>
                                            </label>
                                        </div>
                                    </MDBBtn>

                                </div>
                            </MDBRow>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        );
    }
}
