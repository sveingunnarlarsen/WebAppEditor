import produce from "immer";
import { Actions } from "../types";
import { Resources } from "../types/resources";

export const initState: Resources  = {
    Config: null,
    Languages: [],
    Packages: [],
    User: null,
    ApiGroups: [],
}

const requestMasterData = produce((draft) => {
    return draft;
});

const recieveMasterData = produce((draft, data: Resources) => {
    return {
        ...data,
        ApiGroups: draft.ApiGroups,
    }
});

const requestApis = produce((draft) => {
    return draft;
});

const recieveApis = produce((draft: Resources, data) => {
    draft.ApiGroups = data;
});

export function resources(state = initState, action) {
    switch (action.type) {
        case Actions.REQUEST_MASTERDATA:
            return requestMasterData(state);
        case Actions.RECEIVE_MASTERDATA:
            return recieveMasterData(state, action.data);
        case Actions.REQUEST_APIS:
            return requestApis(state);
        case Actions.RECEIVE_APIS:
            return recieveApis(state, action.apiGroups);
        default:
            return state;
    }
}