import React, { useState, useEffect } from 'react';
import { NavLink, Route } from 'react-router-dom';
import SplurgeLogo from '../img/splurge-logo-reverse.svg';
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
        <nav className="navbar navbar-expand navbar-dark bg-dark">
            <div className="container-fluid">
                <NavLink exact to="/" className="nav-link navbar-brand text-white me-3" activeClassName="">
                   <div style={ {width:'86px'} } dangerouslySetInnerHTML={{__html: SplurgeLogo}} />
                </NavLink>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <NavLink to="/accounts" className="nav-link">Accounts</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/plan" className="nav-link">Plan</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/reports" className="nav-link">Reports</NavLink>
                        </li>
                     </ul>
                </div>

                <div className="btn-group dropdown">
                    <i className="bi-person-circle text-white" role="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="User"></i>
                    <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                        <li><span className="dropdown-item-text fs-9">{user.firstName} {user.lastName}</span></li>
                        {user.role === Role.Admin &&
                        <li className="nav-item">
                            <NavLink to="/admin" className="dropdown-item">Admin</NavLink>
                            <Route path="/admin" component={AdminNav} />
                        </li>
                        }
                        <li className="nav-item">
                            <NavLink to="/profile" className="dropdown-item">Profile</NavLink>
                        </li>
                        <li className="nav-item">
                            <a onClick={accountService.logout} className="dropdown-item">Logout</a>
                        </li>
                     </ul>
                </div>

            </div>
        </nav>

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