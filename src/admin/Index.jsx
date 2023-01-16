import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Overview } from './Overview';
import { Users } from './users';

function Admin({ match }) {
    const { path } = match;

    return (
            <div className="container">
                <Switch>
                    <Route exact path={path} component={Overview} />
                    <Route path={`${path}/users`} component={Users} />
                </Switch>
            </div>
    );
}

export { Admin };