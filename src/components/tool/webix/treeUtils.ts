export function options(id, opts) {
	return Object.assign(
		{},
		{
			container: id,
			view: "tree",
			select: true,
			multiselect: true,
			borderless: true,
			activeTitle: false,
			drag: true,
			animate: true,
			drop: true,
			scrollY: "auto",
			scrollX: false,
		},
		opts
	);
}

export function template(obj, common) {
	return `
    ${common.icon ? common.icon.apply(this, arguments) : ""}
    <img src='${obj.image}' style='width:20px;margin:-3px 3px 0px 1px;vertical-align:middle'>
    <span style='${obj.modified ? "color:wheat;" : ""}'>${obj.value}</span>`;
}

export function folder(obj, common) {
	if (obj.$count && obj.open) {
		return "<div class='webix_tree_folder_open'></div>";
	} else if (obj.$count || obj.type == "folder") {
		return "<div class='webix_tree_folder'></div>";
	}
	return "<div class='webix_tree_file'></div>";
}
