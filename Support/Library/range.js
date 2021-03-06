/*
---

script: range.js

description: Class for creating, comparing, and otherwise handling ranges of text

license: MIT license.

authors:
- Ian Beck
- Thomas Aylott

exports:
- Range (class)

...
*/

require.global('mootools-server');

var Range = new Class({
	// Public properties
	location: 0,
	length: 0,
	limit: 0,

	initialize: function(target, length) {
		if ($type(target) == 'range') {
			this.location = target.location;
			this.length = target.length;
		} else if (target && target.rangeValue) {
			// Convert from NSValue
			var range = target.rangeValue;
			this.location = range.location;
			this.length = range.length;
			
		} else if (target && $type(target.location) == 'number' && $type(target.length) == 'number') {
			// Convert from NSRange or Range
			this.location = target.location;
			this.length = target.length;
			
		} else if ($type(target) == 'array') {
			// Convert from array
			this.location = target[0];
			this.length = target[1];
			
		} else if ($type(target) == 'number' && $type(length) == 'number') {
			this.location = target;
			this.length = length;
			
		} else {
			// If nothing is passed, default to a blank range
			if (!$type(target)) this.location = 0;
			else this.location = target;
			
			if (!$type(length)) this.length = 0;
			else this.length = length;
		}
		// Sets up a custom entry for $type()
		this.$family = { name: 'range' };
		this.limit = this.location + this.length;
	},
	
	// Functions to extract NSValue and NSRanges
	rangeValue: function() {
		return NSMakeRange(this.location, this.length);
	},
	
	value: function() {
		return NSValue.valueWithRange(this.rangeValue());
	},
	
	string: function() {
		var total_range = new Range(0, context.string.length);
		if (this.inside(total_range))
			return context.string.substringWithRange(this.rangeValue());
		else
			return false;
	},
	
	// Logical comparisons between ranges
	equals: function(secondRange) {
		// Checks if the current range is identical to the passed range
		var secondRange = new Range(secondRange);
		return this.location == secondRange.location && this.length == secondRange.length;
	},
	
	contains: function(secondRange) {
		// Checks if the current range contains the passed range
		var secondRange = new Range(secondRange);
		return this.location <= secondRange.location && (this.limit >= secondRange.limit);
	},
	
	inside: function(secondRange) {
		// Checks if the current range is contained by the passed range
		var secondRange = new Range(secondRange);
		return secondRange.contains(this);
	},
	
	// Utility functions for working with lines associated with ranges
	startLine: function() {
		return new Range(context.lineRangeForIndex_(this.location));
	},
	
	startLineNumber: function() {
		return context.lineNumberForIndex_(this.location);
	},
	
	endLine: function() {
		return new Range(context.lineRangeForIndex_(this.limit));
	},
	
	endLineNumber: function() {
		return context.lineNumberForIndex_(this.limit);
	},
	
	lineRange: function() {
		return new Range(context.lineRangeForRange_(this.rangeValue()));
	},
	
	// Text context shortcuts
	select: function() {
		context.setSelectedRanges([this.value()]);
	},
	
	log: function() {
		system.log('range(' + this.location + ',' + this.length + ')');
	}
});

Range.from = function(range){
	// Range.from guarantees that you get a range back
	if ($type(range) != 'range') {
		range = new Range(range);
	}
	return range;
};

exports.Range = Range;
