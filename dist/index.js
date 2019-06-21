"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const uuid = require("uuid/v4");
const utility_1 = require("./utility");
let baseApiUrl = 'http://';
// let baseApiUrl = 'https://';
let baseWsUrl = 'ws://';
let webSocketConnection;
// let baseWsUrl = 'wss://';
let sizeToFilenameMap = new Map();
const app = function (serverUrl, httpPort = 3000, wsPort = 8080) {
    baseApiUrl = `${baseApiUrl}${serverUrl}:${httpPort}`;
    baseWsUrl = `${baseWsUrl}${serverUrl}:${wsPort}`;
    // Establish WebSocket Connection.
    webSocketConnection = new WebSocket(baseWsUrl);
    webSocketConnection.binaryType = 'arraybuffer';
};
exports.app = app;
const optimize = function (files, fileCompleted) {
    if (!webSocketConnection || webSocketConnection.readyState !== WebSocket.OPEN) {
        throw 'app not initilized. Call ';
    }
    if (files.length > 0) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const formData = new FormData();
            for (const file of files) {
                let newFile;
                const placeholder = uuid();
                if (utility_1.isArrayBuffer(file)) {
                    // debugger;
                    newFile = (new Blob([new Uint8Array(file)]));
                    formData.append(placeholder, newFile);
                }
                else if (utility_1.isFile(file)) {
                    newFile = file;
                    formData.append(placeholder, newFile);
                }
            }
            const response = yield axios_1.default.post(`${baseApiUrl}/optimize`, formData, { responseType: 'text' });
            // debugger;s
            if (response && response.status === 200 && response.data) {
                const jobId = response.data;
                webSocketConnection.onopen = () => {
                    // debugger;
                    console.log('WebSocket Connected');
                };
                webSocketConnection.onerror = error => {
                    console.log(`WebSocket error: ${error}`);
                    resolve();
                };
                webSocketConnection.onmessage = (event) => {
                    if (utility_1.isArrayBuffer(event.data)) {
                        const data = event.data;
                        const size = data.byteLength;
                        const filename = sizeToFilenameMap.get(size);
                        fileCompleted(data, filename);
                        sizeToFilenameMap.delete(size);
                    }
                    else if (event.data === 'close') {
                        webSocketConnection.close();
                        resolve();
                    }
                    else {
                        let data;
                        try {
                            data = JSON.parse(event.data);
                        }
                        catch (error) {
                            // If not json, 
                            // do nothing.
                        }
                        if (data.size && data.filename) {
                            sizeToFilenameMap.set(data.size, data.filename);
                        }
                    }
                };
                // Send jobId.
                const payload = {
                    action: 'waiting',
                    jobId: jobId,
                };
                const jsonPayload = JSON.stringify(payload);
                webSocketConnection.send(jsonPayload);
            }
            else {
                debugger;
                // error / other
            }
        }));
    }
    else {
        throw 'No files selected';
    }
};
exports.optimize = optimize;
const download = function (file, filename) {
    const blob = new Blob([new Uint8Array(file)]);
    const url = window.URL.createObjectURL(blob);
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
};
exports.download = download;
