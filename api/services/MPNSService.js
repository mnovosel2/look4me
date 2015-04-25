var mpns = require('push-notify').mpns();

module.exports = {
	createMessage: function(uri, subject, body){
		if(!uri || !subject || !body){
			this.error = new Error();
		}
		var toSend = {
			pushUri : uri,
			text1: subject,
			text2: body
		};
		this.data = toSend;
		return this;
	},
	sendMessage: function(){
		if(this.error){
			return false;
		} else {
			mpns.send(this.data);
			return true;
		}
	}
}