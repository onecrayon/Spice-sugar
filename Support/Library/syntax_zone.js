/*
---

script: syntax_zone.js

description: Provides easy access to data and comparisons for syntax zones

license: MIT license.

authors:
- Ian Beck

exports:
- SyntaxZone (class)

provides:
- Range.getZone()
- Range.matches(targetSelectors)

...
*/

require.global('mootools-server');
var Range = require('range').Range;

var SyntaxZone = new Class({
	// Public properties
	id: '', // String value of the zone's type identifier
	range: null,
	sxzone: null, // The actual SXZone object
	
	initialize: function(rangeOrIndex) {
		if ($type(rangeOrIndex) == 'syntaxzone') {
			// Just in case someone tries to reinitialize the SyntaxZone
			this.sxzone = rangeOrIndex.sxzone;
		} else if ($type(rangeOrIndex) == 'range') {
			// Grab the SXZone for the given range
			if (context.string.length == rangeOrIndex.location) {
				this.sxzone = context.syntaxTree.rootZone;
			} else {
				this.sxzone = context.syntaxTree.rootZone.zoneAtCharacterIndex_(rangeOrIndex.location);
			}
		} else if ($type(rangeOrIndex) == 'number') {
			// Grab the SXZone for the give index
			this.sxzone = context.syntaxTree.rootZone.zoneAtCharacterIndex_(rangeOrIndex);
		} else if ($chk(rangeOrIndex) && rangeOrIndex.typeIdentifier) {
			// An SXZone was already passed
			this.sxzone = rangeOrIndex;
		}
		
		// Set up custom entry for $type()
		this.$family = { name: 'syntaxzone' };
		
		// Set up some data for easy access
		if (this.sxzone.typeIdentifier)
			this.id = this.sxzone.typeIdentifier.stringValue;
		if (this.sxzone.range)
			this.range = new Range(this.sxzone.range);
		
	},
	
	// Access methods for SXZone properties
	text: function() {
		if (this.sxzone.text)
			return this.sxzone.text;
		else
			return '';
	},
	
	// Syntax tree methods
	parent: function() {
		if ($chk(this.sxzone.parent))
			return new SyntaxZone(this.sxzone.parent);
		else
			return null;
	},
	
	childCount: function() {
		return this.sxzone.childCount;
	},
	
	childAt: function(rangeOrIndex) {
		var index = 0;
		if ($type(rangeOrIndex) == 'range') {
			index = rangeOrIndex.location;
		} else if ($type(rangeOrIndex) == 'number') {
			index = rangeOrIndex;
		}
		
		return new SyntaxZone(this.sxzone.childAtIndex_(index));
	},
	
	childrenMatching: function(targetSelectors, maxDepth) {
		// Searches for all child zones matching a zone selector string
		// To search for direct children only, use maxDepth = 1
		// Returns an array of SyntaxZone objects
		if ($type(maxDepth) != 'number') {
			var maxDepth = false;
		}
		var selectors = SXSelectorGroup.selectorGroupWithString_(targetSelectors);
		var children = null;
		if (maxDepth)
			children = this.sxzone.descendantSelectablesMatchingSelectors_maximumDepth_(selectors, maxDepth);
		else
			children = this.sxzone.descendantSelectablesMatchingSelectors_(selectors);
		var zones = new Array();
		if ($chk(children)) {
			children.each(function(zone) {
				zones.push(new SyntaxZone(zone));
			});
		}
		return zones;
	},
	
	// Comparison methods
	matches: function(targetSelectors) {
		var selectors = SXSelectorGroup.selectorGroupWithString_(targetSelectors);
		return selectors.matches_(this.sxzone);
	},
	
	typeEquals: function(targetSelector) {
		var target = SXTypeIdentifier.typeIdentifierWithString_(targetSelector);
		return this.sxzone.typeIdentifier.isEqualToTypeIdentifier_(target);
	},
	
	log: function() {
		system.log(this.id + ' at ' + 'range(' + this.range.location + ',' + this.range.length + ')');
	}
});

SyntaxZone.from = function(target){
	// SyntaxZone.from guarantees that you get a syntax zone back
	if ($type(target) != 'syntaxzone') {
		target = new SyntaxZone(target);
	}
	return target;
};

// Range shortcuts for dealing with syntax zones
Range.implement({
	getZone: function() {
		// Find the range's syntax zone, cache it for later use, and return the SyntaxZone object
		if (!$chk(this._zone)) {
			this._zone = new SyntaxZone(this);
		}
		return this._zone;
	},
	
	matchesZone: function(targetSelectors) {
		// Shortcut to check if the range matches a zone selector string
		var zone = this.getZone();
		return zone.matches(targetSelectors);
	}
});

exports.SyntaxZone = SyntaxZone;