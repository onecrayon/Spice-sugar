// Class for creating, comparing, and otherwise handling text ranges
// Created by:
//     Ian Beck / OneCrayon -- http://onecrayon.com/
//     Thomas Aylott / SubtleGradient -- http://subtlegradient.com/
// MIT License

require.global('mootools-server');

var Range = new Class({

	initialize: function(target, length) {
		if (target && target.rangeValue) {
			// Convert from NSValue
			var range = target.rangeValue;
			this.location = range.location;
			this.length = range.length;
			
		} else if (target && $type(target.location) === 'number' && $type(target.length) === 'number') {
			// Convert from NSRange or Range
			this.location = target.location;
			this.length = target.length;
			
		} else if ($type(target) === 'array') {
			// Convert from array
			this.location = target[0];
			this.length = target[1];
			
		} else if ($type(target) === 'number' && $type(length) === 'number') {
			this.location = target;
			this.length = length;
			
		} else {
			// If nothing is passed, default to a blank range
			if (!$type(target)) this.location = 0;
			else this.location = target;
			
			if (!$type(location)) this.location = 0;
			else this.location = location;
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
	
	// Get and check syntax zones
	getZone: function() {
		// Find the range's syntax zone and cache it for later use
		if (!$type(this.zone)) {
			this.zone = '';
			if (context.string.length == this.location) {
				this.zone = context.syntaxTree.rootZone;
			} else {
				this.zone = context.syntaxTree.rootZone.zoneAtCharacterIndex_(this.location);
			}
		}
		return this.zone.typeIdentifier;
	},
	
	matchesZone: function(targetSelectors) {
		var selectors = SXSelectorGroup.selectorGroupWithString_(targetSelectors);
		// getZone() sets up this.zone and returns the string identifier
		this.getZone();
		return selectors.matches_(this.zone);
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
	
	log: function() {
		system.log('range(' + this.location + ',' + this.length + ')');
	}
});

Range.from = function(range){
	// Range.from guarantees that you get a range back
	if ($type(range) !== 'range') {
		range = new Range(range);
	}
	return range;
};

exports.Range = Range;
