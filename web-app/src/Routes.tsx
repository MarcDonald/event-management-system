import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './Views/Home';
import NotFound from './Views/NotFound';

function Routes() {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route component={NotFound} />
      <Route path="/404" component={NotFound} />
    </Switch>
  );
}

export default Routes;
