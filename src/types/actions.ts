import { Actions, Tool } from "./"

export interface SetSelectedNodeAction {
    type: typeof Actions.SET_SELECTED_NODE,
    id: string,
}

export interface SwitchToolAction {
    type: typeof Actions.SWITCH_TOOL,
    tool: Tool,
}