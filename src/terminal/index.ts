import io from "socket.io-client";
import uuid from "uuid/v4";
import {EventEmitter} from "events";

let buffer = "";
const socket = io({
	transports: ["websocket"],
	upgrade: false,
	timeout: 10000
});

socket.on("connect", () => {
	console.log("Terminal socket connected");
});

socket.on("diconnect", () => {
	console.log("Terminal socket disconnected");
});

export function createServerTerminal() {
	if (socket.connected) {
		socket.emit("message", {
			topic: "XTerm",
			method: "createTerminal"
		});
	} else {
	    throw Error("Socket not connected");
	}
}

export function sendData(data) {
	socket.emit("message", {
		topic: "XTerm",
		method: "processMessage",
		data,
	});
}

export const events = new EventEmitter();

socket.on("TerminalCreated", () => {
    console.log("Terminal created on server");
    if (buffer) {
        events.emit("created", buffer);
    }
});

socket.on("TerminalData", data => {
    buffer += data;
	events.emit("data", data);
});

socket.on("TerminalNotFound", () => {
    createServerTerminal();
});
