var socket = {
	io: null,
	createConnect: function(io) {
		console.log('createConnect success');
		this.io = io;
		io.on("connection", function(socket) {
			console.log('createConnect success');
			socket.on("message", function(obj) {
				console.log(obj);
			});
		});
	},
	sendMessage: function(txt) {
		this.io.emit("message", txt);
	}
}
module.exports = socket;