import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Authorize } from './components/Authorize';
import { NotificationContainer } from 'react-notifications';

import './custom.css'
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';

import { library } from '@fortawesome/fontawesome-svg-core'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faKey } from '@fortawesome/free-solid-svg-icons'

library.add(faEnvelope)
library.add(faKey)

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
            <Route exact path='/' component={Authorize} />

            <div style={{ marginTop: 30 }}>
                <NotificationContainer />
            </div>
      </Layout>
    );
  }
}
