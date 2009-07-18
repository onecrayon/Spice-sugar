function importJS(file) {
	file = JSCocoaLoaderController.findScript_(file);
	if (file == null) throw new Error("Cannot find the file '"+file+"'");
	else __jsc__.evalJSFile(file);
}
