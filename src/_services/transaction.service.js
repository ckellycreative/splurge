import { BehaviorSubject } from 'rxjs';

import config from 'config';
import { fetchWrapper, history } from '@/_helpers';

const userSubject = new BehaviorSubject(null);
const baseUrl = `${config.apiUrl}/transactions`;

export const transactionService = {
    create,
    bulkCreate,
    update,
    getAll,
    delete: _delete,
    user: userSubject.asObservable(),
    get userValue () { return userSubject.value }
};


function create(params) {   
    return fetchWrapper.post(baseUrl, params);
}

function update(params) {   
    return fetchWrapper.put(`${baseUrl}/${params.id}`, params);
}

//This function is used for bulk update 
function bulkCreate(arr) {
    return fetchWrapper.post(`${baseUrl}/bulkCreate/`, arr);
}

function getAll(bankId, categoryId,  limit) {
       return fetchWrapper.get(`${baseUrl}/account/${bankId}?category=${categoryId}&limit=${limit}`);    
}

// prefixed with underscore because 'delete' is a reserved word in javascript
function _delete(id) {
    return fetchWrapper.delete(`${baseUrl}/${id}`)
}
