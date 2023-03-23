import React, { useState } from "react";
import { NumericFormat } from 'react-number-format';

function AccountsNav(props) {

	return(
        <div>
            <ul className="nav nav-pills flex-column AccountsNav">
                <li className="nav-item">
                    <a onClick={(catId) => props.handleClickAccountsNavItem(0)} className={`fw-bold nav-link ${props.activeCashTrackingAccount == 0 && 'active'}`}>
                        All Accounts
                    </a>
                </li>
                {props.cashTrackingAccountsWithTotals.map(category => {
                    if (category.category_type == 'cash') {
                        return (    
                            <li key={category.id} className="nav-item">
                                <a onClick={(catId) => props.handleClickAccountsNavItem(category.id)} className={`nav-link ${props.activeCashTrackingAccount == category.id && 'active'}`}>
                                    <div className="account-balance-list-name">{category.category_title} </div>
                                    <div className="fs-7 account-balance-list-amount">
                                        <NumericFormat value={category.bankBalance} displayType={'text'} thousandSeparator={true} prefix={''} />
                                    </div>
                                </a>
                            </li>
                        )
                    }
                 })}
            </ul>

        </div>
	);
}


export { AccountsNav };

