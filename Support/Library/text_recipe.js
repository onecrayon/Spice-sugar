/*
---

script: text_recipe.js

description: Class for creating and executing text recipes

license: MIT license.

authors:
- Ian Beck

exports:
- TextRecipe (class)

...
*/

require.global('mootools-server');
var Range = require('range').Range;

function arrayWithRanges(ranges) {
	// Utility function for converting a single range into an array of ranges
	// Where does this belong? Stuck it here because it was where I was using it,
	// but should probably go somewhere more useful and be required in
	if ($type(ranges) != 'array') {
		ranges = [ranges];
	}
	return ranges;
}

var TextRecipe = new Class({
	initialize: function(undo_name) {
		this.prepared = false;
		this.recipe = CETextRecipe.textRecipe;
		if ($type(undo_name) == 'string') {
			this.recipe.undoActionName = undo_name;
		} else if (SpiceController.undoName !== null) {
			this.recipe.undoActionName = SpiceController.undoName;
		}
	},
	
	insert: function(string, rangeOrIndex, insertAfterRange) {
		// We default to inserting the text at the end of the passed range
		var insertAfterRange = ($type(insertAfterRange) ? insertAfterRange : true);
		var index;
		if ($type(rangeOrIndex) == 'number') {
			index = rangeOrIndex;
		} else {
			// Default to the first range if none explicitly passed
			if (!$type(rangeOrIndex)) {
				rangeOrIndex = new Range(context.selectedRanges[0]);
			} else if ($type(rangeOrIndex) != 'range') {
				rangeOrIndex = new Range(rangeOrIndex);
			}
			
			if (insertAfterRange) {
				index = rangeOrIndex.limit;
			} else {
				index = rangeOrIndex.location;
			}
		}
		this.recipe.addInsertedString_forIndex_(string, index);
		return this;
	},
	
	insertAfter: function(string, rangeOrIndex) {
		return this.insert(string, rangeOrIndex, true);
	},
	
	insertBefore: function(string, rangeOrIndex) {
		return this.insert(string, rangeOrIndex, false);
	},
	
	replace: function(string, ranges) {
		ranges = arrayWithRanges(ranges);
		ranges.each(function(range) {
			range = Range.from(range);
			this.recipe.addReplacementString_forRange_(string, range.rangeValue());
		}, this);
		return this;
	},
	
	remove: function(ranges) {
		ranges = arrayWithRanges(ranges);
		ranges.each(function(range) {
			range = Range.from(range);
			this.recipe.addDeletedRange_(range.rangeValue());
		}, this);
		return this;
	},
	
	prepare: function() {
		// Shortcut for preparing the recipe
		this.prepared = true;
		this.recipe.prepare;
		return this;
	},
	
	numberOfChanges: function() {
		if (!this.prepared) {
			this.prepare();
		}
		return this.recipe.numberOfChanges;
	},
	
	apply: function() {
		return context.applyTextRecipe_(this.recipe);
	}
});

// Range shortcuts for performing text recipes
Range.implement({
	insert: function(string, insertAfterRange, undo_name) {
		// Defaults to inserting after
		// undo_name is optional
		return new TextRecipe(undo_name).insert(string, this, insertAfterRange).apply();
	},
	
	insertAfter: function(string, undo_name) {
		return this.insert(string, true, undo_name);
	},
	
	insertBefore: function(string, undo_name) {
		return this.insert(string, false, undo_name);
	},
	
	replace: function(string, undo_name) {
		// undo_name is optional
		return new TextRecipe(undo_name).replace(string, this).apply();
	},
	
	remove: function(undo_name) {
		// undo_name is optional
		return new TextRecipe(undo_name).remove(this).apply();
	}
});

// String shortcuts for performing text recipes
String.implement({
	insert: function(range, insertAfterRange, undo_name) {
		return new TextRecipe(undo_name).insert(String(this), range, insertAfterRange).apply();
	},
	
	insertAfter: function(range, undo_name) {
		return this.insert(range, true, undo_name);
	},
	
	insertBefore: function(range, undo_name) {
		return this.insert(range, false, undo_name);
	},
	
	// Writes the string using text recipes; very similar to Snippet.write()
	write: function(overwrite, undo_name) {
		// Overwriting the first selection defaults to true, but can be false or a range
		var overwrite = ($type(overwrite) ? overwrite : true);
		// undo_name is optional
		var undo_name = ($type(undo_name) == 'string' ? undo_name : null);
		var range = null;
		if (overwrite !== false) {
			var recipe = new TextRecipe(undo_name);
			if ($type(overwrite) != 'boolean') {
				// User must have passed in a specific range to overwrite
				range = Range.from(overwrite);
			} else {
				range = textContext.getFirstSelection();
			}
			return recipe.replace(String(this), range).apply();
		} else {
			// Overwrite is false, so we'll default to inserting the string after the first range
			range = textContext.getFirstSelection();
			return this.insertAfter(range, undo_name);
		}
	}
});

exports.TextRecipe = TextRecipe;