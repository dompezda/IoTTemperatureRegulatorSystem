import React, { Component } from 'react';
import { Charts } from './Charts';
import { MDBBtn } from "mdbreact";

export class Core extends Component {
    static displayName = Core.name;

    constructor(props) {
        super(props);

        this.state = {
            refreshNeeded: false,

            setTemperature: 0,
            hysteresis: 0,
            heaterPowerLevel: 0
        }
    }

    changeValue(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    onClick = nr => () => {
        this.setState({
            heaterPowerLevel: nr
        });
    };

    RefreshComponent = () => {
        this.setState({
            refreshNeeded: !this.state.refreshNeeded
        });
    }

    componentDidMount() {
        getHeaterSettings();
    }

    getHeaterSettings = async (e) => {
        e.preventDefault();

        await axios.get("/api/TemperatureTelemetry/GetHeaterSettings", null,
            {
                params: {
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

    changeHeaterSettings = async (e) => {
        e.preventDefault();

        await axios.post("/api/TemperatureTelemetry/ChangeHeaterSettings", null,
            {
                params: {
                    setTemperature: this.state.setTemperature,
                    hysteresis: this.state.hysteresis,
                    powerLevel: this.state.heaterPowerLevel
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

                <div className="grid-x grid-padding-x" style={{ marginTop: 30 }}>
                    <div className="grid-container fluid callout translucent-form-overlay small-10 medium-8 large-4 cell">
                        <div className="text-center">
                            <h2>Settings</h2>
                        </div>
                        <form onSubmit={e => this.changeHeaterSettings(e)}>
                            <MDBBtn>Temperature Set: <input type="text" id="temperatureSet" className="form-control form-control-lg" onChange={e => this.changeValue(e)} value={this.state.setTemperature} /></MDBBtn>
                            <MDBBtn>Hysteresis<input type="text" id="hysteresis" className="form-control form-control-lg" onChange={e => this.changeValue(e)} value={this.state.hysteresis} /></MDBBtn>

                            <MDBFormInline>
                                <label>Heater Power Level</label>
                                <MDBInput
                                    onClick={this.onClick(1)}
                                    checked={this.state.heaterPowerLevel === 1 ? true : false}
                                    label='1'
                                    type='radio'
                                    id='heaterPowerLevel1'
                                    containerClass='mr-5'
                                />
                                <MDBInput
                                    onClick={this.onClick(2)}
                                    checked={this.state.heaterPowerLevel === 2 ? true : false}
                                    label='2'
                                    type='radio'
                                    id='heaterPowerLevel2'
                                    containerClass='mr-5'
                                />
                                <MDBInput
                                    onClick={this.onClick(3)}
                                    checked={this.state.heaterPowerLevel === 3 ? true : false}
                                    label='3'
                                    type='radio'
                                    id='heaterPowerLevel3'
                                    containerClass='mr-5'
                                />
                                <MDBInput
                                    onClick={this.onClick(4)}
                                    checked={this.state.heaterPowerLevel === 4 ? true : false}
                                    label='3'
                                    type='radio'
                                    id='heaterPowerLevel4'
                                    containerClass='mr-5'
                                />
                            </MDBFormInline>

                            <MDBBtn outline color="primary" type="submit">Update</MDBBtn>
                        </form>
                    </div>
                </div>

                <Charts RefreshComponent={this.RefreshComponent} />

            </div>
        );
    }
}
