import { BehaviorSubject } from 'rxjs';

import config from 'config';
import { fetchWrapper, history } from '@/_helpers';

const userSubject = new BehaviorSubject(null);
const baseUrl = `${config.apiUrl}/categories`;

export const categoryService = {
    create,
    createBankAccountCategory,
    update,
    getAll,
    getById,
    getAllWithTotalByDate,
    getCashTrackingAccountsWithTotals,
    delete: _delete,
    user: userSubject.asObservable(),
    get userValue () { return userSubject.value }
};


function create(params) {	
    return fetchWrapper.post(baseUrl, params);
}


function createBankAccountCategory(params) {
    return fetchWrapper.post(`${baseUrl}/createBankAccountCategory`, params);
}


function update(params) {
return fetchWrapper.put(`${baseUrl}/${params.id}`, params);}


function getCashTrackingAccountsWithTotals(date) {
       return fetchWrapper.get(`${baseUrl}/cashTrackingAccounts/?date=${date}`);    
}

function getAll() {
    return fetchWrapper.get(baseUrl);
}

function getById(id) {
    return fetchWrapper.get(`${baseUrl}/${id}`);
}


function getAllWithTotalByDate(startDate, endDate) {
       return fetchWrapper.get(`${baseUrl}/reports/?startDate=${startDate}&endDate=${endDate}`);    
}

// prefixed with underscore because 'delete' is a reserved word in javascript
function _delete(id) {
    return fetchWrapper.delete(`${baseUrl}/${id}`)
}
