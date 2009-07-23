var esp = require('espresso');

exports.main = function(snippet) {
	system.print('we are in main');
	snippet.toSnippet().write();
	return true;
}