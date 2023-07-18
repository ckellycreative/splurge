import React, { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format';
import moment from 'moment'
import { categoryService, transactionService, planService, alertService } from '@/_services'
import { CategoryForm } from '../_components/CategoryForm'
import { CategorySelectOptions } from '../_components/CategorySelectOptions'
import { PlanSavingsList } from '../_components/PlanSavingsList'
import  { PlanIncomeExpenseList }  from '../_components/PlanIncomeExpenseList'
import { Modal } from '../_components/Modal'
import { Spinner } from '../_components/Spinner'




function Plan() {

    const [activeMonthYear, setActiveMonthYear] = useState(moment().format('YYYY-MM'));
    const [allWIthTotalsByDateAreLoaded, setAllWIthTotalsByDateAreLoaded] = useState(false)
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
    const [editCategoryPlan, setEditCategoryPlan] = useState('')
    const [editPlan, setEditPlan] = useState('')
    const [newPlanAmount, setNewPlanAmount] = useState('')

    const dataIsLoading = 
    (
        !allWIthTotalsByDateAreLoaded ||
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
        setAllWIthTotalsByDateAreLoaded(false)
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
                            let groupTotalObj = {grpCatId: cat.id, grpid:cat.id + cat.ChildCategory.id + cat.category_title , groupCategoryTitle: cat.category_title, groupCategoryType: cat.category_type, groupTotalPlan, groupTotalActual }
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
                            let groupTotalObj = {grpCatId:cat.id , groupCategoryTitle: cat.category_title, groupTotalPlan, groupTotalActual }
                            tmpSavingsArr.push(groupTotalObj)
                            groupTotalPlan = 0
                            groupTotalActual = 0
                        }
                    }

                })
                setAllWIthTotalsByDateAreLoaded(true)
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
        setCategoriesAreLoaded(false);
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
        setCashTrackingAccountsWithTotalsAreLoaded(false);
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
    
    Edit CategoryPlan
    
****************** */

    const handleClickCategoryPlanItem = (cat) => {
        setEditCategoryPlan(cat)
    }


    const onSubmitCategoryPlanForm = ({ category_title, planAmount }, { setSubmitting, resetForm }) => {
        

            let CategoryPlan = {
                category: {
                    id: editCategoryPlan.ChildCategory.id,
                    category_title: category_title,
                    CategoryPlan: {
                        id: editCategoryPlan.CategoryPlan.id,
                        categoryId: editCategoryPlan.ChildCategory.id,
                        planAmount: planAmount,
                        created: activeMonthYear + "-01"
                    }
                }
                
            }

            planService.create(CategoryPlan)
                .then((data) => {
                    getAllWithTotalByDate()
                    setEditCategoryPlan('')
                })
                .catch(error => {
                    //alertService.error(error)
                    console.log(error)
            });




    }




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
    
    Update Category Title
    
