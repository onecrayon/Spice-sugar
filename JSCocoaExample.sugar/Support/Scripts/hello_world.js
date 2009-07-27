var Snippet = require('snippet');
var textContext = require('text_action_context').textContext;
var Recipe = require('text_recipe').TextRecipe;

exports.main = function(snippet) {
	var recipe = new Recipe('Hello World!');
	var selections = textContext.getSelections();
	recipe.remove(selections).apply();
	snippet.toSnippet().write();
	return true;
}