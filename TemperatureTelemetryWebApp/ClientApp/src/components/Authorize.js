import React, { Component } from 'react';
import { NotificationManager } from 'react-notifications';
import { MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody } from 'mdbreact';
import { Core } from './Core';
import axios from 'axios';

export class Authorize extends Component {
    static displayName = Authorize.name;

    constructor(props) {
        super(props);

        this.state = {
            password: "",
            correct_password: false
        }
    }

    changeValue(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    authorizeUser = async (e) => {
        e.preventDefault();

        await axios.post("/api/TemperatureTelemetry/CheckEnteredPassword", null,
            {
                params: {
                    password: this.state.password,
                }
            }).then(res => {
                this.setState({
                    correct_password: true
                });
                NotificationManager.success('Authenticated', 'Verification');
            }).catch(err => {
                NotificationManager.error('Wrong password', 'Verification');
            })
    };

    render() {
        if (this.state.correct_password == true) {
            return (
                <Core />
            )
        }
        else {
            return (

                <MDBRow center middle>
                    <MDBCol md="4" className="mt-5">
                        <MDBCard>
                            <MDBCardBody>
                                <form onSubmit={e => this.authorizeUser(e)}>
                                    <p className="h4 text-center py-4">Verification</p>
                                    <div className="grey-text">
                                        <MDBInput
                                            label="Your password"
                                            icon="lock"
                                            group
                                            type="password"
                                            validate
                                            name="password"
                                            onChange={e => this.changeValue(e)}
                                            value={this.state.password}
                                        />
                                    </div>
                                    <div className="text-center py-4 mt-3">
                                        <MDBBtn color="indigo" type="submit">
                                            Verify
                                         </MDBBtn>
                                    </div>
                                </form>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>

            )
        }
    }
}
