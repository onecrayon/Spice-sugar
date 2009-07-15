// Utility methods for working with Espresso
// Created by:
//     Ian Beck / OneCrayon -- http://beckism.com/
//     Thomas Aylott / SubtleGradient -- http://subtlegradient.com/
// MIT License

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
