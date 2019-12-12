import store from "./";

export function getFileById(id: string) {
    return store.getState().app.fileSystemObjects.find(f => f.id === id);
}

export function getPrettierConfig() {
    const config = store.getState().app.fileSystemObjects.find(f => f.path === "/.prettierrc" || f.path === "/.prettierrc.json");
    if (config) {
        try {
            return JSON.parse(config.content);
        } catch (e) {
            console.log("Error parsing prettier config: ", e.message);
            return null;
        }
    }
    return null;
}