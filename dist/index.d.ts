export declare type FileCompleted = (file: ArrayBuffer, filename: string) => void;
declare let webSocketConnection: WebSocket;
declare const app: (serverUrl: string, httpPort?: number, wsPort?: number) => void;
declare const optimize: (files: File[] | ArrayBuffer[], fileCompleted: FileCompleted) => Promise<ArrayBuffer[]>;
declare const download: (file: ArrayBuffer, filename: string) => void;
export { app, optimize, download, webSocketConnection };
