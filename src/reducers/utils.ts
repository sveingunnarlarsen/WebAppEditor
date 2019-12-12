
export function searchForFileInEditors(editors, id) {
    const keys = Object.keys(editors);
    for (let i = 0; i < keys.length; i++) {
        const editor = editors[keys[i]];
        const tab = editor.tabs.find(t => t === id);
        if (tab) {
            return editor.id;
        }
    }
}