/*
---

script: text_action_context.js

description: Convenience class and object for working with context for TextActions

license: MIT license.

authors:
- Ian Beck

exports:
- TextActionContext (class)
- textContext (object)

...
*/

require.global('mootools-server');
var Range = require('range').Range;

// TEXT ACTION UTILITIES
var TextActionContext = new Class({
	
	// Selection functions
	setSelections: function(ranges) {
		ranges = Array.prototype.map.call(ranges, function(range){
			if ($type(range) != 'range')
				var range = new Range(range);
			return range.value();
		});
		context.setSelectedRanges(ranges);
	},
	
	setSelection: function(range) {
		// Shortcut to set just a single selection
		this.setSelections([range]);
	},
	
	getSelections: function() {
		ranges = context.selectedRanges;
		// return Array.map(ranges, function(range){
		// 	return new Range(range);
		// });
		return Array.slice(ranges);
	},
	
	getFirstSelection: function() {
		return new Range(context.selectedRanges[0]);
	},
	
	expandSelection: function(expandTo) {
		expandTo = expandTo || 'Item';
		this['expandSelectionTo' + expandTo]();
	},
	
	expandSelectionToItem: function() {
		var newRanges = [];
		this.getSelections().each(function(range) {
			newRanges.push(this.itemFromRange(range, true).range);
		}, this);
		this.setSelections(newRanges);
	},
	
	// Working with lines
	lineNumber: function(atIndex) {
		if ($type(atIndex) != 'number')
			var atIndex = this.getFirstSelection().location;
		return context.lineStorage.lineNumberForIndex(atIndex);
	},
	
	rangeForLine: function(lineNumber) {
		if ($type(lineNumber) != 'number')
			var lineNumber = this.lineNumber();
		if (lineNumber >= 1 && lineNumber <= context.lineStorage.count)
			return new Range(context.lineStorage.lineRangeForLineNumber(lineNumber));
		else
			return false;
	},
	
	// Itemizer functions
	getItemByRange: function(range) {
		if ($type(range) != 'range')
			var range = new Range(range);
		return context.itemizer.smallestItemContainingCharacterRange(range.rangeValue());
	},
	
	getItemParentByRange: function(range) {
		var item = this.getItemByRange(range);
		var newRange = new Range(item.range);
		
		// Select the parent if the range is the same
		while (newRange.equals(range) && item.parent) {
			item = item.parent;
			newRange = new Range(item.range);
		};
		return item;
	},
	
	itemFromRange: function(range, getParentIfMatch) {
		if (getParentIfMatch)
			return this.getItemParentByRange(range);
		else
			return this.getItemByRange(range);
	},
	
	// Utilities for fetching document preferences
	lineEndingString: function() {
		return context.textPreferences.lineEndingString;
	},
	
	indentationString: function() {
		return context.textPreferences.tabString;
	},
	
	xHTMLCloseString: function() {
		// Uses the self-closing tag string defined by TEA
		return NSUserDefaults.standardUserDefaults.stringForKey_('TEASelfClosingString');
	}
});

exports.textContext = new TextActionContext();
exports.TextActionContext = TextActionContext;