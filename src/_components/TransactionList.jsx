import React, { useState, useEffect } from 'react';
import { alertService, transactionService } from '@/_services';
import { NumericFormat } from 'react-number-format';
import moment from 'moment'


function TransactionList(props) {
	return(

            <div>

                {
                    props.transactions.length == 0
                    &&
                    props.transactionsAreLoaded
                    &&
                    'No transactions were found.'
                    ||
              
                    <table className="table table-sm table-hover outside-borders  fs-8 TransactionList">
                        <thead>
                            <tr className="table-subhead no-hover">
                                <th className="">Date</th>
                                <th className="">&nbsp;</th>
                                <th className="">Description</th>
                                <th className="text-end">Amount</th>
                                <th className="text-center">{ props.activeCashTrackingAccount && 'Reconcile' }</th>
                                <th className="">Account</th>
                                <th className="">Category</th>
                            </tr>
                        </thead>
                        <tbody>
                                {
                                    props.transactions.map(transaction => {
                                        let childCategoryTitle = (transaction.ChildTransactions.length > 0) ? transaction.ChildTransactions[0].category.category_title : '' ;
                                        let parentCategoryTitle = (transaction.ParentTransaction) ? transaction.ParentTransaction.category.category_title : ''
                                        let isTransferChild = (transaction.ParentTransaction) ? true : false
                                        let isTransferParent = (transaction.category.category_type == 'cash' && transaction.ChildTransactions.length > 0 && transaction.ChildTransactions[0].category.category_type == 'cash') ? true : false
                                        let isTransferParentBeingFiltered = (transaction.category.id == props.activeCategory)
                                        return (    
                                            <tr key={transaction.id} className={transaction.reconcile == 2 ? 'no-hover' : ''} >
                                                <td className="table-column-date">{moment.utc(transaction.transaction_date).format('M/D/YY')}</td>

                                                <td className="text-center">
                                                    { transaction.reconcile == 2 &&
                                                        <i className='bi-lock text-muted'></i>
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        transaction.reconcile != 2 &&

                                                            <a className="d-block fw-semibold" onClick={transaction.reconcile != 2 ? (id) => props.handleClickEditTransaction(isTransferChild ? transaction.ParentTransaction : transaction) : undefined}>
                                                                {transaction.transaction_description}
                                                            </a>
                                                        ||
                                                            <span>
                                                                {transaction.transaction_description}
                                                            </span>
                                                    }
                                                </td>
                                                <td className="text-end">
                                                    <NumericFormat 
                                                        value={`${transaction.debit == 0  ? transaction.credit : transaction.debit}` } 
                                                        displayType={'text'} 
                                                        thousandSeparator={true} 
                                                        prefix={`${(transaction.debit == 0 || isTransferParentBeingFiltered)  ? "+" : "-"}`} 
                                                    />
                                                </td>

                                                <td className="text-center">
                                                    { props.activeCashTrackingAccount != 0 && props.reconcilingTransaction != transaction.id &&
                                                        <i 
                                                            className={`bi-${(transaction.reconcile == 1) ? 'check-square-fill text-info' : ''}${(transaction.reconcile == 0)  ? 'dash-square' : ''} `}
                                                            onClick={(t) => props.handleClickReconcileTransaction(transaction)}
                                                        >
                                                        </i>
                                                    }

                                                    { props.reconcilingTransaction == transaction.id && props.reconcilingTransactionIsLoading &&
                                                        <div  className="spinner-grow spinner-grow-sm text-primary" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    }
                                                </td>


                                                
                                                <td>{transaction.category.category_title}</td>
                                                
                                                <td>
                                                    {!isTransferChild && !isTransferParent && childCategoryTitle}
                                                    {(isTransferParent && !isTransferParentBeingFiltered ) && <span>Transfer to: {childCategoryTitle}</span>}
                                                    {(isTransferChild && !isTransferParentBeingFiltered) && <span>Transfer from: {parentCategoryTitle}</span>}
                                                    {isTransferParentBeingFiltered  && <span>Transfer from: {transaction.category.category_title}</span>}

                                                </td>
                                            </tr>
                                       )

                                    })
                                }
                        </tbody>
                    </table>                                
                }
                    {
                        props.transactionsCount > props.transactionsLimit &&
                        <div><button onClick={() => props.handlClickShowMore()} type="button" className="btn btn-link">Show More</button></div>
                    }

            </div>
	);
}


export { TransactionList };

