import { CSSProperties } from "react";
import store from "../store";

export function getResizerVerticalCss(): CSSProperties {
    if (store.getState().darkState) {
        return {
            zIndex: 1,
            boxSizing: "border-box",
            backgroundClip: "padding-box",
            width: "4px",
            cursor: "e-resize",
            borderLeft: "2px solid #333333",
            borderRight: "2px solid #333333"
        }
    } else {
        return {
            zIndex: 1,
            boxSizing: "border-box",
            backgroundClip: "padding-box",
            width: "4px",
            cursor: "e-resize",
            borderLeft: "2px solid #4554B2",
            borderRight: "2px solid #4554B2"
        }
    }
}

export function getResizerHorizontalCss(): CSSProperties {
    if (store.getState().darkState) {
        return {
            zIndex: 1,
            boxSizing: "border-box",
            backgroundClip: "padding-box",
            height: "2px",
            cursor: "n-resize",
            borderTop: "1px solid #1E1E1E",
            borderBottom: "1px solid #1E1E1E"
        }
    } else {
        return {
            zIndex: 1,
            boxSizing: "border-box",
            backgroundClip: "padding-box",
            height: "2px",
            cursor: "n-resize",
            borderTop: "1px solid #4554B2",
            borderBottom: "1px solid #4554B2"
        }
    }
}