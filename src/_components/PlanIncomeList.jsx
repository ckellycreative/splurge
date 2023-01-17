import React, { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format';
import { CategoryForm } from '../_components/CategoryForm'
import { PlanCategoryActions } from '../_components/PlanCategoryActions'
import MaskedInput from 'react-text-mask'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'

function PlanIncomeList(props) {
    const currencyMask = createNumberMask({
      prefix: '',
      suffix: '',
      requireDecimal: true,
      includeThousandsSeparator: false,
    })
    
    let parentTitle = '' //For iterating the income/expense row subheadings

    const categories =  props.categoryArray.map(cat => {
                let isGroupTotal = (cat.groupTotalPlan != null) ? true : false
                let isNewCategoryGroup = (parentTitle != cat.category_title) ? true : false
                let totalReportAmount = (!isGroupTotal) ? cat.totalReportAmountDebit - cat.totalReportAmountCredit : 0
                parentTitle = cat.category_title
                    return (    
                        <React.Fragment key={isGroupTotal ? cat.grpid : cat.ChildCategory.id}>
                            {!isGroupTotal && isNewCategoryGroup &&
                                    <tr>
                                        <td colSpan='4' className='pt-3'>

                                            <span className="h4">Income</span>

                                            <div className="btn-group dropdown">
                                              <button type="button" className="btn btn-link btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                                <i className="bi-folder-plus"></i>
                                              </button>
                                                <div className="dropdown-menu px-2" style={ {minWidth: '500px'} }>
                                                    <CategoryForm parentId={cat.id} category_type='income' isGroupForm={false} getAllWithTotalByDate={props.getAllWithTotalByDate} />
                                                </div>
                                            </div>

                                        </td>

                                    </tr>
                            }
                            {!isGroupTotal && 
                                <React.Fragment>
                                    <tr>
                                        <td>
                                            {
                                                props.editCategory == cat.ChildCategory.id &&
                                                <input onBlur={props.handleUpdateCategory} onChange={props.handleChangeNewCategoryTitle} value={props.newCategoryTitle} autoFocus name="category_title" type="text" placeholder='Category Title' className={'form-control'} />
                                                ||
                                                <span>
                                                {cat.ChildCategory.category_title}
                                                <div className="btn-group dropend">
                                                  <button type="button" className="btn btn-link btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                                    <i className="bi-pencil"></i>
                                                  </button>
                                                    <PlanCategoryActions 
                                                        cat={cat}
                                                        actions={{editTitle: true,  editPlan: false, delete: true}}
                                                        handleClickEditPlan={props.handleClickEditPlan} 
                                                        handleClickEditCategory={props.handleClickEditCategory}
                                                        handleShowModalDelete={props.handleShowModalDelete}
                                                    />
                                                </div>


                                                </span>
                                            }

                                        </td>
                                        <td className='text-end'>
                                            <NumericFormat value={totalReportAmount != 0 ? totalReportAmount.toFixed(2) : '-'} displayType={'text'} thousandSeparator={true} prefix={''} />
                                        </td>
                                    </tr>
                                </React.Fragment>

                            }
                            {

                                isGroupTotal && 
                                <tr className="table-info">
                                    <td className='fw-bold'>Total {cat.groupCategoryTitle}</td>
                                    <td className='text-end'><NumericFormat value={cat.groupTotalActual.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={''} /></td>
                                </tr>            


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

export { PlanIncomeList };

