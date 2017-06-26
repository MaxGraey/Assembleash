
const encodeBatchSize = 0x8000;

export default class Base64 {
    static encode(array) {
        let result = '';

        if (!array || array[0] === void 0)
            return result;

        if (Array.isArray(array) && !array.subarray)
            array = new Uint8Array(array);

        for (var i = 0, len = array.length; i < len; i += encodeBatchSize)
            result += btoa(String.fromCharCode.apply(null, array.subarray(i, i + encodeBatchSize)));

        return result;
    }

    static decode(input) {
        if (typeof input !== 'string') return new Uint8Array();
        return new Uint8Array(atob(input).split('').map(char => {
            return char.charCodeAt(0);
        }));
    }
}
