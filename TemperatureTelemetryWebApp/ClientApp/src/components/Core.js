import React, { Component } from 'react';
import { NotificationManager } from 'react-notifications';
import { Charts } from './Charts';
import { MDBBtn, MDBInput, MDBFormInline, MDBRow, MDBCol, MDBCard, MDBCardBody } from "mdbreact";
import axios from 'axios';

export class Core extends Component {
    static displayName = Core.name;

    constructor(props) {
        super(props);

        this.state = {
            refreshNeeded: false,

            setTemperature: 0,
            hysteresis: 0,
            powerLevel: 0
        }
    }

    changeValue(e) {
        console.log(e);
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    onClick = nr => () => {
        console.log(nr);
        this.setState({
            powerLevel: nr
        });
    };

    RefreshComponent = () => {
        this.setState({
            refreshNeeded: !this.state.refreshNeeded
        });
    }

    componentDidMount() {
        this.getHeaterSettings();
    }

    getHeaterSettings = async () => {
        await axios.get("/api/TemperatureTelemetry/GetHeaterSettings", null,
            {
                params: {
                }
            }).then(res => {
                console.log(res);
                console.log(this.state.powerLevel);
                this.setState({
                    setTemperature: res.data.setTemperature,
                    hysteresis: res.data.hysteresis,
                    powerLevel: res.data.powerLevel
                });
                console.log(this.state.powerLevel);
            }).catch(err => {
            })
    };

    changeHeaterSettings = async (e) => {
        e.preventDefault();

        await axios.post("/api/TemperatureTelemetry/ChangeHeaterSettings", null,
            {
                params: {
                    setTemperature: this.state.setTemperature,
                    hysteresis: this.state.hysteresis,
                    powerLevel: this.state.powerLevel
                }
            }).then(res => {
                NotificationManager.success('Updated', 'Heater Settings');
            }).catch(err => {
                NotificationManager.error('Validation Error', 'Heater Settings');
            })
    };

    render() {
        return (
            <div>
                <MDBRow center middle>
                    <MDBCol md="8" className="mt-3">
                        <MDBCard>
                            <MDBCardBody>
                                <form onSubmit={e => this.changeHeaterSettings(e)}>
                                    <p className="h4 text-center py-4">Temperature Settings</p>

                                    <MDBRow center middle>
                                        <MDBBtn gradient="blue" style={{ height: 102, width: 330 }}>Temperature Set<input type="text" id="temperatureSet" className="form-control form-control-lg" name="setTemperature" style={{ "text-align": "center"}} onChange={e => this.changeValue(e)} value={this.state.setTemperature} /></MDBBtn>
                                        <MDBBtn gradient="blue" style={{ height: 102, width: 330 }}>Hysteresis<input type="text" id="hysteresis" className="form-control form-control-lg" name="hysteresis" style={{ "text-align": "center" }} onChange={e => this.changeValue(e)} value={this.state.hysteresis} /></MDBBtn>

                                        <MDBBtn center middle gradient="blue" className="p-2" style={{ height: 102, width: 330 }}>
                                            Heater Power Level
                                <MDBFormInline>
                                                <MDBInput
                                                    onClick={this.onClick(1)}
                                                    checked={this.state.powerLevel === 1 ? true : false}
                                                    label='1'
                                                    type='radio'
                                                    id='heaterPowerLevel1'
                                                    containerClass='ml-4 mr-5'
                                                />
                                                <MDBInput
                                                    onClick={this.onClick(2)}
                                                    checked={this.state.powerLevel === 2 ? true : false}
                                                    label='2'
                                                    type='radio'
                                                    id='heaterPowerLevel2'
                                                    containerClass='mr-5'
                                                />
                                                <MDBInput
                                                    onClick={this.onClick(3)}
                                                    checked={this.state.powerLevel === 3 ? true : false}
                                                    label='3'
                                                    type='radio'
                                                    id='heaterPowerLevel3'
                                                    containerClass='mr-5'
                                                />
                                                <MDBInput
                                                    onClick={this.onClick(4)}
                                                    checked={this.state.powerLevel === 4 ? true : false}
                                                    label='4'
                                                    type='radio'
                                                    id='heaterPowerLevel4'
                                                    containerClass='mr-4'
                                                />
                                            </MDBFormInline>
                                        </MDBBtn>
                                    </MDBRow>

                                    <div className="text-center py-4 mt-3">
                                        <MDBBtn outline color="indigo" type="submit">
                                            Update
                                         </MDBBtn>
                                    </div>
                                </form>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>

                <Charts RefreshComponent={this.RefreshComponent} />

            </div>
        );
    }
}