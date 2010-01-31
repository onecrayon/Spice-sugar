/*
---

script: snippet.js

description: Utility class for working with Espresso text snippets

license: MIT license.

authors:
- Ian Beck

exports:
- Snippet (class)

provides:
- String.toSnippet()
- String.sanitizedForSnippet()
- String.log()

...
*/

require.global('mootools-server');
var textContext = require('text_action_context').textContext;
var TextRecipe = require('text_recipe').TextRecipe;
var Range = require('range').Range;

// SNIPPET UTILITIES
var Snippet = new Class({
	// Public properties
	text: '',
	
	initialize: function(text) {
		this.text = text;
	},
	
	snippet: function() {
		return CETextSnippet.snippetWithString(this.text);
	},
	
	write: function(overwrite, undo_name) {
		// Overwriting the first selection defaults to true
		var overwrite = ($type(overwrite) ? overwrite : true);
		// undo_name is only necessary if overwite == true or is a range
		// (No way to set an undo name for insert snippet)
		var undo_name = ($type(undo_name) == 'string' ? undo_name : 'Insert Snippet');
		if (overwrite !== false) {
			var recipe = new TextRecipe(undo_name);
			if ($type(overwrite) != 'boolean') {
				// User must have passed in a specific range to overwrite
				var selection = Range.from(overwrite);
			} else {
				var selections = textContext.getSelections();
				// We only want to delete the first range (where we're inserting the snippet)
				var selection = selections[0];
			}
			var insert = null;
			if (!$type(selections) || selections.length > 1) {
				// If there are multiple ranges, we need to verify that the cursor will be in the right place after deletions
				insert = selection.location;
			}
			recipe.remove(selection).apply();
			if ($type(insert)) {
				textContext.setSelection([insert, 0]);
			}
		}
		return context.insertTextSnippet(this.snippet());
	},
	
	log: function() {
		system.log(this.text);
	}
});

exports.Snippet = Snippet;

String.implement({
	
	toSnippet: function() {
		return new Snippet(String(this));
	},
	
	sanitizedForSnippet: function() {
		return this.replace(/(\$|\{|\}|`|\\)/g, '\\$1');
	},
	
	log: function() {
		system.log(String(this));
	}
});
