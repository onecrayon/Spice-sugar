// Utility methods for working with Espresso

importJS('mootools-system');

// Generic Cocoa helper objects =================================

var console = {
	log: function(message){
		JSCocoaController.log(message);
	}
}

// TODO: convert this to a Mootools class
function Range(location, length){
	if (this instanceof Range) throw new Error("Don't use `new Range()`; use `Range()`"); // TODO: Reverse this logic once implemented as a MooTools class?
	return NSMakeRange(location, length);
};
Range.from = function(shouldBeRange){
	if (shouldBeRange.rangeValue)
		return Range.from(shouldBeRange.rangeValue);
	
	if ($type(shouldBeRange) === 'array')
		return Range(shouldBeRange[0], shouldBeRange.length === 1 ? 0 : shouldBeRange[shouldBeRange.length-1]);
	
	if (/number|string/.test($type(shouldBeRange)))
		return Range(shouldBeRange, 0);
	
	if (shouldBeRange && $type(shouldBeRange.location)==='number' && $type(shouldBeRange.length)==='number')
		return Range(shouldBeRange.location, shouldBeRange.length);
};
Range.match = function(rangeA, rangeB){
	rangeA = Range.from(rangeA);
	rangeB = Range.from(rangeB);
	return  rangeA.location == rangeB.location &&
			rangeA.length == rangeB.length
	;
};

// Espresso-specific helpers ====================================

// TODO: add support for all basic text manipulations
/* Following classes are exported and available in addition to text action context:

MRRangeSet
CETextRecipe
CETextSnippet
SXSelectorGroup
*/

// TODO: Convert to Mootools class
function Item(){};
Item.getByRange = function(range){
	return context.itemizer.smallestItemContainingCharacterRange(range);
};
Item.getParentByRange = function(range){
	range = Range.from(range);
	var item = Item.getByRange(range);
	var newRange = item.range;
	
	// Select the parent if the range is the same
	while (Range.match(newRange, range) && item.parent) {
		item = item.parent;
		newRange = item.range;
	};
	return item;
};
Item.fromRange = function(range, getParentIfMatch){
	if (getParentIfMatch)
		return Item.getParentByRange(range);
	else
		return Item.getByRange(range);
};


// TODO: Convert to Mootools class
function Selection(){};
Selection.set = function(ranges){
	ranges = Array.prototype.map.call(ranges, function(range){
		return NSValue.valueWithRange(Range.from(range));
	});
	context.setSelectedRanges(ranges);
	// return this; // TODO: Make Selection OOP
	return ranges;
}
Selection.get = function(){
	return context.selectedRanges;
};
Selection.expand = function(expandTo){
	expandTo = expandTo || 'Item';
	Selection['expandTo' + expandTo]();
}
Selection.expandToItem = function selectCurrentItemizer(){
	var newRanges = [];
	var selectedRanges = Selection.get();
	
	for (var i=0; i < selectedRanges.length; i++)
		newRanges.push(Item.fromRange(selectedRanges[i], true).range);
	
	return Selection.set(newRanges);
};