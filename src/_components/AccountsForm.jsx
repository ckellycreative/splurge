import React, { useState } from "react";
import { categoryService } from '@/_services'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import { NumericFormat } from 'react-number-format';
import MaskedInput from 'react-text-mask'

function AccountsForm(props) {


    /* ----------
        AddAccount Form setup 
    -------------*/

    const initialValues = {
        id: null,
        category_title: '',
        openingBalance: ''
    };

   const validationSchema = Yup.object().shape({
        category_title: Yup.string().required('Title is required'),
        openingBalance: Yup.number().test(
            'is-decimal',
            'Must be a decimal number',
            value => (value + "").match(/^\d*\.{0,2}\d*$/),
        )
    });

    const currencyMask = createNumberMask({
      prefix: '',
      suffix: '',
      requireDecimal: true,
      includeThousandsSeparator: false,
    })




    function onSubmit({ id, category_title, openingBalance}, { setSubmitting, resetForm }) {
        const newCat = {
            id: null,
            category_title,
            category_type: 'cash',
            openingBalance
        }

        categoryService.createBankAccountCategory(newCat)
            .then((res) => {
                props.getTransactions() //getTransactions will also fetch the bankAccounts because of the useEffect dependency on getBankAccountCategoriesWithTotals
                resetForm()
                props.setShowAddAccountForm(false)
            })
            .catch(error => {
                setSubmitting(false);
                console.log(error);
            });
    }


	return(
         <Formik initialValues={(initialValues)} validationSchema={validationSchema} onSubmit={onSubmit} enableReinitialize >
            {({ values, errors, touched, isSubmitting, handleChange, handleBlur, resetForm}) => (
                <Form>
                    <Field name="category_title" placeholder='Account Name' type="text" className={'form-control'} />
                    <ErrorMessage name="category_title" component="div" className="text-danger" />
                   <div className='input-group'>
                        <span className="input-group-text">Opening Balance $</span>
                        <Field name="openingBalance" type="number" step="0.01">
                            {({ field }) => (
                               <MaskedInput
                                  {...field}
                                  mask={currencyMask}
                                  id="amount"
                                  type="text"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className={
                                    `form-control ${errors.openingBalance && touched.openingBalance ? 'text-input error' : 'text-input'}`
                                    }
                                />
                            )}
                        </Field>
                    </div>
                    <ErrorMessage name="openingBalance" component="div" className="text-danger" />
                

                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                    {isSubmitting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                        Save it!
                    </button> 
                    &nbsp;
                    <button type="reset" onClick={() => props.setShowAddAccountForm(false)} className="btn btn-outline-secondary">Cancel</button>

                </Form>
            )}
        </Formik>
	);
}


export { AccountsForm };







