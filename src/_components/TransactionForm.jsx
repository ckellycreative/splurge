import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import moment from 'moment'
import * as Yup from 'yup';
import { alertService, transactionService } from '@/_services';
import { fetchWrapper, history } from '@/_helpers';
import MaskedInput from 'react-text-mask'
import createNumberMask from 'text-mask-addons/dist/createNumberMask'
import { CategorySelectOptions } from '../_components/CategorySelectOptions'
import { Spinner } from '../_components/Spinner'

function TransactionForm(props) {
    const [splitIsVisible, setSplitIsVisible] = useState(false)
    const [splitTotal, setSplitTotal] = useState('')


    /* ----------
        Form setup 
    -------------*/

    const initialValues = {
        id: null,
        childId: null,
        transaction_date: moment(new Date()).format('YYYY-MM-DD'),
        transaction_description: '',
        amount: '',
        bank_account_id: '',
        categoryId: '',
        isCredit: false,
        isSplit: false,
        splits: [{id: null, catId:'', splitAmount:''}, {id: null, catId:'', splitAmount:''}]
    };

    const validationSchema = Yup.object().shape({
        //transaction_date: Yup.date().required('Date is required'),
        transaction_description: Yup.string().required('Description is required'),
        bank_account_id: Yup.string().ensure().required('Account is required'),
        categoryId: Yup.string().when('isSplit', { is: false, then: Yup.string().ensure().required('Category is required') } ),
        amount: Yup.string().required('Amount is required'),
        amount: Yup.number().test(
            'is-decimal',
            'Must be a decimal number',
            value => (value + "").match(/^\d*\.{0,2}\d*$/),
        ),
        isSplit: Yup.boolean(),
        splits: Yup.array()
            .when('isSplit', {
                is: true,
                then: Yup.array().of(
                        Yup.object().shape({
                        catId: Yup.string().ensure().required('Category is required'),
                         splitAmount: Yup.number().test(
                            'is-decimal',
                            'Must be a decimal number',
                            value => (value + "").match(/^\d*\.{0,2}\d*$/),
                        ),
                   }))


            })
    });


    const currencyMask = createNumberMask({
      prefix: '',
      suffix: '',
      requireDecimal: true,
      includeThousandsSeparator: false,
    })




    /* ----------
        Click Handlers  
    -------------*/

 


    /* ----------
        Handle Editing Transactions  
    -------------*/

    const editingTransactionValues = {
        id: props.editingTransaction && props.editingTransaction.id,
        childId: props.editingTransaction && props.editingTransaction.ChildTransactions.length == 1 ? props.editingTransaction.ChildTransactions[0].id : null,
        transaction_date: (props.editingTransaction ? moment.utc(props.editingTransaction.transaction_date).format('YYYY-MM-DD') : ''),
        transaction_description: (props.editingTransaction ? props.editingTransaction.transaction_description : ''),
        amount: (props.editingTransaction && props.editingTransaction.debit != 0) ? props.editingTransaction.debit : (props.editingTransaction && props.editingTransaction.credit) ? props.editingTransaction.credit : '0',
        bank_account_id: props.editingTransaction ? props.editingTransaction.categoryId : '',
        categoryId: props.editingTransaction && props.editingTransaction.ChildTransactions.length == 1 ? props.editingTransaction.ChildTransactions[0].categoryId : '',
        isCredit: (props.editingTransaction && props.editingTransaction.credit > 0) ? true : false,
        isSplit: props.editingTransaction && props.editingTransaction.ChildTransactions.length > 1,
        splits: getSplitsFromEditingTransaction()
    };

    function getSplitsFromEditingTransaction() {
        let editingSplits = []
        if (props.editingTransaction && props.editingTransaction.ChildTransactions.length > 1){

             props.editingTransaction.ChildTransactions.map(child => {
                let split = {
                    id: child.id,
                    catId: child.categoryId,
                    splitAmount: +child.debit + +child.credit
                }
                editingSplits.push(split)
             })
        }
        else editingSplits = []
        return editingSplits

    }


    function handleSplitIsVisible() {
        setSplitIsVisible(!splitIsVisible)
    }

    function handleChangeSplitAmount(splits) {
        let splitSum = 0
        splits.map(split => {
           let amt = (!split.splitAmount) ? 0 : split.splitAmount
          splitSum += parseFloat(amt)
        })
         setSplitTotal(parseFloat(splitSum))
    }


    /* ----------
        Form Submission  
    -------------*/


	function onSubmit({ id, childId, transaction_date, transaction_description, amount, bank_account_id, categoryId, isCredit, isSplit, splits}, { setSubmitting, resetForm }) {

       const transaction = {
            id,
            transaction_date, 
            transaction_description,
            debit: (isCredit) ? '0.00' : amount.replace(/[ ]*,[ ]*|[ ]+/g, ''),
            credit: (isCredit) ? amount.replace(/[ ]*,[ ]*|[ ]+/g, '')  : '0.00',
            categoryId: bank_account_id
       }

        let childTransactions = []

        if (isSplit) {
            const splitChildTransactions = splits.map(split => { 

                let splitDebit = (isCredit) ? split.splitAmount : 0
                let splitCredit = (isCredit) ? 0 : split.splitAmount
                let splitId = (split.id) ? split.id : null
                let childTransaction = {
                      id: splitId,
                      transaction_date,
                      transaction_description,
                      debit: splitDebit,
                      credit: splitCredit,
                      categoryId: split.catId,
                }
              childTransactions.push(childTransaction)

            })
        } else {
            childTransactions = [
            {
                id: childId,
                transaction_date, 
                transaction_description,
                credit: (isCredit) ? '0.00' : amount.replace(/[ ]*,[ ]*|[ ]+/g, ''),
                debit: (isCredit) ? amount.replace(/[ ]*,[ ]*|[ ]+/g, '')  : '0.00',
                categoryId
            }
        ]

       }

       //Add the child transactions to the data
        transaction.ChildTransactions = childTransactions;
        props.setTransactionIsPosting(true)
        alertService.clear();
        if (props.editingTransaction) {
           transactionService.update(transaction)
                .then((res) => {
                    finalizeSubmission();
                })
                .catch(error => {
                    setSubmitting(false);
                    alertService.error(error);
                });
        } else {
           transactionService.create(transaction)
                .then((res) => {
                    finalizeSubmission();
                })
                .catch(error => {
                    setSubmitting(false);
                    alertService.error(error);
                });
        }

        function finalizeSubmission(){
                    setSubmitting(false);  
                    setSplitIsVisible(false);  
                    setSplitTotal('');  
                    resetForm();  
                    props.setTransactionIsPosting(false);
                    props.setEditingTransaction(null);
                    props.setShowDrawer();
        }
    }


	return(
    <div className="mt-3">

                        <Formik initialValues={(props.editingTransaction ? editingTransactionValues : initialValues)} validationSchema={validationSchema} onSubmit={onSubmit} enableReinitialize >
                            {({ values, errors, touched, isSubmitting, handleChange, handleBlur }) => (
                            <Form>

                                <Field name="transaction_date" type="date" className={'form-control'} />
                                <Field name="transaction_description" type="text" placeholder='Description' className={'form-control mt-3'} />
                                <ErrorMessage name="transaction_description" component="div" className="text-danger" />
                                <div className="mt-3">

                                        <Field name="bank_account_id" component="select" className={'form-control CategorySelect'}>
                                            <CategorySelectOptions categories={props.categories} categoryType="bankAccount" defaultOption="Select an Account" />
                                        </Field>

                                        <ErrorMessage name="bank_account_id" component="div" className="text-danger" />

                                </div>

                                <div className='input-group mt-3'>
                                    <span className="input-group-text">$</span>
                                    <Field name="amount" type="number" step="0.01" placeholder='Amount'>
                                        {({ field }) => (
                                           <MaskedInput
                                              {...field}
                                              mask={currencyMask}
                                              id="amount"
                                              type="text"
                                              onChange={handleChange}
                                              onBlur={handleBlur}
                                              className={
                                                `form-control ${errors.amount && touched.amount ? 'text-input error' : 'text-input'}`
                                                }
                                            />
                                        )}
                                    </Field>
                                     <span className="input-group-text">
                                        <Field name="isCredit" type="checkbox" />&nbsp;<span className='small'>Income</span>
                                    </span>
                                </div>
                                <ErrorMessage name="amount" component="div" className="text-danger" />


                               <div>
                                    <div className='input-group mt-3'>

                                        <Field name="categoryId" disabled={values.isSplit} component="select" className={'form-control CategorySelect'}>
                                            <CategorySelectOptions categories={props.categories} categoryType="all" defaultOption="Select a Category" />
                                        </Field>
                                        <span className="input-group-text">
                                            <Field type="checkbox" name="isSplit" onClick={()=> handleSplitIsVisible()} /> &nbsp;<span className='small'>Split</span>
                                        </span>
                                    </div>
                                    <ErrorMessage name="categoryId" component="div" className="text-danger" />
                                </div>
                 
                                { values.isSplit &&  
                            
                                    <div>
                                        <FieldArray
                                            name="splits"
                                            render={({ insert, remove, push }) => (
                                                <div>

                                                    {values.splits.length > 0 &&
                                                    values.splits.map((split, index) => (
                                                        <div className="row  mt-3" key={index}>
                                                            <div className="col-sm-6">
                                                                <Field name={`splits.${index}.catId`} component="select" className={'form-control CategorySelect'}>
                                                                    <CategorySelectOptions categories={props.categories} categoryType="all" defaultOption="Select a Category" />
                                                                </Field>
                                                                <ErrorMessage name={`splits.${index}.catId`} component="div" className="text-danger" />
                                                            </div>

                                                            <div className="col-sm-6">
                                                                    <div className='input-group'>
                                                                        <div className="input-group-text">$</div>
                                                                        <Field name={`splits.${index}.splitAmount`} type="number" step="0.01" placeholder='Amount' className={'form-control'}> 
                                                                            {({ field }) => (
                                                                                <MaskedInput
                                                                                    {...field}
                                                                                    mask={currencyMask}
                                                                                    id={`split${index}`}
                                                                                    type="text"
                                                                                    //onChange={handleChange}
                                                                                    onBlur={handleBlur}
                                                                                    onKeyUp={(splits)=> handleChangeSplitAmount(values.splits)}
                                                                                    className={
                                                                                    `form-control ${errors.splits && touched.splits ? 'text-input error' : 'text-input'}`
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </Field>
                                                                        <button type="button" className="btn btn-secondary" onClick={() => remove(index)}>
                                                                            X
                                                                        </button>                                                    
                                                                    </div>
                                                                    <ErrorMessage name={`splits.${index}.splitAmount`} component="div" className="text-danger" />
                                                            </div>

                                                        </div>
                                                    ))}

                                                    <div className="mt-3">
                                                        <button type="button" className="btn btn-secondary" onClick={() => push({ catId: "", splitAmount: "" })}>
                                                            Add Split
                                                        </button>
                                                    </div>

                                                    <div className={`alert alert-${(values.amount - splitTotal) == 0 ? 'success' : 'warning'}  mt-3`}>
                                                        Remaining: {(values.amount - values.splits.reduce((s, a) => s + +a.splitAmount, 0)).toFixed(2).replace('-0.00', '0.00')}
                                                    </div>

                                                </div>
                                            )}
                                            />
                                        </div>
                                }                                

                                                
                                <div className="row mt-3">
                                    <div className="form-group col">
                                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                                            Save it! &nbsp;
                                            {isSubmitting && <Spinner className='mr-1' spinnerIcon='border' overlay={false} size='sm' textColor="white" />}
                                        </button> 
                                        &nbsp;
                                        <a className="btn btn-text" onClick={() => props.handleClickDeleteTransaction()}>Delete</a>
                                    </div>
                                </div>


                            </Form>
                        )}
                        </Formik>


    </div>

	);
}


export { TransactionForm };