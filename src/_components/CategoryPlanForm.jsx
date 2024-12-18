import React, { useState } from "react";
import { NumericFormat } from 'react-number-format';
import MaskedInput from 'react-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { Formik, Form, Field, ErrorMessage } from 'formik';

function CategoryPlanForm(props) {

    const currencyMask = createNumberMask({
      prefix: '',
      suffix: '',
      requireDecimal: true,
      includeThousandsSeparator: false,
    })

	return(
        <div className="p-3 bg-light">

        <Formik initialValues={{category_title: props.cat.ChildCategory.category_title, optional: props.cat.ChildCategory.optional, planAmount: props.cat.CategoryPlan.planAmount ? props.cat.CategoryPlan.planAmount : '0.00'}} onSubmit={props.onSubmitCategoryPlanForm} >
                {({ values, errors, touched, isSubmitting, handleChange, handleBlur, setFieldValue }) => (
                    <Form>
                        <div>
                            <label htmlFor="category_title" className="form-label">Category Title</label>
                            <Field name="category_title" type="text" className={'form-control'} />
                        </div>
                        {props.cat.ChildCategory.category_type == 'expense' &&

                            <div className="mt-2">
                                <label htmlFor="optional" >
                                    <Field 
                                        id="optional" 
                                        type="checkbox" 
                                        name="optional" 
                                        checked={values.optional}
                                        onChange={e => setFieldValue('optional', e.target.checked)} 
                                    /> Optional Expense
                                </label>
                            </div>
                        }
                        <div className="mt-2">
                            <label htmlFor="planAmount" className="form-label">Plan Amount</label>
                            <Field name="planAmount" type="number" step="0.01" placeholder='Amount'>
                                {({ field }) => (
                                   <MaskedInput
                                        {...field}
                                        mask={currencyMask}
                                        id="planAmount"
                                        type="text"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={
                                        `form-control ${errors.amount && touched.amount ? 'text-input error' : 'text-input'}`
                                        }
                                    />
                                )}
                            </Field>
                        </div>
                        <div className="mt-2">
                            <button className="btn btn-primary" type="submit">Save</button>
                            &nbsp;
                            <button onClick={props.handleClickCancelEditCategory} className="btn btn-secondary" type="button">Cancel</button>
                        </div>
                    </Form>
                )}
            </Formik>

            <a className="btn btn-sm"  onClick={() => props.handleClickHideCategory(props.cat.ChildCategory.id, props.hasAmts)}>Hide</a>
            &nbsp;
            <a className="btn btn-sm"  onClick={() => props.handleShowModalDelete(props.cat.ChildCategory.id)}>Delete</a>       


        </div>


 	);
}

export { CategoryPlanForm };