****************** */


    const handleClickEditCategory = (id, title) => {
        setNewCategoryTitle(title)
        setEditCategory(id)
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
                <div className="row Plan">


                { dataIsLoading && 
                    <Spinner spinnerIcon='border' overlay={true} textColor="primary" />
                }

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
                                <CategoryForm parentId={null} category_type='expense' isGroupForm={true}  />
                            </div>
                            <button onClick={handleCopyPlans} type="button" className="btn btn-link btn-sm">
                                <i className="bi-arrow-repeat"></i> Copy over all plan amounts from last month 
                          </button>                            
                        </div>



                        <table className="table table-sm table-hover outside-borders fs-8 PlanIncomeExpenseListTable">
                                <PlanIncomeExpenseList 
                                    categoryArray={incomeArr}
                                    handleClickCategoryPlanItem={handleClickCategoryPlanItem}
                                    editCategoryPlan={editCategoryPlan}
                                    onSubmitCategoryPlanForm={onSubmitCategoryPlanForm}    
                                    handleClickCancelEditCategory={() => setEditCategoryPlan('')}
                                    handleClickHideCategory={handleClickHideCategory}
                                    handleShowModalDelete = {handleShowModalDelete}
                                    getAllWithTotalByDate = {getAllWithTotalByDate}
                                />
                        </table>


                        <table className="table table-sm table-hover outside-borders fs-8 PlanIncomeExpenseListTable">
                                <PlanIncomeExpenseList 
                                    categoryArray={expenseArr}
                                    handleClickCategoryPlanItem={handleClickCategoryPlanItem}
                                    editCategoryPlan={editCategoryPlan}
                                    onSubmitCategoryPlanForm={onSubmitCategoryPlanForm}    
                                    handleClickCancelEditCategory={() => setEditCategoryPlan('')}
                                    handleClickHideCategory={handleClickHideCategory}
                                    handleShowModalDelete = {handleShowModalDelete}
                                    getAllWithTotalByDate = {getAllWithTotalByDate}
                                />
                        </table>

                        <table className="table table-sm border-top fs-8 mt-3 bg-light PlanIncomeExpenseListTable">
                            <thead>
                                <tr className="">
                                    <th className="fw-bold py-3">Total Expenses</th>
                                    <th className="table-column-currency py-3"><NumericFormat value={planExpenseTotal} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></th>
                                    <th className="table-column-currency py-3"><NumericFormat value={actualExpenseTotal} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></th>
                                    <th className="table-column-currency py-3"><NumericFormat value={planExpenseTotal + actualExpenseTotal} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></th>
                                </tr>
                            </thead>
                        </table>

                        
                        <table className="table table-sm table-hover outside-borders fs-8 PlanIncomeExpenseListTable">
                                <PlanIncomeExpenseList 
                                    categoryArray={investmentsArr}
                                    handleClickCategoryPlanItem={handleClickCategoryPlanItem}
                                    editCategoryPlan={editCategoryPlan}
                                    onSubmitCategoryPlanForm={onSubmitCategoryPlanForm}    
                                    handleClickCancelEditCategory={() => setEditCategoryPlan('')}
                                    handleClickHideCategory={handleClickHideCategory}
                                    handleShowModalDelete = {handleShowModalDelete}
                                    getAllWithTotalByDate = {getAllWithTotalByDate}
                                />
                        </table>


                         <div className="btn-group dropup">
                            <button type="button" className="btn btn-link btn-sm" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="bi-eye-slash" data-bs-toggle="dropdown" aria-expanded="false"></i> Hidden Categories
                            </button>
                            <div className="dropdown-menu px-2">
                                <ul>
                                    {
                                        categories.map( cat => {
                                            let children = cat.ChildCategory
                                           return children.map(child => {
                                                console.log('child', child)
                                                if (child.hidden) {
                                                    return <li>{child.category_title}</li>
                                                }                                                
                                            })
                                        })
                                    }
                                </ul>

                            </div>
                        </div>






                    </div>



                    <div className="col-md-4 sidebar">
                        <div className="position-sticky top-0">
                            <h2>Overview</h2>

                            <table className="table table-sm outside-borders fs-8 plan-overview table">
                                <thead>
                                    <tr className="">
                                        <th className="fw-bold">
                                            Total Cash At Start of Month
                                        </th>
                                        <th className="table-column-currency">
                                            <NumericFormat value={cashAccountsTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} />     
                                        </th>           
                                    </tr>
                                </thead>
                            </table>



                            <table className="table table-sm outside-borders fs-8 plan-overview table">
                                <thead>
                                    <tr className="fs-9">
                                        <th>&nbsp;</th>
                                        <th className="text-end">Plan</th>
                                        <th className="text-end">Actual</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    <tr className="bg-light">
                                        <td className="fw-bold">Income</td>
                                        <td className="table-column-currency"><NumericFormat value={planIncomeTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></td>           
                                        <td className="table-column-currency"><NumericFormat value={actualIncomeTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></td>           
                                    </tr>
                                    <tr className="bg-light">
                                        <td className="fw-bold">Expense</td>
                                        <td className="table-column-currency"><NumericFormat value={planExpenseTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></td>           
                                        <td className="table-column-currency"><NumericFormat value={actualExpenseTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></td>           
                                    </tr>
                                    <tr className="bg-light">
                                        <td className="fw-bold">Net</td>
                                        <td className="table-column-currency"><NumericFormat value={(planIncomeTotal - planExpenseTotal).toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></td>
                                        <td className="table-column-currency"><NumericFormat value={(actualIncomeTotal + actualExpenseTotal).toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></td>
                                    </tr>
                                    <tr className="bg-light">
                                        <td className="fw-bold">Investments</td>
                                        <td className="table-column-currency"><NumericFormat value={planInvestmentsTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></td>           
                                        <td className="table-column-currency"><NumericFormat value={actualInvestmentsTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></td>           
                                    </tr>
                                </tbody>
                            </table>





                            <table className="table table-sm table-hover outside-borders fs-8 PlanIncomeExpenseListTable">
                                    <PlanSavingsList 
                                        categoryArray={savingsArr}
                                        handleClickCategoryPlanItem={handleClickCategoryPlanItem}
                                        editCategoryPlan={editCategoryPlan}
                                        onSubmitCategoryPlanForm={onSubmitCategoryPlanForm}    
                                        handleClickCancelEditCategory={() => setEditCategoryPlan('')}
                                        handleClickHideCategory={handleClickHideCategory}
                                        handleShowModalDelete = {handleShowModalDelete}
                                        getAllWithTotalByDate = {getAllWithTotalByDate}
                                    />
                            </table>



                           <table className="table table-sm outside-borders fs-8 plan-overview table">
                                <thead>
                                    <tr className="fs-9">
                                        <th>&nbsp;</th>
                                        <th className="text-end">Plan</th>
                                        <th className="text-end">Actual</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="fw-bold">Total Reserves</td>
                                        <td className="table-column-currency"><NumericFormat value={planSavingsTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></td>           
                                        <td className="table-column-currency"><NumericFormat value={planSavingsTotal.toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></td>           
                                    </tr>

                                    <tr>
                                        <td className="fw-bold">Unallocated</td>
                                        <td className="table-column-currency"><NumericFormat value={(cashAccountsTotal + (planIncomeTotal - planExpenseTotal) - planInvestmentsTotal - planSavingsTotal).toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></td>           
                                        <td className="table-column-currency"><NumericFormat value={(cashAccountsTotal + (actualIncomeTotal + actualExpenseTotal) + actualInvestmentsTotal - planSavingsTotal).toFixed(2)} decimalScale={2} displayType={'text'} thousandSeparator={true} prefix={''} /></td>           
                                    </tr>
                               </tbody>
                            </table>



                        </div>
                    </div>
                </div>

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