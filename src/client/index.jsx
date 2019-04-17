import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Container } from 'reactstrap'
import '@fortawesome/fontawesome-free/js/all.js'

import './style/main.less'

import TopHeader from './TopHeader.jsx'
import Welcome from './Welcome.jsx'
import NotFound from './NotFound.jsx'
import South from './South.jsx'
import North from './North.jsx'
import Engine from '../engine/Engine.jsx'
import ConfigureApi from '../north/ConfigureApi.jsx'
import ConfigureProtocol from '../south/ConfigureProtocol.jsx'

const Main = () => (
  <Router>
    <>
      <TopHeader />
      <Container fluid>
        <Switch>
          <Route exact path="/" component={Welcome} />
          <Route exact path="/engine" component={Engine} />
          <Route exact path="/south" component={South} />
          <Route exact path="/south/:protocol" component={ConfigureProtocol} />
          <Route exact path="/north" component={North} />
          <Route exact path="/north/:api" component={ConfigureApi} />
          <Route component={NotFound} />
        </Switch>
      </Container>
    </>
  </Router>
)

ReactDOM.render(<Main />, document.getElementById('root'))