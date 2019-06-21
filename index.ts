import axios, { AxiosResponse } from 'axios';

export enum ResponseType {
    File = 0,
    ArrayBuffer = 1,
}

const BASE_API_URL: string = 'http://localhost:3000';
// const BASE_API_URL: string = 'http://imageoptimizerpro.com:3000';

const BASE_WEB_SOCKET_URL: string = 'ws://localhost:8080';
// const BASE_WEB_SOCKET_URL: string = 'wss://imageoptimizerpro.com:8080';
  
const optimize = function(file: File /*| ArrayBuffer*/, responseType: ResponseType): Promise<ArrayBuffer> {
    return new Promise(async (resolve) => {
        const formData = new FormData();
        let newFile: File;

        // if(instanceof file === ) {
        //     newFile = <File>(new Blob([new Uint8Array(<ArrayBuffer>file)]));
        //     formData.append('file', newFile);
        // }
        // else if(responseType === ResponseType.File) {
            newFile = <File>file;
            formData.append('file', newFile);
        // }

        const response = await axios.post(
            `${BASE_API_URL}/optimize`, 
            formData, 
            { responseType: 'text'}
        );

        // debugger;s
        if(response && response.status === 200 && response.data) {
            const jobId: string = response.data;

            // Establish WebSocket Connection.
            // const url = 'wss://' + BASE_WEB_SOCKET_URL; // Secure - Prod; todo: move this to environments file.
            const url = BASE_WEB_SOCKET_URL; // Unsecure - dev            
            const connection = new WebSocket(url);
            // connection.binaryType = 'arraybuffer'; // maybe not needed?

            connection.onopen = () => {
                // debugger;
                // console.log('WebSocket Connected');
            }
          
            connection.onerror = error => {
                console.log(`WebSocket error: ${error}`)
            }

            connection.onmessage = (event: MessageEvent) => {
                debugger;
                const data = JSON.parse(event.data);
                const action = data.action;
        
                switch(action) {
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
    });
}

function handleFile(file: File) {

}

function handleArrayBuffer(file: ArrayBuffer) {

}


  
export {
    optimize
}
  