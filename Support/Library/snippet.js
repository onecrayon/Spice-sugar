// Utility methods for working with Espresso text snippets
// Created by:
//     Ian Beck / OneCrayon -- http://onecrayon.com/
//     Thomas Aylott / SubtleGradient -- http://subtlegradient.com/
// MIT License

require.global('mootools-server');

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

exports.Snippet = Snippet;

String.implement({
	
	toSnippet: function() {
		return new Snippet(String(this));
	},
	
	sanitizedForSnippet: function() {
		return this.replace(/(\$|\{|\}|`|\\)/g, '\\$1');
	},
	
	log: function() {
		console.log(String(this));
	}
});
