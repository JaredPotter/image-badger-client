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
var ResponseType;
(function (ResponseType) {
    ResponseType[ResponseType["File"] = 0] = "File";
    ResponseType[ResponseType["ArrayBuffer"] = 1] = "ArrayBuffer";
})(ResponseType = exports.ResponseType || (exports.ResponseType = {}));
const BASE_API_URL = 'http://localhost:3000';
// const BASE_API_URL: string = 'http://imageoptimizerpro.com:3000';
const BASE_WEB_SOCKET_URL = 'ws://localhost:8080';
// const BASE_WEB_SOCKET_URL: string = 'wss://imageoptimizerpro.com:8080';
const optimize = function (file /*| ArrayBuffer*/, responseType) {
    return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
        const formData = new FormData();
        let newFile;
        // if(instanceof file === ) {
        //     newFile = <File>(new Blob([new Uint8Array(<ArrayBuffer>file)]));
        //     formData.append('file', newFile);
        // }
        // else if(responseType === ResponseType.File) {
        newFile = file;
        formData.append('file', newFile);
        // }
        const response = yield axios_1.default.post(`${BASE_API_URL}/optimize`, formData, { responseType: 'text' });
        // debugger;s
        if (response && response.status === 200 && response.data) {
            const jobId = response.data;
            // Establish WebSocket Connection.
            // const url = 'wss://' + BASE_WEB_SOCKET_URL; // Secure - Prod; todo: move this to environments file.
            const url = BASE_WEB_SOCKET_URL; // Unsecure - dev            
            const connection = new WebSocket(url);
            // connection.binaryType = 'arraybuffer'; // maybe not needed?
            connection.onopen = () => {
                // debugger;
                // console.log('WebSocket Connected');
            };
            connection.onerror = error => {
                console.log(`WebSocket error: ${error}`);
            };
            connection.onmessage = (event) => {
                debugger;
                const data = JSON.parse(event.data);
                const action = data.action;
                switch (action) {
                    case 'completed':
                        debugger;
                    default:
                    // do nothing.
                }
                // const arrayBuffer = data.arrayBuffer;
            };
            // Send jobId.
            const payload = {
                action: 'waiting',
                jobId: jobId,
            };
            const jsonPayload = JSON.stringify(payload);
            connection.send(jsonPayload);
        }
        else {
            debugger;
            // error / other
        }
        resolve();
    }));
};
exports.optimize = optimize;
function handleFile(file) {
}
function handleArrayBuffer(file) {
}
