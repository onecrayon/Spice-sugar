// Utility methods for working with Espresso
// Created by:
//     Ian Beck / OneCrayon -- http://beckism.com/
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

Range.from = function(range){
	return new Range(range);
};

exports.Range = Range;
