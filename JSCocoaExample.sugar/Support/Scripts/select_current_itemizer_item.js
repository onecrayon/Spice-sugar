var textContext = require('text_action_context').textContext;

// Implementation
exports.main = function() {
	textContext.expandSelectionToItem();
	return true;
};
