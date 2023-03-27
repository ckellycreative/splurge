import React, { useState } from "react";
import { NumericFormat } from 'react-number-format';

function AccountsNav(props) {
    let totalCash = 0


    const accounts = props.cashTrackingAccountsWithTotals.map(category => {
        if (category.category_type == 'cash') {
            totalCash += +category.bankBalance 
            return (    
                <li key={category.id} className="nav-item">
                    <a onClick={(cat) => props.handleClickAccountsNavItem(category)} className={`row nav-link ${props.activeCashTrackingAccount.id == category.id && 'active'}`}>
                        <div className="col col-sm-9 account-balance-list-name">{category.category_title} </div>
                        <div className="col col-sm-3 account-balance-list-amount">
                            <NumericFormat value={category.bankBalance} displayType={'text'} thousandSeparator={true} prefix={''} />
                        </div>
                    </a>
                </li>
            )
        }
     })



	return(
        <div>
            <ul className="nav nav-pills flex-column AccountsNav">
                <li className="nav-item">
                    <a onClick={(cat) => props.handleClickAccountsNavItem('')} className={`row fw-bold nav-link ${!props.activeCashTrackingAccount  && 'active'}`}>
                        <div className="col col-sm-9 account-balance-list-name">All Accounts</div>
                        <div className="col col-sm-3 account-balance-list-amount">
                            <NumericFormat value={totalCash} displayType={'text'} thousandSeparator={true} prefix={''} />
                        </div>
                        
                    </a>
                </li>
                {accounts}
            </ul>

        </div>
	);
}


export { AccountsNav };

