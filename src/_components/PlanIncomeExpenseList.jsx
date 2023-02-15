import React, { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format';
import { CategoryForm } from '../_components/CategoryForm'
import { PlanCategoryActions } from '../_components/PlanCategoryActions'
import MaskedInput from 'react-text-mask'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'


function PlanIncomeExpenseList(props) {
    const currencyMask = createNumberMask({
      prefix: '',
      suffix: '',
      requireDecimal: true,
      includeThousandsSeparator: false,
    })

    console.log('props.categoryArray',props.categoryArray)
    let parentTitle = '' //For iterating the expense row subheadings
    const categories =  props.categoryArray.map((cat, index, array) => {
                let childId = (typeof cat.ChildCategory != 'undefined') ? cat.ChildCategory.id : null
                let isGroupTotal = (typeof cat.ChildCategory == 'undefined') ? true : false
                let isNewCategoryGroup = (parentTitle != cat.category_title && !isGroupTotal) ? true : false
                let isNewCategoryGroupWithoutChildren = (isNewCategoryGroup && !childId) ? true : false
                let grpid = (isGroupTotal) ? cat.grpid : null
                let totalReportAmount = (!isGroupTotal) ? cat.totalReportAmountDebit - cat.totalReportAmountCredit : 0
                let planAmount = (!isGroupTotal) ? +cat.CategoryPlan.planAmount  : 0
                let difference = ''
                if (cat.category_type == 'expense'){
                    difference =  (planAmount + totalReportAmount).toFixed(2)
                }else if (cat.category_type == 'income'){
                    difference = (totalReportAmount - planAmount).toFixed(2)
                }else {
                    difference = '-'
                }

                let keyId = null
                if (isNewCategoryGroup) {
                    keyId = cat.id
                }else if (isNewCategoryGroupWithoutChildren){
                    keyId = cat.id
                }else if (isGroupTotal) {
                    keyId = grpid
                }else {
                    keyId = childId
                }

                parentTitle = cat.category_title
                    return (    
                        <React.Fragment key={keyId}>
                        {isNewCategoryGroup  && !isGroupTotal &&
                            <div className="row tabular-data">
                                <div className="col-sm-6">
                                    <h4>{cat.category_title}</h4>

                                    <div className="btn-group dropdown">
                                        <i className="bi-folder-plus dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></i>
                                        <div className="dropdown-menu px-2" style={ {minWidth: '500px'} }>
                                            <CategoryForm parentId={cat.id} category_type='expense' isGroupForm={false} getAllWithTotalByDate={props.getAllWithTotalByDate} />
                                        </div>
                                    </div>

                                    
                                </div>

                            </div>
                        }
                        { !isGroupTotal && cat.ChildCategory.id != null &&  //checks if there are no children
                        <div className="row tabular-data">
                             <div className="col-sm-6">
                                {
                                    props.editCategory == cat.ChildCategory.id &&
                                    <input onKeyPress={props.handleUpdateCategory} onBlur={props.handleUpdateCategory} onChange={props.handleChangeNewCategoryTitle} value={props.newCategoryTitle} autoFocus name="category_title" type="text" placeholder='Category Title' className={'form-control'} />
                                    ||
                                    <span>
                                    {cat.ChildCategory.category_title}


                                    <div className="btn-group dropend">
                                        <i className="bi-pencil dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></i>
                                        <PlanCategoryActions 
                                            cat={cat}
                                            actions={{editTitle: true,  editPlan: true, delete: true}}
                                            handleClickEditPlan={props.handleClickEditPlan} 
                                            handleClickEditCategory={props.handleClickEditCategory}
                                            handleShowModalDelete={props.handleShowModalDelete}
                                        />
                                    </div>



                                    </span>
                                }

                            </div>
                            <div className="col-sm-2 text-end">
                                {
                                    props.editPlan == cat.CategoryPlan.id &&

                                        <MaskedInput
                                              mask={currencyMask}
                                              id={`plan${cat.CategoryPlan.id}`}
                                              type="text"
                                              value={props.newPlanAmount}
                                              onChange={props.handleChangePlanAmount}
                                              onBlur={props.handleUpdatePlan}
                                              onKeyPress={props.handleUpdatePlan}
                                              className="form-control"
                                              autoFocus
                                        />
                                    ||

                                    <NumericFormat value={planAmount != 0 ? planAmount.toFixed(2) : '-' } valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} />
                                }
                            </div>
                            <div className="col-sm-2 text-end">
                                <NumericFormat value={totalReportAmount != 0 ? totalReportAmount.toFixed(2) : '-'} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} />
                            </div>
                            <div className="col-sm-2 text-end">
                                <NumericFormat value={difference} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} />
                            </div>
                        </div>
                        }
                        {

                            isGroupTotal && 
                            <div className="row tabular-data bg-secondary">
                                <div className="col-sm-6 fw-bold">Total {cat.groupCategoryTitle}</div>
                                <div className="col-sm-2 text-end"><NumericFormat value={cat.groupTotalPlan.toFixed(2)} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} /></div>
                                <div className="col-sm-2 text-end"><NumericFormat value={cat.groupTotalActual.toFixed(2)} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} /></div>
                                <div className="col-sm-2 text-end"><NumericFormat value={(cat.groupCategoryType == 'expense') ? (cat.groupTotalPlan + cat.groupTotalActual).toFixed(2) : (cat.groupTotalActual - cat.groupTotalPlan).toFixed(2)} valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} /></div>

                            </div>            


                        }




                        </React.Fragment>
                    )
    })


 


    return (
        <React.Fragment>
            { categories }
        </React.Fragment>
    );
}

export { PlanIncomeExpenseList };

