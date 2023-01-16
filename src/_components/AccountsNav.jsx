import React, { useState } from "react";
import { NumericFormat } from 'react-number-format';

function AccountsNav(props) {
	return(
                <ul className="nav nav-pills flex-column accounts-nav">
                    <li className="nav-item">
                        <a onClick={(catId) => props.handleClickAccountsNavItem('')} className={`nav-link ${props.activeBankAccount == 0 && 'active'}`}>
                            All Accounts
                        </a>
                    </li>
                    {props.bankAccountCategoriesWithTotals.map(category => {
                            return (    
                                <li key={category.id} className="nav-item">
                                    <a onClick={(cat) => props.handleClickAccountsNavItem(category)} className={`nav-link ${props.activeBankAccount.id == category.id && 'active'}`}>
                                        <div className="account-balance-list-name">{category.category_title} </div>
                                        <div className="account-balance-list-amount">
                                            <NumericFormat value={category.bankBalance.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={''} />
                                        </div>
                                    </a>
                                </li>
                            )
                     })}

                </ul>
	);
}


export { AccountsNav };

