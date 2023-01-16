import React, { useState, useEffect } from 'react';
import { NavLink, Route } from 'react-router-dom';

import { Role } from '@/_helpers';
import { accountService } from '@/_services';


function Nav() {
    const [user, setUser] = useState({});

    useEffect(() => {
        const subscription = accountService.user.subscribe(x => setUser(x));
        return subscription.unsubscribe;
    }, []);

    // only show nav when logged in
    if (!user) return null;

    return (
            <div className="col-auto col-md-2 col-xl-1 px-sm-2 px-0 bg-dark text-light min-vh-100">
                <ul className="nav flex-column mb-auto">
                    <li className="nav-item">
                        <NavLink exact to="/" className="nav-link">Splurge</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/accounts" className="nav-link">Accounts</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/plan" className="nav-link">Plan</NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/reports" className="nav-link">Reports</NavLink>
                    </li>
                    {user.role === Role.Admin &&
                    <li className="nav-item">
                        <NavLink to="/admin" className="nav-link">Admin</NavLink>
                        <Route path="/admin" component={AdminNav} />
                    </li>
                    }
                    <li className="nav-item">
                        <NavLink to="/profile" className="nav-link">Profile</NavLink>
                    </li>
                    <li className="nav-item">
                        <a href="" onClick={accountService.logout} className="nav-link">Logout</a>
                    </li>
                </ul>
            </div>

    );
}

function AdminNav({ match }) {
    const { path } = match;

    return (
                <ul className="nav mb-auto">
                    <li className="nav-item">
                        <NavLink to={`${path}/users`} className="nav-item nav-link">Users</NavLink>
                    </li>
                </ul>
    );
}

export { Nav }; 