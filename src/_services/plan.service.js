import { BehaviorSubject } from 'rxjs';

import config from 'config';
import { fetchWrapper, history } from '@/_helpers';

const userSubject = new BehaviorSubject(null);
const baseUrl = `${config.apiUrl}/plans`;

export const  planService = {
    create,
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

function getAll() {
       return fetchWrapper.get(baseUrl);    
}

// prefixed with underscore because 'delete' is a reserved word in javascript
function _delete(id) {
    return fetchWrapper.delete(`${baseUrl}/${id}`)
}
