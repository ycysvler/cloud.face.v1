import React from 'react';
import ReactDOM from "react-dom";
import {HashRouter as Router,Redirect, Switch, Route} from 'react-router-dom';

import NotFound from './notfound';

import Main from './main/index';


ReactDOM.render((
    <Router>
        <Switch>
            <Redirect exact from='/' to='/main'/>
            <Route path="/main" component={Main}/>
            <Route component={NotFound}/>
        </Switch>
    </Router>
), document.getElementById('root'));


