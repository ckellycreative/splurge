import React, { useState, useEffect } from 'react';
import moment from 'moment'
import { NumericFormat } from 'react-number-format';
import { accountService, categoryService } from '@/_services'


function Reports() {
    const userMonthCreated = moment(accountService.userValue.created).format('MM');
    const userYearCreated = moment(accountService.userValue.created).format('YYYY');
    const [categoriesTransactionsByDate, setCategoriesTransactionsByDate] = useState([]);
    const [categoriesTransactionsByDateAreLoaded, setCategoriesTransactionsByDateAreLoaded] = useState(false);
    const [startMonth, setStartMonth] = useState(moment().format('MM'));
    const [startYear, setStartYear] = useState(moment().format('YYYY'));
    const [endMonth, setEndMonth] = useState(moment().format('MM'));
    const [endYear, setEndYear] = useState(moment().format('YYYY'));

    var totalIncome = 0
    var totalExpense = 0
    let i = +moment().format('YYYY')   //current year as the iterator
    let u = +userYearCreated           // year the user was created 
    let yearArray = [i]                 // create array of years for the year <select>
    while (i > (u+1)) {                 //iterate until the year after user was created (dont decrement the last year)
        yearArray.push(i - 1)           
        i--
    }


    const handleChangeSelect = (e) => {
        e.preventDefault()

        switch(e.target.name) {
            case 'startMonth':
                setStartMonth(e.target.value)
            break;
            case 'startYear':
                setStartYear(e.target.value)
            break;
            case 'endMonth':
                setEndMonth(e.target.value)
            break;
            case 'endYear':
                setEndYear(e.target.value)
            break;
            default:
            // code block
        } 

    }

    const monthSelect = (selectName, val) =>  {
        return(
            <select name={selectName} onChange={(e) => handleChangeSelect(e)} value={val} component="select" className={'form-control form-control-sm'}>
                <option value='01'>Jan</option>
                <option value='02'>Feb</option>
                <option value='03'>Mar</option>
                <option value='04'>Apr</option>
                <option value='05'>May</option>
                <option value='06'>Jun</option>
                <option value='07'>Jul</option>
                <option value='08'>Aug</option>
                <option value='09'>Sep</option>
                <option value='10'>Oct</option>
                <option value='11'>Nov</option>
                <option value='12'>Dec</option>
        </select>
     )
    }
      
    const yearSelect = (selectName, val) =>  {
        return(
            <select name={selectName} onChange={(e) => handleChangeSelect(e)} value={val} component="select" className={'form-control form-control-sm'}>
                {
                    yearArray.map( (option, index) => {
                        return <option key={index} value={option}>{option}</option>
                    })
                }
            </select>
        )
    }  



    const getAllWithTotalByDate = () => {
        setCategoriesTransactionsByDateAreLoaded(false);
        let startDate = `${startYear}-${startMonth}-01` 
        let lastDayOfEndMonth = moment(`${endYear}-${endMonth}`, "YYYY-MM").daysInMonth()
        let endDate = `${endYear}-${endMonth}-${lastDayOfEndMonth}`
        categoryService.getAllWithTotalByDate(startDate, endDate)
            .then((data) => {
                setCategoriesTransactionsByDate(data)
                setCategoriesTransactionsByDateAreLoaded(true);
            })
            .catch(error => {
                //alertService.error(error)
                console.log(error)
            });
    };
    useEffect(() => {
        getAllWithTotalByDate()
    }, [startMonth, startYear, endMonth, endYear])  


    let parentTitle = '' //For iterating the income/expense row subheadings
    const incomeCategories =  categoriesTransactionsByDate.map(cat => {
        if (cat.category_type == 'income') {
                let isNewCategoryGroup = (parentTitle != cat.category_title) ? true : false
                let totalReportAmount = (cat.totalReportAmountDebit != null && cat.totalReportAmountCredit != null) ? cat.totalReportAmountDebit - cat.totalReportAmountCredit : 0
                totalIncome += totalReportAmount
                parentTitle = cat.category_title
                if (isNewCategoryGroup) {
                    return (    
                        <React.Fragment key={cat.id}>
                        <h4>{cat.category_title}</h4>
                        <div className="row tabular-data">
                            <div className="col-sm-9">
                                {cat.ChildCategory.category_title}
                            </div>
                            <div className='col-sm-3 text-end'>
                                <NumericFormat value={totalReportAmount.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={''} />
                            </div>
                        </div>
                        </React.Fragment>
                    )
                }else {
                    return (    
                        <div className="row tabular-data" key={cat.ChildCategory.id}>
                            <div className="col-sm-9">
                                {cat.ChildCategory.category_title}
                            </div>
                            <div className='col-sm-3 text-end'>
                                <NumericFormat value={totalReportAmount.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={''} />
                            </div>
                        </div>
                    )

                }
                

        }
    })

    const expenseCategories =  categoriesTransactionsByDate.map(cat => {
        if (cat.category_type == 'expense') {
            let isNewCategoryGroup = (parentTitle != cat.category_title) ? true : false
            let totalReportAmount = (cat.totalReportAmountDebit != null && cat.totalReportAmountCredit != null) ? cat.totalReportAmountDebit - cat.totalReportAmountCredit : 0
            totalExpense += totalReportAmount
            parentTitle = cat.category_title
            if (isNewCategoryGroup) {
                return (    
                    <React.Fragment key={cat.id}>
                    <h4>{cat.category_title}</h4>
                    <div className="row tabular-data">
                        <div className="col-sm-9">
                            {cat.ChildCategory.category_title}
                        </div>
                        <div className='col-sm-3 text-end'>
                            <NumericFormat value={totalReportAmount.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={''} />
                        </div>
                    </div>
                    </React.Fragment>
                )
            }else {
                return (    
                    <div className="row tabular-data" key={cat.ChildCategory.id}>
                        <div className="col-sm-9">
                            {cat.ChildCategory.category_title}
                        </div>
                        <div className='col-sm-3 text-end'>
                            <NumericFormat value={totalReportAmount.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={''} />
                        </div>
                    </div>
                )

            }
            

            }
    })





    return (

            <div className="row Reports">


               { !categoriesTransactionsByDateAreLoaded && 
                    <React.Fragment>
                            <div  className="spinner-border spinner-page text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <div  className="spinner-overlay" role="status"></div>
                    </React.Fragment>
                }

                <div className="col-md-9">
                    <h1>Reports</h1>
                    <div className="row mb-5">
                        <div className=" col input-group">
                            <span className="input-group-text">From</span>
                            {monthSelect('startMonth', startMonth)} 
                            {yearSelect('startYear', startYear)}
                        </div>
                        <div className=" col input-group">
                            <span className="input-group-text">To</span>

                            {monthSelect('endMonth', endMonth)}
                            {yearSelect('endYear', endYear)}
                       </div>
                   </div>
                    <h2>Income</h2>
                        {
                            incomeCategories
                        }
                        <div className="row tabular-data">
                            <div className="col-sm-9">Total Income</div>
                            <div className='col-sm-3 text-end'><NumericFormat value={totalIncome.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={''} /></div>
                        </div>
                    <h2>Expenses</h2>
                            {
                                expenseCategories                       
                            }
                            <div className="row tabular-data">
                                <div className="col-sm-9">Total Expense</div>
                                <div className='col-sm-3 text-end'><NumericFormat value={totalExpense.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={`${totalExpense > 0 ? '+' : '-'}`} /></div>
                            </div>
                </div>

                <div className="col-md-3">
                    <div className="row tabular-data">
                        <div className="col-md-9">Total Income</div>
                        <div className='col-sm-3 text-end'><NumericFormat value={totalIncome.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={''} /></div>
                    </div>
                    <div className="row tabular-data">
                        <div className="col-md-9">Total Expense</div>
                        <div className='col-sm-3 text-end'><NumericFormat value={totalExpense.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={`${totalExpense > 0 ? '+' : '-'}`} /></div>
                    </div>
                    <div className="row tabular-data">
                        <div className="col-md-9">Total Net</div>
                        <div className='col-sm-3 text-end'><NumericFormat value={(totalIncome + totalExpense).toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={`${(totalIncome - totalExpense) > 0 ? '' : '-'}`} /></div>
                    </div>
                </div>
            </div>


     );
}

export { Reports };