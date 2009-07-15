// Generic Cocoa helper objects =================================

var console = {
	log: function(message){
		if (message && message.log typeof 'function') message = message.log();
		JSCocoaController.log(message);
	}
}
