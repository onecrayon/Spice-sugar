// Generic Cocoa helper objects =================================

var console = {
	log: function(message){
		if (message && message.log typeof 'function') return message.log();
		JSCocoaController.log(message);
	}
}
