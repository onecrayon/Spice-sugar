// Utility methods for working with Espresso

importJS('mootools-system');

// Generic Cocoa helper objects =================================

var console = {
	log: function(message){
		JSCocoaController.log(message);
	}
}

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
	},
	rangeValue: function() {
		return NSMakeRange(this.location, this.length);
	},
	value: function() {
		return NSValue.valueWithRange(this.rangeValue);
	},
	equals: function(secondRange) {
		// Checks if the current range is identical to the passed range
		var secondRange = new Range(secondRange);
		return this.location == secondRange.location && this.length == secondRange.length;
	},
	contains: function(secondRange) {
		// Checks if the current range contains the passed range
		var secondRange = new Range(secondRange);
		return this.location <= secondRange.location && ((this.location + this.length) >= (secondRange.location + secondRange.length));
	},
	inside: function(secondRange) {
		// Checks if the current range is contained by the passed range
		var secondRange = new Range(secondRange);
		return secondRange.contains(this);
	}
});



// Espresso-specific helpers ====================================

// TODO: add support for all basic text manipulations
/* Following classes are exported and available in addition to text action context:

MRRangeSet
CETextRecipe
CETextSnippet
SXSelectorGroup
*/

// ITEMIZER UTILITIES
// TODO: convert to Mootools class?
// TODO: integrate this and other direct actions (like those in Selection) into a class for interacting with the TextAction context?
var Item = new Class({
	getByRange: function(range) {
		if (!range.rangeValue)
			var range = new Range(range);
		return context.itemizer.smallestItemContainingCharacterRange(range.rangeValue);
	},
	getParentByRange: function(range) {
		if ($type(range) !== 'range')
			var range = new Range(range);
		var item = Item.getByRange(range);
		var newRange = new Range(item.range);
		
		// Select the parent if the range is the same
		while (newRange.equals(range) && item.parent) {
			item = item.parent;
			newRange = new Range(item.range);
		};
		return item;
	},
	fromRange: function(range, getParentIfMatch) {
		if (getParentIfMatch)
			return Item.getParentByRange(range);
		else
			return Item.getByRange(range);
	}
});

// SELECTION UTILITIES
var Selection = new Class({

	set: function(ranges) {
		ranges = Array.prototype.map.call(ranges, function(range){
			if ($type(range) !== 'range')
				var range = new Range(range);
			return range.value;
		});
		return context.setSelectedRanges(ranges);
	},
	get: function() {
		ranges = context.selectedRanges;
		return Array.prototype.map.call(ranges, function(range) {
			return new Range(range);
		});
	},
	expand: function(expandTo) {
		expandTo = expandTo || 'Item';
		this['expandTo' + expandTo]();
	},
	expandToItem: function() {
		var newRanges = [];
		var selectedRanges = Selection.get();
		selectedRanges.each(function(range) {
			newRanges.push(Item.fromRange(range, true).range);
		});
		return Selection.set(newRanges);
	}
});

// SNIPPET UTILITIES
var Snippet = new Class({
	initialize: function(text) {
		this.text = text;
	},
	snippet: function() {
		return CETextSnippet.snippetWithString(this.text);
	},
	write: function() {
		return context.insertTextSnippet(this.snippet());
	}
});

String.implement({
	toSnippet: function() {
		return new Snippet(String(this));
	},
	sanitizedForSnippet: function() {
		return this.replace(/(\$|\{|\}|`)/g, '\\$1');
	},
	log: function() {
		console.log(String(this));
	}
});