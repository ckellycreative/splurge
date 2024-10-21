import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment'
import { animated, useTransition } from "react-spring"

import { transactionService, categoryService, alertService } from '@/_services'
import { TransactionForm } from '../_components/TransactionForm'
import { TransactionList } from '../_components/TransactionList'
import { AccountsNav } from '../_components/AccountsNav'
import { AccountsForm } from '../_components/AccountsForm'
import { CategorySelectOptions } from '../_components/CategorySelectOptions'
import { Spinner } from '../_components/Spinner'





function Accounts() {
    // "Accounts" in this context means cash and tracking accounts. In database they are Categories 

    //Categories, CashTrackingAccounts
    const [categories, setCategories] = useState([])
    const [categoriesAreLoaded, setCategoriesAreLoaded] = useState(false)
    const [cashTrackingAccountsWithTotals, setCashTrackingAccountsWithTotals] = useState([])
    const [cashTrackingAccountsWithTotalsAreLoaded, setCashTrackingAccountsWithTotalsAreLoaded] = useState(false)
    const [activeCashTrackingAccount, setActiveCashTrackingAccount] = useState('')
    const [activeCategory, setActiveCategory] = useState('')
    const [showAddAccountForm, setShowAddAccountForm] = useState(false)
    const [bankAccountIsDeleting, setBankAccountIsDeleting] = useState(false)
    const [bankAccountIsPosting, setBankAccountIsPosting] = useState(false)
    //Transactions
    const [transactions, setTransactions] = useState([])
    const [transactionIsDeleting, setTransactionIsDeleting] = useState(false)
    const [transactionIsPosting, setTransactionIsPosting] = useState(false)
    const [transactionsAreLoaded, setTransactionsAreLoaded] = useState(false)
    const [transactionsCount, setTransactionsCount] = useState('')
    const defaultTransactionsLimit = 100
    const defaultTransactionsLimitIncrement = 100
    const [transactionsLimit, setTransactionsLimit] = useState(defaultTransactionsLimit)
    const [editingTransaction, setEditingTransaction] = useState(null)
    //Reconcile
    const [reconcilingTransaction, setReconcilingTransaction] = useState('')
    const [reconcilingTransactionIsUpdating, setReconcilingTransactionIsUpdating] = useState(false)
    const [completeReconcileAccountIsUpdating, setCompleteReconcileAccountIsUpdating] = useState(false)
    const [unclearedTransactionsTotal, setUnclearedTransactionsTotal] = useState(0)
    const [clearedTransactionsTotal, setClearedTransactionsTotal] = useState(0)
    const [beginningBalance, setBeginningBalance] = useState(0)
    //Drawer
    const [showDrawer, setShowDrawer] = useState();
    const transitions = useTransition(showDrawer, {
        from: { position: "fixed", right: '-320px', width: '320px', opacity: 0 },
        enter: { right: '0', opacity: 1 },
        leave: { right: '-320px', opacity: 0 }
    });



    const dataIsLoading = 
    (
        !categoriesAreLoaded ||
        !transactionsAreLoaded ||
        !cashTrackingAccountsWithTotalsAreLoaded 
    ) ? true : false






    /* ----------
        Fetch Data  
    -------------*/


    useEffect(() => {
        function getCategories() {
            setCategoriesAreLoaded(false);
            categoryService.getAll()
                .then((data) => {
                    setCategoriesAreLoaded(true);
                    setCategories(data)
                    console.log('data', data)
                })
                .catch(error => {
                    //alertService.error(error)
                    console.log(error)
                });
        };
        getCategories()
    }, [])  




    useEffect(() => {
        function getCashTrackingAccountsWithTotals() {
            setCashTrackingAccountsWithTotalsAreLoaded(false);
            categoryService.getCashTrackingAccountsWithTotals('3000-01-01') // Use this future date to get all past and future transactions 
            .then((data) => {
                setCashTrackingAccountsWithTotals(data)
                setCashTrackingAccountsWithTotalsAreLoaded(true);
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
            });
        }
        getCashTrackingAccountsWithTotals()
    }, [transactions])  






    useEffect(() => {
        function getTransactions() {
            setTransactionsAreLoaded(false)
            const activeCashTrackingAccountId = (!activeCashTrackingAccount) ? 0 : activeCashTrackingAccount.id  //  0 activeCashTrackingAccount will return all categories from the API
            const activeCategoryId = (!activeCategory) ? 0 : activeCategory  //  0 activeCategory will return all categories from the API
            transactionService.getAll(activeCashTrackingAccountId, activeCategoryId, transactionsLimit) 
            .then((data) => {
                setTransactionsAreLoaded(true);
                setTransactions(data.transactions);
                setTransactionsCount(data.count);
            })
            .catch(error => {
                //alertService.error(error)
                console.log('error', error)
            });
        }
        getTransactions()
    }, [
        activeCashTrackingAccount, 
        activeCategory, 
        transactionsLimit, 
        !transactionIsDeleting, 
        !transactionIsPosting, 
        !reconcilingTransactionIsUpdating, 
        !completeReconcileAccountIsUpdating,
        !bankAccountIsDeleting,
        !bankAccountIsPosting
        ])  








    /* ----------
        Handlers  
    -------------*/


    useEffect(() => {
        function handleClearedTransactionsTotal() {
            let activeCashTrackingAccountBankBalance = 0
            let uct = 0
            let ct = 0
            transactions.map(transaction => {
                if (transaction.reconcile == 0) { 
                    uct += (transaction.credit - transaction.debit) 
                }
                if (transaction.reconcile == 1) { 
                    ct += (transaction.credit - transaction.debit) 
                }
                cashTrackingAccountsWithTotals.map(acct => {
                    if (acct.id == activeCashTrackingAccount.id){
                        activeCashTrackingAccountBankBalance = acct.bankBalance
                    }
                })
                setUnclearedTransactionsTotal(uct)
                setClearedTransactionsTotal(ct)
                setBeginningBalance( +activeCashTrackingAccountBankBalance - uct - ct) //activeCashTrackingAccount is set intially but doesnt update with new/deleted transactions

            })
        }
        handleClearedTransactionsTotal()
    }, [transactions, cashTrackingAccountsWithTotals])  




     const handleClickEditTransaction = (t) => {
        setEditingTransaction(t)
     }


   const handleClickCancelDrawer = () => {
        setShowDrawer()
        setEditingTransaction(null)

    }




    const handleEditingTransaction = () => {
        (editingTransaction == null) ? setShowDrawer() : setShowDrawer((prevState) => !prevState)
    }
    useEffect(() => {
        handleEditingTransaction()
    }, [editingTransaction])  
    







     const handleClickAccountsNavItem = (cat) => {
        setActiveCashTrackingAccount(cat)
        setTransactionsLimit(defaultTransactionsLimit)
     }
        

    const handleClickDeleteTransaction = () => {
        if (confirm("Are you sure you want to delete this transaction?") == true) {
            let isTransferChild = (editingTransaction.ParentTransaction) ? true : false
            let tId = (isTransferChild) ? editingTransaction.ParentTransaction.id : editingTransaction.id
            setTransactionIsDeleting(true)
            transactionService.delete(tId)
                .then((res) => {
                    setTransactionIsDeleting(false)
                    setEditingTransaction(null)
                    setShowDrawer()
                })
                .catch(error => {
                    alertService.error(error);
                });        
        }
    }

    const handlClickShowMore = () => {
        setTransactionsLimit(transactionsLimit + defaultTransactionsLimitIncrement)
    }


    const handleClickReconcileTransaction = (t) => {
        setReconcilingTransaction(t.id)
        setReconcilingTransactionIsUpdating(true)
        let params = {
            id: t.id,
            ChildTransactions: t.ChildTransactions,
            reconcile: (t.reconcile == 0 ? 1 : 0 )
        }
        transactionService.update(params)
            .then((res) => {
                setReconcilingTransaction('')
                setReconcilingTransactionIsUpdating(false)
            })
            .catch(error => {
                alertService.error(error);
            });        
        
    }

    const handleClickCompleteReconcileAccount = () => {
        alertService.clear();
        setCompleteReconcileAccountIsUpdating(true)
        let updatedTransactions = [] 
        transactions.map((t) => {
            if (t.reconcile == 1 ) {
                    t.reconcile = 2
                    updatedTransactions.push(t)
            }
        })
        transactionService.bulkCreate(updatedTransactions)
            .then((res) => {
                alertService.success('Account Reconciled');
                setCompleteReconcileAccountIsUpdating(false)
            })
            .catch(error => {
                alertService.error(error);
            });        

    }

 

    const handleChangeCategoryFilter = (e) => {
        if (e == ''){
            setActiveCategory('')
        }else {
            e.preventDefault()
            setActiveCategory(e.target.value)
        }
    }


    const handleDeleteAccount = () => {
        if (confirm("Deleting an account will delete all of its transactions. Are you sure?") == true) {
            setBankAccountIsDeleting(true)
            alertService.clear();
            categoryService.delete(activeCashTrackingAccount.id)
                .then((res) => {
                    alertService.success('Deleted');
                    setActiveCategory('')
                    setActiveCashTrackingAccount('')
                    setBankAccountIsDeleting(false)
                })
                .catch(error => {
                    alertService.error(error);
                });        
        } else {
            return null
        }        
    }






    return (
        <React.Fragment>
            
           <div className="row">
                <div className="col-md-6">
                    <h1>{(activeCashTrackingAccount) ? activeCashTrackingAccount.category_title : 'All Accounts'}</h1>
                </div>
                <div className="col-md-6 text-end">
                    { activeCashTrackingAccount  &&
                        <div>

                            <div className="dropdown d-inline-block">
                              <button className="btn btn-outline-secondary btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Actions
                              </button>
                              <ul className="dropdown-menu">
                                <li><a className="dropdown-item" onClick={handleDeleteAccount}>Delete Account</a></li>
                              </ul>
                            </div>

                            &nbsp;

                            <div className="dropdown d-inline-block">
                              <button className="btn btn-outline-secondary btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Reconcile
                              </button>
                              <div className="dropdown-menu">
                                <div className="dropdown-item-text fs-8">Does your bank balance match?: <br /><span className="fw-bold">{(beginningBalance + clearedTransactionsTotal  ).toFixed(2)}</span></div>
                                <div className="dropdown-item-text">
                                    <button onClick={() => handleClickCompleteReconcileAccount()} type="button" className="btn btn-success btn-sm">Yes</button>
                                    &nbsp;
                                    <button  type="button" className="btn btn-secondary btn-sm">No</button>
                                </div>

                              </div>
                            </div>
                        </div>
                    }                    
                </div>
            </div>


            <div className="row Accounts mt-3">

                { dataIsLoading &&
                    <Spinner spinnerIcon='border' overlay={true} textColor="primary" />
               }

                <div className=" col-md-3 AccountsNav-wrap">
                    
                    {cashTrackingAccountsWithTotals &&
                        <AccountsNav cashTrackingAccountsWithTotals={cashTrackingAccountsWithTotals} activeCashTrackingAccount={activeCashTrackingAccount} handleClickAccountsNavItem={handleClickAccountsNavItem} />
                    }
                    <button onClick={() => setShowAddAccountForm((prevState) => !prevState)} type="button" className="btn btn-link mb-3 fs-8"><i className="bi-plus" role="button" aria-label="Add Account"></i>Add Account</button>
                    {
                        showAddAccountForm &&
                        <AccountsForm setBankAccountIsPosting={setBankAccountIsPosting} setShowAddAccountForm={setShowAddAccountForm}/>
                    }


                </div>
                <div className="col-md-9 main">
                   
                  
                    <div>
                        <button className="btn btn-primary mb-3 me-2" onClick={() => setShowDrawer((prevState) => !prevState)}>
                          New Transaction
                        </button>

                        <div className='d-inline-block mb-3'>
                            <div className='input-group input-group-sm'>
                                <select onChange={(e) => handleChangeCategoryFilter(e)} value={activeCategory} component="select" className={'form-control CategorySelect'}>
                                    <CategorySelectOptions categories={categories} categoryType="all" defaultOption="Filter Transactions" />
                                </select>
                                {activeCategory &&
                                    <button onClick={() => handleChangeCategoryFilter('')} className="btn btn-secondary" type="button" id="button-addon2"><i className="bi-slash-circle"></i></button>
                                }
                            </div>
                        </div>

                    </div>


                    <TransactionList 
                        transactions={transactions}
                        transactionsAreLoaded={transactionsAreLoaded}
                        transactionsCount={transactionsCount}
                        transactionsLimit={transactionsLimit}
                        categories={categories}
                        activeCashTrackingAccount={activeCashTrackingAccount}
                        activeCategory={activeCategory}
                        handleClickEditTransaction={handleClickEditTransaction} 
                        handleClickReconcileTransaction={handleClickReconcileTransaction} 
                        reconcilingTransaction={reconcilingTransaction}
                        reconcilingTransactionIsUpdating={reconcilingTransactionIsUpdating}
                        handlClickShowMore={handlClickShowMore}
                        handleChangeCategoryFilter={handleChangeCategoryFilter}
                    />


                    <div className="drawer-container">
                        {transitions(({ position, right, opacity, width }, item) => (
                            <animated.div
                              style={{ opacity: opacity}}
                              className="drawer-overlay"
                            >
                                <animated.div style={{ right: right, position: position, width: width }} className="drawer" >
                                <button onClick={() => handleClickCancelDrawer()} type="button" className="btn-close position-absolute top-0 end-0 m-4" aria-label="Cancel"></button>
                                   <TransactionForm 
                                        setTransactionIsPosting={setTransactionIsPosting} 
                                        categories={categories}
                                        editingTransaction={editingTransaction}
                                        setEditingTransaction={(arr) => setEditingTransaction(arr)}
                                        setShowDrawer={() => setShowDrawer()}
                                        handleClickCancelDrawer={handleClickCancelDrawer}
                                        handleClickDeleteTransaction={handleClickDeleteTransaction} 
                                    />

                                </animated.div>
                                <div className="drawer-fill" onClick={() => handleClickCancelDrawer() /*Sets back to undefined */ } />
                            </animated.div>
                        ))}
                    </div>

                </div>
            </div>
        </React.Fragment>
    );
}

export { Accounts };

