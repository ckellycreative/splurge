import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect, useLocation } from 'react-router-dom';
import moment from 'moment'
import { Role } from '@/_helpers';
import { accountService, transactionService, categoryService, alertService } from '@/_services'
import { Nav, PrivateRoute, Alert } from '@/_components';
import { Accounts } from '@/accounts';
import { Plan } from '@/plan';
import { Reports } from '@/reports';
import { Dashboard } from '@/dashboard';
import { Profile } from '@/profile';
import { Admin } from '@/admin';
import { Account } from '@/account';

function App() {
    const { pathname } = useLocation();  
    //User
    const [user, setUser] = useState({});


    useEffect(() => {
        const subscription = accountService.user.subscribe(x => setUser(x));
        return subscription.unsubscribe;
    }, []);




    return (
            <div className='container-fluid bg-light'>
                <div className="row flex-nowrap">
                    
                    <Nav />
                    
                    <div className="col py-3">
                        <Alert />
                        <Switch>
                            <Redirect from="/:url*(/+)" to={pathname.slice(0, -1)} />
                            <PrivateRoute exact path="/" component={Dashboard} />
                            <PrivateRoute path="/accounts" component={Accounts} />
                            <PrivateRoute path="/plan" component={Plan} />
                            <PrivateRoute path="/reports" component={Reports} />
                            <PrivateRoute path="/profile" component={Profile} />
                            <PrivateRoute path="/admin" roles={[Role.Admin]} component={Admin} />
                            <Route path="/account" component={Account} />
                            <Redirect from="*" to="/" />
                        </Switch>
                    </div>
                </div>
            </div>
    );
}

export { App }; 