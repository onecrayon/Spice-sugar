// Use require() to access Javascript modules
// To access a specific class/variable within a module use the syntax below
var Snippet = require('snippet').Snippet;

/* By default, your function must be called 'exports.main' or 'exports.act' (note: no 'var'!)
   If you specify <function> in your XML action definition, this should instead be that name
      ex.: `<function>my_action</function>` in XML => `exports.my_action = function(){}` here
   
   Any items in your <arguments> array within the XML action definition will be passed
   as variables here. (So if you had three items in <arguments>, your function would need
   to accept three variables for you to access them.
      ex.:  exports.main = function(var1, var2, var2) {}
*/
exports.main = function(snippet) {
	snippet.toSnippet().write();
	// Always return a boolean from your function; false will make Espresso beep
	return true;
}

/* If you place your action logic outside of a function, you will not be able to return,
   but it will be executed regardless (Espresso will just always receive 'true' unless
   there's some error).
   
   Using exports.main is recommended
*/