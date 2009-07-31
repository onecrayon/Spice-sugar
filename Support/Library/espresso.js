// Shortcut module to load in all available utility methods for working with Espresso
// Created by:
//     Ian Beck / OneCrayon -- http://onecrayon.com/
//     Thomas Aylott / SubtleGradient -- http://subtlegradient.com/
// MIT License

// TODO: add support for all basic text manipulations
/* Following classes are exported and available in addition to text action context:

MRRangeSet
CETextRecipe
CETextSnippet
SXSelectorGroup
*/

exports.TextRecipe = require('text_recipe').TextRecipe;
exports.Range = require('range').Range;
exports.Snippet = require('snippet').Snippet;
exports.textContext = require('text_action_context').textContext;
