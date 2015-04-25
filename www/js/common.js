requirejs.config({
    "baseUrl": "js/lib",
    "shim": {
        "socketio": {
            exports: "io"
        }
    },
    "paths": {
        "jquery": "jquery-2.1.3.min",
        "socketio": "socket.io-1.3.5",
        "howler": "howler.min",
        "apps": "../apps"
    }
});