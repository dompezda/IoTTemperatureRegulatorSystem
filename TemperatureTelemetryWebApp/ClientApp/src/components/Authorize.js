import React, { Component } from 'react';
import { NotificationManager } from 'react-notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Core } from './Core';
import axios from 'axios';

export class Authorize extends Component {
    static displayName = Authorize.name;

    //Grid + stylizacja z mdbootstrap

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
                <div>
                    <div className="grid-x grid-padding-x" style={{ marginTop: 30 }}>
                        <div className="grid-container fluid callout translucent-form-overlay small-10 medium-8 large-4 cell">
                            <div className="text-center">
                                <h2>Verification</h2>
                            </div>
                            <form onSubmit={e => this.authorizeUser(e)}>
                                <div className="grid-container">
                                    <div>
                                        <label><span><FontAwesomeIcon icon="key" /></span>Password</label>
                                        <input type="password" name="password" onChange={e => this.changeValue(e)} value={this.state.password} />
                                    </div>
                                    <div>
                                        <button className="button secondary float-center" style={{ marginBottom: 0 }} type="submit">Verify</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )
        }
    }
}
