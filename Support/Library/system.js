// This function is going to die very, very soon
// Merely here to provide a way to load scripts while testing require()
function importJS(file, searchScripts) {
	var searchScripts = (typeof searchScripts !== 'undefined' ? searchScripts : false);
	if (searchScripts) {
		var folders = new Array('Scripts', 'Library');
	} else {
		var folders = new Array('Library');
	}
	file = JSCocoaLoaderController.findScript_inFolders_(file, folders);
	if (file == null) throw new Error("Cannot find the file '"+file+"'");
	else __jsc__.evalJSFile(file);
}