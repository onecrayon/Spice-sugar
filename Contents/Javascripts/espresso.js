// Utility methods for working with Espresso

importJS('mootools-server');

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
		// Sets up a custom entry for $type()
		this.$family = { name: 'range' };
	},
	rangeValue: function() {
		return NSMakeRange(this.location, this.length);
	},
	value: function() {
		return NSValue.valueWithRange(this.rangeValue());
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
	},
	log: function() {
		console.log('range(' + this.location + ',' + this.length + ')');
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

// SNIPPET UTILITIES
var Snippet = new Class({
	initialize: function(text) {
		this.text = text;
	},
	snippet: function() {
		return CETextSnippet.snippetWithString(this.text);
	},
	write: function(overwrite) {
		return context.insertTextSnippet(this.snippet());
	},
	log: function() {
		console.log(this.text);
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


// TEXT ACTION UTILITIES
var TextActionContext = new Class({
	// Selection functions
	setSelections: function(ranges) {
		ranges = Array.prototype.map.call(ranges, function(range){
			if ($type(range) !== 'range')
				var range = new Range(range);
			return range.value();
		});
		context.setSelectedRanges(ranges);
	},
	getSelections: function() {
		ranges = context.selectedRanges;
		return Array.prototype.map.call(ranges, function(range) {
			return new Range(range);
		});
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
		var selectedRanges = this.getSelections();
		selectedRanges.each(function(range) {
			newRanges.push(this.itemFromRange(range, true).range);
		}, this);
		return this.setSelections(newRanges);
	},
	// Itemizer functions
	getItemByRange: function(range) {
		if ($type(range) !== 'range')
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
	}
});

var textContext = new TextActionContext();