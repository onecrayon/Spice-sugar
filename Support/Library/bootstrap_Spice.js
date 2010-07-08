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
	// `file` is the only required variable
	var require = function(file, filePaths, loadGlobally, forceReload) {
		// filePaths is an optional array or string of paths to search within the support folders
		var filePaths = (typeof filePaths != 'undefined' ? filePaths : null);
		// If a single file path was passed, convert it to a single element array
		if (typeof filePaths == 'string') {
			filePaths = [filePaths];
		} else if (filePaths === null) {
			filePaths = ['Library'];
		}
		// loadGlobally allows bypassing the exports system and just loading a script into the global workspace; necessary for things like Mootools
		// A script that has been loaded globally will never be reloaded; once loaded, everyone can access it
		var loadGlobally = (typeof loadGlobally != 'undefined' ? loadGlobally : false);
		// forceReload allows us to strong-arm the require system into loading a module even if it has already been loaded
		var forceReload = (typeof forceReload != 'undefined' ? forceReload : false);
		// Find the script using the Objective-C interface
		var scriptPath = SpiceController.findScript_inFolders_(file, filePaths);
		if (scriptPath == null) throw new Error("Cannot find the module '"+file+"'");
		
		// Eval the script if it hasn't already been loaded
		if (Object.prototype.hasOwnProperty.call(system.modules, file) && !forceReload) {
			// The script is already in system.modules, so already been loaded
			// If we're loading globally and/or it has been loaded globally in the past, return
			if (system.modules[file].global || (loadGlobally && system.modules[file].global)) {
				return true;
			} else if (loadGlobally) {
				// Here's a pretty todo; we're loading globally, but it has not been loaded globally in the past
				// Going through with the load could have unexpected results so for now throw an error
				throw new Error("Error: '"+file+"' has already been loaded as a local module, and should not be reloaded in the global scope");
				return false;
			}
		} else {
			// Never been loaded, so go ahead with the eval
			
			// If a global script, run it through JSCocoa and update system.modules
			if (loadGlobally) {
				__jsc__.evalJSFile(scriptPath);
				system.modules[file] = function() {};
				system.modules[file].global = true;
				system.modules[file].uri = scriptPath;
				// No need to worry about exports, etc., so exit immediately
				return true;
			} else {
				// Verify that the module isn't pending execution earlier in the require tree
				if (tree.indexOf(file) >= 0) {
					// The module has already been required (so we've got a loop on our hands)
					// For now, bail with an error message and an empty object
					system.log('Spice Error: require() loop for `' + file + '`; aborting');
					return {};
				} else {
					// Not in the tree, so add it
					tree.push(file);
				}
				
				// Parse the script as a self-contained function and store in system.modules
				system.modules[file] = eval("(function(require,exports,module,system){" + SpiceController.read(scriptPath) + "/**/\n})");
				system.modules[file].global = false;
				system.modules[file].uri = scriptPath;
				system.modules[file].exports = {};
				
				// Evaluate the module
				var module = {
					id: file,
					uri: scriptPath
				};
				system.modules[file](require, system.modules[file].exports, module, system);
				
				// Now that we've executed the module, pop it from the tree
				tree.pop();
			}
		}
		
		// Return the exports object
		return system.modules[file].exports;
	}
	
	require.global = function(file, filePaths) {
		var filePaths = (typeof filePaths != 'undefined' ? filePaths : null);
		// Shortcut to do a global load; returns true (loaded/already loaded) or false
		return require(file, filePaths, true, false);
	}
	
	require.force = function(file, filePaths, loadGlobally) {
		var filePaths = (typeof filePaths != 'undefined' ? filePaths : null);
		var loadGlobally = (typeof loadGlobally != 'undefined' ? loadGlobally : false);
		// Shortcut to force a reload
		return require(file, filePaths, loadGlobally, true);
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
			target = 'act';
		}
	} else if (!Object.prototype.hasOwnProperty.call(mod, target)) {
		target = null;
	}
	// Call function if it exists
	if (target !== null) {
		// Convert the arguments array into a Javascript array (from NSArray)
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