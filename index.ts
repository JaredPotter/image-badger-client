import axios from 'axios';
import * as uuid from 'uuid/v4';

import { isArrayBuffer, isFile, base64DecToArr, base64StringToArrayBuffer } from './utility';

export type FileCompleted = (file: ArrayBuffer, filename: string) => void;

let baseApiUrl = 'http://';
// let baseApiUrl = 'https://';
let baseWsUrl = 'ws://';
let webSocketConnection: WebSocket;
// let baseWsUrl = 'wss://';

let sizeToFilenameMap: Map<number, string> = new Map<number, string>();

const app = function(serverUrl: string, httpPort: number = 3000, wsPort: number = 8080) {
    baseApiUrl = `${baseApiUrl}${serverUrl}:${httpPort}`;
    baseWsUrl = `${baseWsUrl}${serverUrl}:${wsPort}`;

    // Establish WebSocket Connection.
    webSocketConnection = new WebSocket(baseWsUrl);
    webSocketConnection.binaryType = 'arraybuffer';
};
  
const optimize = function(files: File[] | ArrayBuffer[], fileCompleted: FileCompleted): Promise<ArrayBuffer[]> {
    if(!webSocketConnection || webSocketConnection.readyState !== WebSocket.OPEN) {
        throw 'app not initilized. Call '
    }

    if(files.length > 0) {
        return new Promise(async (resolve, reject) => {
            const formData = new FormData();
    
            for(const file of files) {
                let newFile: File;
                const placeholder = uuid();
                
                if(isArrayBuffer(file)) {
                    // debugger;
                    newFile = <File>(new Blob([new Uint8Array(<ArrayBuffer>file)]));
                    formData.append(placeholder, newFile);
                }
                else if(isFile(file) ){
                    newFile = <File>file;
                    formData.append(placeholder, newFile);
                }
            }    
    
            const response = await axios.post(
                `${baseApiUrl}/optimize`, 
                formData, 
                { responseType: 'text'}
            );
    
            // debugger;s
            if(response && response.status === 200 && response.data) {
                const jobId: string = response.data;
    
                webSocketConnection.onopen = () => {
                    // debugger;
                    console.log('WebSocket Connected');
                }
              
                webSocketConnection.onerror = error => {
                    console.log(`WebSocket error: ${error}`);
                    resolve();
                }
    
                webSocketConnection.onmessage = (event: MessageEvent) => {
                    if(isArrayBuffer(event.data)) {
                        const data = event.data;
                        const size = (<ArrayBuffer>data).byteLength;
                        const filename = <string>sizeToFilenameMap.get(size);
                        fileCompleted(data, filename);
                        sizeToFilenameMap.delete(size);
                    }
                    else if(event.data === 'close') {                        
                        webSocketConnection.close();
                        resolve();
                    }
                    else {
                        let data;

                        try {
                            data = JSON.parse(event.data);                            
                        } catch (error) {
                            // If not json, 
                            // do nothing.
                        }

                        if(data.size && data.filename) {
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
        });
    }
    else {
        throw 'No files selected';
    }
}

const download = function(file: ArrayBuffer, filename: string) {
    const blob = new Blob([new Uint8Array(file)]);
    const url = window.URL.createObjectURL(blob);
    let a: HTMLAnchorElement = document.createElement("a");

    document.body.appendChild(a);

    a.href = url;
    a.download = filename;

    a.click();
    window.URL.revokeObjectURL(url);
};
  
export { app, optimize, download }
  