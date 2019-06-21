declare const isArrayBuffer: (value: any) => boolean;
declare const isFile: (value: any) => boolean;
declare function base64DecToArr(sBase64: string, nBlockSize?: number): Uint8Array;
declare const stringToArrayBuffer: (string: string) => ArrayBuffer;
declare const base64StringToArrayBuffer: (base64String: string) => ArrayBuffer;
export { isArrayBuffer, isFile, base64DecToArr, /*arrayBufferToString,*/ stringToArrayBuffer, base64StringToArrayBuffer };
