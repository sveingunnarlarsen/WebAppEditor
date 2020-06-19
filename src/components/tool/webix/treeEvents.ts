import * as webix from "../../../../lib/webix";
import store from "../../../store";
import { getFileById, getFolderChildren } from "../../../store/utils";
import { replaceFolderPath } from "../../../helpers/utils";
import { setSelectedNode } from "../../../actions";
import { save } from "../../../actions/file";

export function getEvents() {
    const me = this;

    return {
        onKeyPress: function(code, e) { },
        onBeforeContextMenu: function(id, e, node) {
            e.preventDefault();
            me.props.setSelectedId(id);
            me.ui.select(id);
            me.handleContextMenu(e);
        },
        onItemClick: function(id, e, node) {
            me.props.setSelectedId(id);
            const file = getFileById(id);

            if (file && file.type === "file") {
                me.props.select(id);
            }
        },
        onBeforeDrag: function(context, e) {
            console.log("Dragging these nodes: ", context.source);
            console.log("Event: ", e);
        },
        onBeforeDrop: function(context, e) {
            const fsoTarget = getFileById(context.target);
            if (fsoTarget.type !== 'folder') return;

            const fsosToDrop = context.source.map(id => {
                const fso = getFileById(id);
                const newPath = replaceFolderPath(fso.path, fsoTarget.path);

                return [
                    { ...fso, path: newPath },
                    fso.type === 'folder' ? getFolderChildren(fso).map(childFso => {
                        return {
                            ...childFso,
                            path: childFso.path.replace(fso.path, newPath),
                        }
                    }) : [],
                ]
            }).flat(2);

            store.dispatch(save(fsosToDrop));
            return false;
        },
        onAfterDrop: function(context, e) {
            console.log("After drop: ", context);
            console.log("Event: ", e);
        },
        onMouseMoving: function(e) { },
        onBlur: function(e) { },
        onFocus: function(e) { },
        onBeforeDragIn: function(e) { }
    };
}

export function getExtensions() {
    const me = this;
    return {
        $dropAllow: function(context, e) {
            const fsoTarget = getFileById(context.target);
            if (fsoTarget.type === 'folder') {
                console.log(e);
                //e.target.classList("webix_selected");
                return true;
            }  else {
                console.log(e);
                //e.target.classList.add("no-drop-allowed");
                return false;            
            }
        }
    }
}