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

exports.TextRecipe = TextRecipe;