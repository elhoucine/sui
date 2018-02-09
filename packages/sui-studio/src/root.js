import React from 'react'
import {browserHistory, IndexRedirect, Route, Router, Redirect} from 'react-router'

import Layout from './components/layout'
import Workbench from './components/workbench'
import Demo from './components/demo'
import Documentation from './components/documentation'
import ReactDocGen from './components/documentation/ReactDocGen'
import MarkdownFile from './components/documentation/MarkdownFile'

import './index.scss'

export default (
  <Router history={browserHistory}>
    <Route path='/' component={Layout}>
      <Route path='workbench/:category/:component' component={Workbench}>
        <IndexRedirect to='demo' />
        <Route path='demo' component={Demo} />
        <Route path='documentation' component={Documentation}>
          <Route path='api' component={ReactDocGen} />
          <Route path='readme' component={(props) => <MarkdownFile {...props} file='README' />} />
          <Route path='changelog' component={(props) => <MarkdownFile {...props} file='CHANGELOG' />} />
        </Route>
      </Route>
    </Route>
    <Redirect from='**' to='/' />
  </Router>
)
