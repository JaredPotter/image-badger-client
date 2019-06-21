const hasArrayBuffer = typeof ArrayBuffer === 'function';
const isArrayBuffer = function (value: any) {
    return hasArrayBuffer && (value instanceof ArrayBuffer || toString.call(value) === '[object ArrayBuffer]');
}

const hasFile = typeof File === 'function';
const isFile = function (value: any) {
    return hasFile && (value instanceof File || toString.call(value) === '[object File]');
}

function base64DecToArr (sBase64: string, nBlockSize?: number) {

    var
      sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
      nOutLen = nBlockSize ? Math.ceil((nInLen * 3 + 1 >>> 2) / nBlockSize) * nBlockSize : nInLen * 3 + 1 >>> 2, aBytes = new Uint8Array(nOutLen);
  
    for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
      nMod4 = nInIdx & 3;
      nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
      if (nMod4 === 3 || nInLen - nInIdx === 1) {
        for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
          aBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
        }
        nUint24 = 0;
      }
    }
  
    return aBytes;
  }

function b64ToUint6 (nChr: number) {

    return nChr > 64 && nChr < 91 ?
            nChr - 65
        : nChr > 96 && nChr < 123 ?
            nChr - 71
        : nChr > 47 && nChr < 58 ?
            nChr + 4
        : nChr === 43 ?
            62
        : nChr === 47 ?
            63
        :
            0;
}  

// const arrayBufferToString = function(arrayBuffer: ArrayBuffer): string {
//     const string = String.fromCharCode.apply(null, new Uint16Array(arrayBuffer));

//     return string;
// }

const stringToArrayBuffer = function (string: string): ArrayBuffer {
    var buf = new ArrayBuffer(string.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=string.length; i < strLen; i++) {
      bufView[i] = string.charCodeAt(i);
    }
    return buf;
}

const base64StringToArrayBuffer = function(base64String: string): ArrayBuffer {
    let raw = window.atob(base64String);
    let rawLength = raw.length;
    let array = new Uint8Array(new ArrayBuffer(rawLength));
  
    for(let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }

    return array.buffer;
  }

export { isArrayBuffer, isFile, base64DecToArr, /*arrayBufferToString,*/ stringToArrayBuffer, base64StringToArrayBuffer }