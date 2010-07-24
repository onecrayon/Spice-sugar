/*
---

script: bootstrap_Spice.js

description: Internal function for bootstrapping the modular environment.
             DO NOT OVERRIDE OR MODIFY. This is the keystone to running
             any Spice module.

license: MIT license.

authors:
- Ian Beck

...
*/

// Handles setting up the modular environment
// Can't be an anonymous function because Spice has to be able to get a return value
var bootstrap_Spice = function(script, args) {
	// Setup the logging functions for the universal system object
	var log = function(message, label) {
		// lable is currently meaningless, and only supported because it's in the CommonJS spec
		SpiceController.log(String(message));
	};
	
	// Setup simple subprocess execution via shell command
	// Might want to setup something more complex down the road, but this is fine for now
	var shell = function(command, shell, envObject) {
		// Make sure they passed a command
		if (typeof command == 'undefined' || command == '') {
			log("Spice error: system.shell() requires at minimum a single argument (string with your shell command)");
			return false;
		}
		// Setup the shell variable
		var availShells = ['bash', 'csh', 'ksh', 'sh', 'tcsh', 'zsh'];
		var shell = (typeof shell == 'undefined' ? availShells[0] : shell);
		if (availShells.indexOf(shell) < 0) {
			log("Spice error: system.shell() can only run one of the following shells: bash, csh, ksh, sh, tcsh, zsh");
			return false;
		}
		// Make sure envObject exists as a variable
		var envObject = (typeof envObject == 'undefined' ? null : envObject);
		// Setup the variables we'll be using to pass things on to SpiceController
		var args = null;
		var env = null;
		
		// Create our shell command executable
		args = ["/bin/" + shell, "-c", command];
		
		// Set the env dictionary if it was passed
		if (envObject instanceof Object) {
			env = envObject;
		}
		
		return SpiceController.runProcess_withEnv_(args, env);
	};
	
	var system = {
		log: log,
		print: log,
		shell: shell,
		modules: {}
	};
	
	// tree allows us to track what modules are currently being loaded
	// This allows us to prevent infinite loops if modules require each other
	// TODO: optimize this code and figure out if there's a way to throw error messages or something because the exports never show up right even after we make it back up the tree
	var tree = new Array();
	tree.findID = function(id) {
		for (var i = 0, len = tree.length; i < len; i++) {
			if (tree[i].id == id)
				return i;
		}
		return false;
	}
	tree.remove = function(id) {
		var index = tree.findID(id);
		if (index !== false) {
			tree.splice(index, 1);
		}
	};
	
	// This function powers Javascript inclusions
	// `moduleName` is the only required variable (string; the module name)
	var require = function(moduleName, searchPaths, loadGlobally, forceReload) {
		// searchPaths is an optional array or string of paths to search within the support folders
		var searchPaths = (typeof searchPaths != 'undefined' ? searchPaths : null);
		// If a single search path was passed, convert it to a single element array
		if (typeof searchPaths == 'string') {
			searchPaths = [searchPaths];
		} else if (searchPaths === null) {
			searchPaths = ['Library'];
		}
		// loadGlobally allows bypassing the exports system and just loading a script into the global workspace; necessary for things like Mootools
		// A script that has been loaded globally will never be reloaded; once loaded, everyone can access it
		var loadGlobally = (typeof loadGlobally != 'undefined' ? loadGlobally : false);
		// forceReload allows us to strong-arm the require system into loading a module even if it has already been loaded
		var forceReload = (typeof forceReload != 'undefined' ? forceReload : false);
		// Find the script using the Objective-C interface
		var modulePath = SpiceController.findModule_inFolders_(moduleName, searchPaths);
		if (modulePath == null) throw new Error("Cannot find the module '"+moduleName+"'");
		
		// Eval the script if it hasn't already been loaded
		if (Object.prototype.hasOwnProperty.call(system.modules, moduleName) && !forceReload) {
			// The script is already in system.modules, so already been loaded
			// If we're loading globally and/or it has been loaded globally in the past, return
			if (system.modules[moduleName].global || (loadGlobally && system.modules[moduleName].global)) {
				return true;
			} else if (loadGlobally) {
				// Here's a pretty todo; we're loading globally, but it has not been loaded globally in the past
				// Going through with the load could have unexpected results so for now throw an error
				throw new Error("Error: '"+moduleName+"' has already been loaded as a local module, and should not be reloaded in the global scope");
				return false;
			}
		} else {
			// Never been loaded, so go ahead with the eval
			
			// If a global script, run it through JSCocoa and update system.modules
			if (loadGlobally) {
				if (SpiceController.isFile(modulePath)) {
					__jsc__.evalJSFile(modulePath);
				} else if (SpiceController.isDirectory(modulePath)) {
					__jsc__.evalJSString(SpiceController.readModule_withoutExports(modulePath, true));
				}
				system.modules[moduleName] = function() {};
				system.modules[moduleName].global = true;
				system.modules[moduleName].uri = modulePath;
				// No need to worry about exports, etc., so exit immediately
				return true;
			} else {
				// TODO: Figure out how to parse in modules that are folders (only handles files right now)
				
				// Verify that the module isn't pending execution earlier in the require tree
				if (tree.indexOf(moduleName) >= 0) {
					// The module has already been required (so we've got a loop on our hands)
					// For now, bail with an error message and an empty object
					system.log('Spice Error: require() loop for `' + moduleName + '`; aborting');
					return {};
				} else {
					// Not in the tree, so add it
					tree.push(moduleName);
				}
				
				// Parse the script as a self-contained function and store in system.modules
				system.modules[moduleName] = eval("(function(require,exports,module,system){" + SpiceController.readModule(modulePath) + "/**/\n})");
				system.modules[moduleName].global = false;
				system.modules[moduleName].uri = modulePath;
				system.modules[moduleName].exports = {};
				
				// Evaluate the module
				var module = {
					id: moduleName,
					uri: modulePath
				};
				system.modules[moduleName](require, system.modules[moduleName].exports, module, system);
				
				// Now that we've executed the module, pop it from the tree
				tree.pop();
			}
		}
		
		// Return the exports object
		return system.modules[moduleName].exports;
	}
	
	require.global = function(moduleName, searchPaths) {
		var searchPaths = (typeof searchPaths != 'undefined' ? searchPaths : null);
		// Shortcut to do a global load; returns true (loaded/already loaded) or false
		return require(moduleName, searchPaths, true, false);
	}
	
	require.force = function(moduleName, searchPaths, loadGlobally) {
		var searchPaths = (typeof searchPaths != 'undefined' ? searchPaths : null);
		var loadGlobally = (typeof loadGlobally != 'undefined' ? loadGlobally : false);
		// Shortcut to force a reload
		return require(moduleName, searchPaths, loadGlobally, true);
	}
	
	// Now that we've got the basic logic setup, it's time to actually run the script
	// Load with require
	var mod = require(script, 'Scripts', false);
	// Check for existence of act, main, or specified target function
	var target = SpiceController.target;
	if (target === null) {
		if (Object.prototype.hasOwnProperty.call(mod, 'main')) {
			target = 'main';
		} else if (Object.prototype.hasOwnProperty.call(mod, 'act')) {
			// DEPRECATED: left over from the old days of TEA
			target = 'act';
		}
	} else if (!Object.prototype.hasOwnProperty.call(mod, target)) {
		target = null;
	}
	// Call function if it exists
	if (target !== null) {
		// Convert the arguments array into a Javascript array (from NSArray)
		// TODO: Is this necessary? Not sure if JSCocoa automatically converts to an array or not
		var js_args = [];
		for (var i = 0; i < args.count; i++) {
			js_args.push(args.objectAtIndex(i));
		}
		// apply() lets us pass in an array of arguments
		return mod[target].apply(mod, js_args);
	}
	// If no function, return; it'll already have been evaluated as part of the require
	return true;
}