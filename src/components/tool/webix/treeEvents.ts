import { getFileById } from "../../../store/utils";
import { setSelectedNode } from "../../../actions";

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
        onBeforeDrag: function(context, e) { },
        onBeforeDrop: function(context, e) { },
        onAfterDrop: function(context, e) { },
        onMouseMoving: function(e) { },
        onBlur: function(e) { },
        onFocus: function(e) { },
        onBeforeDragIn: function(e) { }
    };
}
