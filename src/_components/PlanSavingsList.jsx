import React, { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format';
import { CategoryForm } from '../_components/CategoryForm'
import { PlanCategoryActions } from '../_components/PlanCategoryActions'
import MaskedInput from 'react-text-mask'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'

function PlanSavingsList(props) {
    const currencyMask = createNumberMask({
      prefix: '',
      suffix: '',
      requireDecimal: true,
      includeThousandsSeparator: false,
    })


    let parentTitle = '' //For iterating the expense row subheadings
    const categories =  props.categoryArray.map((cat, index, array) => {
                let isNewCategoryGroup = (parentTitle != cat.category_title) ? true : false
                let isGroupTotal = (cat.groupTotalPlan != null) ? true : false
                let totalReportAmount = (!isGroupTotal) ? cat.totalReportAmountDebit - cat.totalReportAmountCredit : 0
                let planAmount = (!isGroupTotal) ? cat.CategoryPlan.planAmount  : 0
                parentTitle = cat.category_title
                    return (    
                        <React.Fragment key={isGroupTotal ? cat.grpid : cat.ChildCategory.id}>
                        {isNewCategoryGroup  && !isGroupTotal &&
                            <div className="row tabular-data">
                                <div className="col-sm-6">
                                    <span className="h5">{cat.category_title}</span>

                                    <div className="btn-group dropdown">
                                      <i className="bi-folder-plus dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"></i>
                                        <div className="dropdown-menu px-2" style={ {minWidth: '500px'} }>
                                            <CategoryForm parentId={cat.id} category_type='savings' isGroupForm={false} getAllWithTotalByDate={props.getAllWithTotalByDate} />
                                        </div>
                                    </div>

                                </div>

                            </div>
                        }
                        { !isGroupTotal && cat.ChildCategory.id != null &&  //checks if there are no children
                        <div className="row tabular-data">
                            <div className="col-sm-4">
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
                            <div className="col-sm-4 text-end">
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

                                    <NumericFormat value={planAmount != 0 ? planAmount : '-' } valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} />
                                }

                            </div>
                            <div className="col-sm-4 text-end text-muted">
                                <NumericFormat value={planAmount != 0 ? planAmount : '-' } valueIsNumericString={true} displayType={'text'} thousandSeparator={true} prefix={''} />
                            </div>
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

export { PlanSavingsList };

