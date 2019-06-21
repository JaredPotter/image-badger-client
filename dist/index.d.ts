export declare enum ResponseType {
    File = 0,
    ArrayBuffer = 1
}
declare const optimize: (file: File, responseType: ResponseType) => Promise<ArrayBuffer>;
export { optimize };
