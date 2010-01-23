/*
---

script: espresso.js

description: Shortcut module to load in every available utility class and object

license: MIT license.

authors:
- Ian Beck

exports:
- TextRecipe (class)
- Range (class)
- SyntaxZone (class)
- Snippet (class)
- textContext (object)

...
*/

/*
The following Espresso API classes are additionally always exported and
available thanks to JSCocoa:

- MRRangeSet
- CETextRecipe
- CETextSnippet
- SXSelectorGroup
- SXTypeIdentifier
*/

exports.TextRecipe = require('text_recipe').TextRecipe;
exports.Range = require('range').Range;
exports.SyntaxZone = require('syntax_zone').SyntaxZone;
exports.Snippet = require('snippet').Snippet;
exports.textContext = require('text_action_context').textContext;
