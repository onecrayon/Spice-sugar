var Snippet = require('snippet');

exports.main = function(snippet) {
	snippet.toSnippet().write();
	return true;
}