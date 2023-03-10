import React, { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format';
import moment from 'moment'
import { categoryService, transactionService, planService, alertService } from '@/_services'
import { CategoryForm } from '../_components/CategoryForm'
import { CategorySelectOptions } from '../_components/CategorySelectOptions'
import { PlanSavingsList } from '../_components/PlanSavingsList'
import  { PlanIncomeExpenseList }  from '../_components/PlanIncomeExpenseList'
import { Modal } from '../_components/Modal'




function Plan() {

    const [activeMonthYear, setActiveMonthYear] = useState(moment().format('YYYY-MM'));
    const [incomeArr, setIncomeArr] = useState([])
    const [expenseArr, setExpenseArr] = useState([])
    const [savingsArr, setSavingsArr] = useState([])
    const [investmentsArr, setInvestmentsArr] = useState([])
    const [planIncomeTotal, setPlanIncomeTotal] = useState(0)
    const [planExpenseTotal, setPlanExpenseTotal] = useState(0)
    const [planSavingsTotal, setPlanSavingsTotal] = useState(0)
    const [planInvestmentsTotal, setPlanInvestmentsTotal] = useState(0)
    const [actualIncomeTotal, setActualIncomeTotal] = useState(0)
    const [actualExpenseTotal, setActualExpenseTotal] = useState(0)
    const [actualInvestmentsTotal, setActualInvestmentsTotal] = useState(0)
    const [categories, setCategories] = useState([])
    const [categoriesAreLoaded, setCategoriesAreLoaded] = useState(false)
    const [cashTrackingAccountsWithTotals, setCashTrackingAccountsWithTotals] = useState([])
    const [cashTrackingAccountsWithTotalsAreLoaded, setCashTrackingAccountsWithTotalsAreLoaded] = useState(false)
    const [cashAccountsTotal, setCashAccountsTotal] = useState(0)
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [deleteCategory, setDeleteCategory] = useState('');
    const [deleteCategoryHasTransactions, setDeleteCategoryHasTransactions] = useState(false);
    const [deleteCategoryHasLoaded, setDeleteCategoryHasLoaded] = useState(false);
    const [radioValue, setRadioValue] = useState(''); 
    const [transferToCategory, setTransferToCategory] = useState('') //id
    const [editCategory, setEditCategory] = useState('')
    const [newCategoryTitle, setNewCategoryTitle] = useState('')
    const [editPlan, setEditPlan] = useState('')
    const [newPlanAmount, setNewPlanAmount] = useState('')

    const dataIsLoading = 
    (
        !categoriesAreLoaded ||
        !cashTrackingAccountsWithTotalsAreLoaded ||
        !expenseArr ||
        !incomeArr ||
        !savingsArr ||
        !investmentsArr
    ) ? true : false



/*****************
    
    Fetch Data

****************** */

    const getAllWithTotalByDate = () => {
        let startDate = `${activeMonthYear}-01` 
        let lastDayOfEndMonth = moment(`${activeMonthYear}`, "YYYY-MM").daysInMonth()
        let endDate = `${activeMonthYear}-${lastDayOfEndMonth}`
        categoryService.getAllWithTotalByDate(startDate, endDate)
            .then((data) => {

                let groupTotalPlan = 0
                let groupTotalActual = 0
                let calcPlanExpenseTotal = 0
                let calcActualExpenseTotal = 0
                let calcPlanIncomeTotal = 0
                let calcActualIncomeTotal = 0
                let calcPlanSavingsTotal = 0
                let calcActualSavingsTotal = 0
                let calcPlanInvestmentsTotal = 0
                let calcActualInvestmentsTotal = 0
                let tmpExpenseArr = []
                let tmpIncomeArr =[]
                let tmpSavingsArr =[]
                let tmpInvestmentsArr =[]
                
                data.map( (cat, index, array) => {
                    if (cat.category_type == 'expense' || cat.category_type == 'income' || cat.category_type == 'investment' ) {
                        let isIncome = (cat.category_type == 'income') ? true : false
                        let isInvestment = (cat.category_type == 'investment') ? true : false
                        let nextIsNewCategoryGroup = (array[index+1] && array[index+1].category_title != cat.category_title) ? true : false    

                        if (isIncome) {
                            tmpIncomeArr.push(cat)
                        }else if (isInvestment) {
                            tmpInvestmentsArr.push(cat)
                        } else {
                            tmpExpenseArr.push(cat)
                        }

                        groupTotalPlan += +cat.CategoryPlan.planAmount
                        groupTotalActual += cat.totalReportAmountDebit - cat.totalReportAmountCredit

                        if (isIncome) {
                            calcPlanIncomeTotal += +cat.CategoryPlan.planAmount 
                            calcActualIncomeTotal += cat.totalReportAmountDebit - cat.totalReportAmountCredit  
                        }else if (isInvestment) {
                            calcPlanInvestmentsTotal += +cat.CategoryPlan.planAmount 
                            calcActualInvestmentsTotal += cat.totalReportAmountDebit - cat.totalReportAmountCredit  
                        }else {
                            calcPlanExpenseTotal += +cat.CategoryPlan.planAmount 
                            calcActualExpenseTotal += cat.totalReportAmountDebit - cat.totalReportAmountCredit  
                        }
                        if (nextIsNewCategoryGroup) {
                            //Is there a better way to get this grpId? This gets used for a key
                            let groupTotalObj = {grpid:cat.id + cat.ChildCategory.id + cat.category_title , groupCategoryTitle: cat.category_title, groupCategoryType: cat.category_type, groupTotalPlan, groupTotalActual }
                            if (isIncome) {
                                tmpIncomeArr.push(groupTotalObj)
                            }else if (isInvestment) {
                                tmpInvestmentsArr.push(groupTotalObj)
                            }else {
                                tmpExpenseArr.push(groupTotalObj)
                            }
                            groupTotalPlan = 0
                            groupTotalActual = 0
                        }
                    }

                    if (cat.category_type == 'savings') {
                        let nextIsNewCategoryGroup = (array[index+1] && array[index+1].category_title != cat.category_title) ? true : false    
                        tmpSavingsArr.push(cat)
                        groupTotalPlan += +cat.CategoryPlan.planAmount
                        groupTotalActual = 0  //Not using the actual totals yet (not sure if/how)
                        calcPlanSavingsTotal += +cat.CategoryPlan.planAmount
                        calcActualSavingsTotal = 0 //Not using the actual totals yet (not sure if/how)
                        if (nextIsNewCategoryGroup) {
                            let groupTotalObj = {grpid:cat.id , groupCategoryTitle: cat.category_title, groupTotalPlan, groupTotalActual }
                            tmpSavingsArr.push(groupTotalObj)
                            groupTotalPlan = 0
                            groupTotalActual = 0
                        }
                    }

                })

                setExpenseArr(tmpExpenseArr)
                setIncomeArr(tmpIncomeArr)
                setSavingsArr(tmpSavingsArr)
                setInvestmentsArr(tmpInvestmentsArr)
                setPlanIncomeTotal(calcPlanIncomeTotal)
                setPlanExpenseTotal(calcPlanExpenseTotal)
                setPlanSavingsTotal(calcPlanSavingsTotal)
                setPlanInvestmentsTotal(calcPlanInvestmentsTotal)
                setActualIncomeTotal(calcActualIncomeTotal)
                setActualExpenseTotal(calcActualExpenseTotal)        
                setActualInvestmentsTotal(calcActualInvestmentsTotal)        

            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
            });
    };
    useEffect(() => {
        getAllWithTotalByDate()
    }, [activeMonthYear])  




const getCategories = () => {
        categoryService.getAll()
            .then((data) => {
                setCategoriesAreLoaded(true);
                setCategories(data)
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
            });
    };
    useEffect(() => {
        getCategories()
    }, [])  





    const getCashTrackingAccountsWithTotals = () => {
        let lastDayOfLastMonth = moment(activeMonthYear).subtract(1,'months').endOf('month').format('YYYY-MM-DD');
        categoryService.getCashTrackingAccountsWithTotals(lastDayOfLastMonth) //Here the date is the last day of the previous month
            .then((data) => {
                setCashTrackingAccountsWithTotals(data)
                setCashTrackingAccountsWithTotalsAreLoaded(true);
                let total = 0
                data.map( cat => {
                     //We dont include tracking accounts in the available cash
                    if (cat.category_type == 'cash'){
                        total += +cat.bankBalance
                    }
                })
                setCashAccountsTotal(total)
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
            });
    };
    useEffect(() => {
        getCashTrackingAccountsWithTotals()
    }, [activeMonthYear])  





/*****************
    
    Modal
    
****************** */

    const handleShowModalDelete = (id) => {   //Actions: 'edit' 'delete'
        //Clear all state values
        setRadioValue('')
        setDeleteCategoryHasLoaded(false)
        setDeleteCategoryHasTransactions(false)

        categoryService.getById(id)
            .then((data) => {
                setDeleteCategory(data)
                setDeleteCategoryHasLoaded(true)
                if (data.CategoryTransactions.length == 0) {
                    setDeleteCategoryHasTransactions(false)
                }else {
                    setDeleteCategoryHasTransactions(true)
                }     
                setShowModalDelete(true)            
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
            });
    }


/*****************
    
    Update Category Title
    
****************** */


    const handleClickEditCategory = (id, title) => {
        setNewCategoryTitle(title)
        setEditCategory(id)
    }


    const handleChangeNewCategoryTitle = (e) => {
        setNewCategoryTitle(e.target.value)
    }


    const handleUpdateCategory = (e) => {
        
        if (e.key && e.key !== 'Enter') {
            return
        }

        let newCat = {
            id: editCategory,
            category_title: newCategoryTitle
        }
        categoryService.update(newCat)
            .then((data) => {
                getAllWithTotalByDate()
                setNewCategoryTitle('')
                setEditCategory('')
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
        });
    }



/*****************
    
    Handle Hide Category
    
****************** */

    const handleClickHideCategory = (id, hasAmts) => {
        alertService.clear();
        categoryService.update({id, hidden:1})
            .then((data) => {
                getAllWithTotalByDate()
                if (hasAmts) {
                    alertService.error('This category has actual amounts this month. It will be hidden in future months. Go to "hidden categories" to unhide categories.')
                }else {
                    alertService.success('The category has been hidden. Go to "hidden categories" to unhide categories.')
                }
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
        });

    }







/*****************
    
    Delete Category
    
****************** */

    const handleClickDeleteCategory = () => {
            alertService.clear();
            categoryService.delete(deleteCategory.id)
                .then((res) => {
                    alertService.success('Deleted');
                    setShowModalDelete('')
                    setDeleteCategory('')
                    getAllWithTotalByDate()
                    getCategories()
                })
                .catch(error => {
                    alertService.error(error);
                });        
    }

    // Choose options
    const handleChangeInput = (e) => {  // values are 'delete', 'transfer', 'hide'
        setRadioValue(e.target.value)

    }

    //Select category to transfer transactions to
    const handleChangeSelectCategory = (e) => {
        setTransferToCategory(e.target.value)

    }

    const handleTransferTransactions = () => {
            alertService.clear();
           let transferTransactions = []
           deleteCategory.CategoryTransactions.map( t => {
               let obj = {
                id: t.id,
                categoryId: transferToCategory
               }
               transferTransactions.push(obj)
            })

        transactionService.bulkCreate(transferTransactions)
                .then((res) => {
                    handleClickDeleteCategory()
                })
                .catch(error => {
                    alertService.error(error);
                });        
    }



/*****************
    
    Edit Plan
    
****************** */


    const handleClickEditPlan = (planId, amt, childCatId) => {
        if (planId == null) {
            let newPlan = {
                categoryId: childCatId,
                created: activeMonthYear + "-01"
            }
            
            planService.create(newPlan)
                .then((data) => {
                    getAllWithTotalByDate()
                    setEditPlan(data.id)
                })
                .catch(error => {
                    //alertService.error(error)
                    console.log(error)
            });
        }else {
            setNewPlanAmount(amt)
            setEditPlan(planId)
        }
    }

    const handleChangePlanAmount = (e) => {
        setNewPlanAmount(e.target.value)
    }

    const handleUpdatePlan = (e) => {

        if (e.key && e.key !== 'Enter') {
            return
        }

        let newPlan = {
            id: editPlan,
            planAmount: newPlanAmount
        }

        planService.update(newPlan)
            .then((data) => {
                getAllWithTotalByDate()
                setNewPlanAmount('')
                setEditPlan('')
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
        });
    }




/*****************
    
    Month Handler
    
****************** */

    const handleClickPlanMonth = (direction) => {
        setEditPlan('')
        let newMonth = ''
        if (direction == 'back') {
            newMonth = moment(activeMonthYear).subtract(1,'months').format('YYYY-MM')            
        }else if (direction == 'forward') {
            newMonth = moment(activeMonthYear).add(1,'months').format('YYYY-MM')
        }else if (direction == 'today') {
            newMonth = moment().format('YYYY-MM')
        }
    setActiveMonthYear(newMonth)

    }





/*****************
    
    Copy Plans from Last Month
    
****************** */



    const handleCopyPlans = () => {
        let confirmText = 'This will NOT overwrite existing plan amounts.'
        if (confirm(confirmText) == true) {

            planService.copyPlanAmounts({activeMonthYear:activeMonthYear})
                .then(() => {
                    getAllWithTotalByDate()
                })
                .catch(error => {
                    //alertService.error(error)
                    console.log(error)
            })
        }


    }



    return (
        <React.Fragment>
            { dataIsLoading && 'Loader' ||
                <div className="row Plan">
                    <div className="col-md-8 main">
                        <h1>
                            <button onClick={() => handleClickPlanMonth('back')} type="button" className="btn btn-link btn-outline-secondary"><i className="bi-arrow-left-circle-fill"></i></button>
                            {moment(activeMonthYear).format('MMMM YYYY')}
                            <button onClick={() => handleClickPlanMonth('forward')} type="button" className="btn btn-link btn-outline-secondary"><i className="bi-arrow-right-circle-fill"></i></button>
                        </h1>
                        <div className="btn-group dropdown">
                          <button type="button" className="btn btn-link btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="bi-plus"></i> Add Category Group
                          </button>
                            <div className="dropdown-menu px-2" style={ {minWidth: '500px'} }>
                                <CategoryForm parentId={null} category_type='expense' isGroupForm={true} getAllWithTotalByDate={getAllWithTotalByDate} />
                            </div>
                            <button onClick={handleCopyPlans} type="button" className="btn btn-link btn-sm">
                                <i className="bi-arrow-repeat"></i> Copy over all plan amounts from last month 
                          </button>                            
                        </div>
                        <div className="row tabular-data tabular-head">
                            <div className="col-sm-2 offset-sm-6 text-end">Plan</div>
                            <div className="col-sm-2 text-end">Actual</div>
                            <div className="col-sm-2 text-end">Difference</div>
                        </div>
                        <PlanIncomeExpenseList 
                            categoryArray={incomeArr}
                            handleChangeNewCategoryTitle = {handleChangeNewCategoryTitle}
                            handleClickEditCategory = {handleClickEditCategory}
                            handleClickEditPlan = {handleClickEditPlan}
                            handleShowModalDelete = {handleShowModalDelete}
                            handleClickHideCategory={handleClickHideCategory}
                            handleUpdateCategory={handleUpdateCategory}
                            newCategoryTitle = {newCategoryTitle}
                            getAllWithTotalByDate = {getAllWithTotalByDate}
                            editCategory = {editCategory}
                            editPlan={editPlan}
                            activeMonthYear={activeMonthYear}
                            handleChangePlanAmount={handleChangePlanAmount}
                            newPlanAmount={newPlanAmount}
                            handleUpdatePlan={handleUpdatePlan}
                        />
                        <PlanIncomeExpenseList 
                            categoryArray={expenseArr}
                            handleChangeNewCategoryTitle = {handleChangeNewCategoryTitle}
                            handleClickEditCategory = {handleClickEditCategory}
                            handleClickEditPlan = {handleClickEditPlan}
                            handleShowModalDelete = {handleShowModalDelete}
                            handleClickHideCategory={handleClickHideCategory}
                            handleUpdateCategory={handleUpdateCategory}
                            newCategoryTitle = {newCategoryTitle}
                            getAllWithTotalByDate = {getAllWithTotalByDate}
                            editCategory = {editCategory}
                            editPlan={editPlan}
                            activeMonthYear={activeMonthYear}
                            handleChangePlanAmount={handleChangePlanAmount}
                            newPlanAmount={newPlanAmount}
                            handleUpdatePlan={handleUpdatePlan}
                        />

                        <div className="row tabular-data">
                            <div className="col-sm-6 fw-bold">Total Expenses</div>
                            <div className="col-sm-2 text-end"><NumericFormat value={planExpenseTotal} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>
                            <div className="col-sm-2 text-end"><NumericFormat value={actualExpenseTotal} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>
                            <div className="col-sm-2 text-end"><NumericFormat value={planExpenseTotal + actualExpenseTotal} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>
                        </div>           


                        <PlanIncomeExpenseList 
                            categoryArray={investmentsArr}
                            handleChangeNewCategoryTitle = {handleChangeNewCategoryTitle}
                            handleClickEditCategory = {handleClickEditCategory}
                            handleClickEditPlan = {handleClickEditPlan}
                            handleShowModalDelete = {handleShowModalDelete}
                            handleClickHideCategory={handleClickHideCategory}
                            handleUpdateCategory={handleUpdateCategory}
                            newCategoryTitle = {newCategoryTitle}
                            getAllWithTotalByDate = {getAllWithTotalByDate}
                            editCategory = {editCategory}
                            editPlan={editPlan}
                            activeMonthYear={activeMonthYear}
                            handleChangePlanAmount={handleChangePlanAmount}
                            newPlanAmount={newPlanAmount}
                            handleUpdatePlan={handleUpdatePlan}
                        />



                    </div>



                    <div className="col-md-4 sidebar">
                        <h2>Overview</h2>
                            <div className="row tabular-data">
                                <div className="col-sm-6 fw-bold">
                                    Total Cash At Start of Month
                                </div>
                                <div className="col-sm-6 text-end">
                                    <NumericFormat value={cashAccountsTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} />     
                                </div>           
                            </div>
                            <div className="row tabular-data tabular-head">
                                <div className="col-sm-4 offset-sm-4 text-end">Plan</div>
                                <div className="col-sm-4 text-end">Actual</div>
                            </div>

                            <div className="tabular-data row">
                                <div className="col-sm-4 fw-bold">
                                    Income
                                </div>
                                <div className="col-sm-4 text-end"><NumericFormat value={planIncomeTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>           
                                <div className="col-sm-4 text-end"><NumericFormat value={actualIncomeTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>           
                            </div>
                            <div className="tabular-data row">
                                <div className="col-sm-4 fw-bold">Expense</div>
                                <div className="col-sm-4 text-end"><NumericFormat value={planExpenseTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>           
                                <div className="col-sm-4 text-end"><NumericFormat value={actualExpenseTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>           
                            </div>
                            <div className="tabular-data row">
                                <div className="col-sm-4 fw-bold">Net</div>
                                <div className="col-sm-4 text-end"><NumericFormat value={(planIncomeTotal - planExpenseTotal).toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>
                                <div className="col-sm-4 text-end"><NumericFormat value={(actualIncomeTotal + actualExpenseTotal).toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>
                            </div>
                            <div className="tabular-data row">
                                <div className="col-sm-4 fw-bold">Investments</div>
                                <div className="col-sm-4 text-end"><NumericFormat value={planInvestmentsTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>           
                                <div className="col-sm-4 text-end"><NumericFormat value={actualInvestmentsTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>           
                            </div>

                            <div className="mt-4">
                                <PlanSavingsList 
                                    categoryArray={savingsArr}
                                    handleChangeNewCategoryTitle = {handleChangeNewCategoryTitle}
                                    handleClickEditCategory = {handleClickEditCategory}
                                    handleClickEditPlan = {handleClickEditPlan}
                                    handleShowModalDelete = {handleShowModalDelete}
                                    handleUpdateCategory={handleUpdateCategory}
                                    newCategoryTitle = {newCategoryTitle}
                                    getAllWithTotalByDate = {getAllWithTotalByDate}
                                    editCategory = {editCategory}
                                    editPlan={editPlan}
                                    handleChangePlanAmount={handleChangePlanAmount}
                                    newPlanAmount={newPlanAmount}
                                    handleUpdatePlan={handleUpdatePlan}
                                />
                            </div>



                            <div className="tabular-data row">
                                <div className="col-sm-4 fw-bold">
                                    Total Reserves
                                </div>
                                <div className="col-sm-4 text-end"><NumericFormat value={planSavingsTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>           
                                <div className="col-sm-4 text-end"><NumericFormat value={planSavingsTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>           
                            </div>

                            <div className="tabular-data row mt-4">
                                <div className="col-sm-4 fw-bold">Unallocated</div>
                                <div className="col-sm-4 text-end"><NumericFormat value={(cashAccountsTotal + (planIncomeTotal - planExpenseTotal) - planInvestmentsTotal - planSavingsTotal).toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>           
                                <div className="col-sm-4 text-end"><NumericFormat value={(cashAccountsTotal + (actualIncomeTotal + actualExpenseTotal) + actualInvestmentsTotal - planSavingsTotal).toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></div>           
                            </div>


                        </div>
                    </div>
            }

            { showModalDelete  &&
                <Modal showModal={showModalDelete} setShowModal={setShowModalDelete} title='Alert!'>


                     { deleteCategoryHasTransactions   &&
                        <div>
                            <p>This category has {deleteCategory.CategoryTransactions.length} transactions associated with it. </p>
                                
                            <div className="form-check">
                              <input onChange={(e) => handleChangeInput(e)} className="form-check-input" type="radio"name="radio_option" value="transfer" id="radio-transfer-it" />
                              <label className="form-check-label" htmlFor="radio-transfer-it">
                                Transfer transactions to another category.
                              </label>
                            </div>
                        </div>
                    }

                    { !deleteCategoryHasTransactions   &&
                        <div>
                            <p>Yippee! This category has no transactions associated with it. </p>
                            <div className="form-check">
                              <input onChange={(e) => handleChangeInput(e)} className="form-check-input" type="radio" name="radio_option" value="delete" id="radio-delete-it" />
                              <label className="form-check-label" htmlFor="radio-delete-it">
                                Go ahead and delete it.
                              </label>
                            </div>
                        </div>
                    }
                     
                    <div className="form-check">
                      <input onChange={(e) => handleChangeInput(e)} className="form-check-input" type="radio" name="radio_option" value="hide" id="radio-hide-it" />
                      <label className="form-check-label" htmlFor="radio-delete-it">
                        Hide it and save it for later.
                      </label>
                    </div>


                    { radioValue=='transfer' &&
                        <div>
                            <select onChange={handleChangeSelectCategory} name="bank_account_id" component="select" className={'form-control CategorySelect'}>
                                <CategorySelectOptions categories={categories} categoryType={(deleteCategory.category_type == 'income' ? 'incomeOnly' : 'expenseOnly')} defaultOption="Select an Account" />
                            </select>
                            <button onClick={handleTransferTransactions} type="button" className="btn btn-primary">Transfer Transactions</button>
                        </div>
                    }

                    { radioValue=='hide' &&
                        <button onClick={handleHideCategory} type="button" className="btn btn-primary">Hide it</button>
                    }

                    { radioValue=='delete' &&
                        <button onClick={handleClickDeleteCategory} type="button" className="btn btn-danger">Delete it!</button>
                    }
                </Modal>
            }


        </React.Fragment>

    );
}

export { Plan };