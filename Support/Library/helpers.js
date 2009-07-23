// Generic Cocoa helper objects =================================

// Is this necessary anymore now that we've got system.print and system.log (with all its variations)?

exports.console = {
	log: function(message){
		system.print(message);
	}
}
