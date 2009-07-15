// Utility methods for working with Espresso
// Created by:
//     Ian Beck / OneCrayon -- http://beckism.com/
//     Thomas Aylott / SubtleGradient -- http://subtlegradient.com/
// MIT License

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
		
		newRange.log();
		new Range(range).log();
		
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
