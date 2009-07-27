// Class for creating and executing text recipes
// Sets up the modular environment to enable scripts and helper modules
//
// Created by:
//     Ian Beck / OneCrayon -- http://onecrayon.com/
//     Thomas Aylott / SubtleGradient -- http://subtlegradient.com/
// MIT License

require.global('mootools-server');
var Range = require('range').Range;

function arrayWithRanges(ranges) {
	// Utility function for converting a single range into an array of ranges
	// Where does this belong? Stuck it here because it was where I was using it,
	// but should probably go somewhere more useful and be required in
	if ($type(ranges) !== 'array') {
		ranges = [ranges];
	}
	return ranges;
}

var TextRecipe = new Class({
	initialize: function(undo_name) {
		this.prepared = false;
		this.recipe = CETextRecipe.textRecipe;
		if ($type(undo_name) === 'string') {
			this.recipe.undoActionName = undo_name;
		}
	},
	
	insert: function(string, rangeOrIndex) {
		var index;
		if ($type(rangeOrIndex) === 'range') {
			index = rangeOrIndex.location;
		} else if ($type(rangeOrIndex) === 'number') {
			index = rangeOrIndex;
		} else {
			rangeOrIndex = new Range(rangeOrIndex);
			index = rangeOrIndex.location;
		}
		this.recipe.addInsertedString_forIndex_(string, index);
	},
	
	replace: function(string, ranges) {
		ranges = arrayWithRanges(ranges);
		ranges.each(function(range) {
			if ($type(range) !== 'range') {
				range = new Range(range);
			}
			this.recipe.addReplacementString_forRange_(string, range.rangeValue());
		});
	},
	
	remove: function(ranges) {
		ranges = arrayWithRanges(ranges);
		ranges.each(function(range) {
			if ($type(range) !== 'range') {
				range = new Range(range);
			}
			this.recipe.addDeletedRange_(range.rangeValue());
		});
	},
	
	prepare: function() {
		// Shortcut for preparing the recipe
		this.prepared = true;
		this.recipe.prepare;
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