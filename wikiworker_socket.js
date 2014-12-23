//NOT USED BECAUSE FIREFOX DOESNT ALLOW SOCKETS IN WORKERS!

socket = new WebSocket("ws://127.0.0.1:8888/websocket");
		
var create_socket = function(_address)
{
	socket.addEventListener('message',function(){return function(evt){postMessage(evt.data);}}());
};

onmessage = function(evt){create_socket(evt.data)};