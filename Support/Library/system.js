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

// Handles setting up the modular environment
// Can't be an anonymous function because JSCocoaLoader has to be able to get a return value
var bootstrap_JSCocoaLoader = function(script) {
	// Setup the logging functions for the universal system object
	var shim = function(message) {
		JSCocoaController.log(String(message));
	};
	
	var log = {fatal:shim, error:shim, warn:shim, info:shim, debug:shim};
	
	var system = {
		log: log,
		print: shim,
		modules: {}
	};
	
	// This function powers Javascript inclusions
	// File is the only required variable
	var require = function(file, filePaths, loadGlobally, forceReload) {
		// filePaths is an optional array or string of paths to search within the support folders
		var filePaths = (typeof filePaths !== 'undefined' ? filePaths : false);
		// If a single file path was passed, convert it to a single element array
		if (typeof filePaths === 'string') {
			filePaths = [filePaths];
		} else if (filePaths === false) {
			filePaths = ['Library'];
		}
		// loadGlobally allows bypassing the exports system and just loading a script into the global workspace; necessary for things like Mootools
		// A script that has been loaded globally will never be reloaded; once loaded, everyone can access it
		var loadGlobally = (typeof loadGlobally !== 'undefined' ? loadGlobally : false);
		// forceReload allows us to strong-arm the require system into loading a module even if it has already been loaded
		var forceReload = (typeof forceReload !== 'undefined' ? forceReload : false);
		// Find the script (should I be looping through the folders in Javascript?)
		var scriptPath = JSCocoaLoaderController.findScript_inFolders_(file, filePaths);
		if (scriptPath == null) throw new Error("Cannot find the module '"+file+"'");
		// Check system.modules to see if this has been loaded before
		if (Object.prototype.hasOwnProperty.call(system.modules, file) && !forceReload) {
			// If we're loading globally and/or it has been loaded globally in the past, return
			if (system.modules[file].global || (loadGlobally && system.modules[file].global)) {
				return true;
			} else if (loadGlobally) {
				// Here's a pretty todo; we're loading globally, but it has not been loaded globally in the past
				// Going through with the load could have unexpected results so for now throw an error
				throw new Error("Error: '"+file+"' has already been loaded as a local module, and should not be reloaded in the global scope");
				return false;
			}
			// No global issues, so return the evalled code
			return system.modules[file].module;
		}
		// If a global script, eval it and update system.modules
		if (loadGlobally) {
			__jsc__.evalJSFile(scriptPath);
			system.modules[file] = {
				global: true,
				path: scriptPath,
				module: function() {}
			};
			return true;
		}
		// Parse the script as a self-contained function and store in system.modules
		var module = eval("(function(require,exports,module,system,print){" + JSCocoaController.read(scriptPath) + "/**/\n})");
		system.modules[file] = {
			global: false,
			path: scriptPath,
			module: module
		};
		// Evaluate the module
		var thisModule = {
			id: file,
			path: scriptPath
		}
		var exports = {};
		var print = function(message) {
			system.print(message);
		}
		module(require, exports, thisModule, system, print);
		// Return the exports object
		return exports
	}
	
	var require.global = function(file) {
		// Shortcut to do a global load; returns true (loaded/already loaded) or false
		return require(file, false, true);
	}
	
	// Now that we've got the basic logic setup, it's time to actually run the script
	// Load with require
	// Check for existence of act, main, or specified target function
	// Call function if it exists
	// If no function, return? It'll already have been evaluated as part of the require
}