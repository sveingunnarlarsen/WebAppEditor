import { Actions } from "../types";
import { ApiGroup } from "../types/resources";
import { throwError, handleAjaxError, handleClientError } from './error';

export function getApis() {
    return function(dispatch, getState) {

        return fetch(`/api/functions/API/ListWithApis`, {
            method: 'POST',
        })
            .then(throwError)
            .then(async response => {
                try {
                    dispatch(recieveApis(await response.json()));
                } catch (e) {
                    handleClientError(e, dispatch);
                }
            })
            .catch(error => handleAjaxError(error, dispatch))
    }
}

function recieveApis(apiGroups: ApiGroup[]) {
    return {
        type: Actions.RECEIVE_APIS,
        apiGroups,
    }
}