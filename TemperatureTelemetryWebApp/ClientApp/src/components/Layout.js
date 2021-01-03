import React, { Component } from 'react';
import { MDBNavbar, MDBNavbarBrand, MDBContainer, MDBFooter} from 'mdbreact';

export class Layout extends Component {
    static displayName = Layout.name;

    render() {
        return (
            <div>

                <MDBNavbar color="indigo" dark expand="md">
                    <MDBNavbarBrand>
                        <strong className="white-text">Temperature Telemetry Web App</strong>
                    </MDBNavbarBrand>  
                </MDBNavbar>

                <MDBContainer fluid className="childContainer">
                    {this.props.children}
                </MDBContainer>
                               
                <MDBFooter color="indigo" className="font-small pt-4 mt-4 fixed-bottom">
                    <div className="footer-copyright text-center py-3">
                        <MDBContainer fluid>
                            &copy; Copyright {new Date().getFullYear()}: <strong style={{ color: "#fff" }}> Łukasz Czepielik </strong>
                        </MDBContainer>
                    </div>
                </MDBFooter>

            </div>
        );
    }
}
