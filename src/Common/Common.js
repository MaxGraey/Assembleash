
export const CompileModes = ['Auto', 'Manual', 'Decompile'];

export const CompilerDescriptions = {
    'TurboScript': {
        offline: true,
        scripts:  [
            'https://rawgit.com/01alchemist/TurboScript/master/lib/turboscript.js'
        ],
        loaded: false,
        github:  'https://github.com/01alchemist/TurboScript',
        options: {},
        example:
`export function fib(num: int32): int32 {
    if (num <= 1) return 1;
    return fib(num - 1) + fib(num - 2);
}`
    },

    'AssemblyScript': {
        offline: true,
        scripts: [
            'https://rawgit.com/dcodeIO/binaryen.js/master/index.js',
            'https://rawgit.com/dcodeIO/AssemblyScript/master/dist/assemblyscript.min.js'
        ],
        loaded: false,
        github: 'https://github.com/dcodeIO/AssemblyScript',
        options: {
            // detect automatically
            /*stdlib: {
                label:   'Library',
                default: false
            },*/
            longMode: {
                label:   'Use 64 bits',
                default: false
            },
            validate: {
                label:   'Validate',
                default: false
            },
            optimize: {
                label:   'Optimize',
                default: true
            }
        },
        example:
`export function fib(num: int32): int32 {
    if (num <= 1) return 1;
    return fib(num - 1) + fib(num - 2);
}`
    },

    'Speedy.js': {
        offline: false,
        url:     'https://speedyjs-saas.herokuapp.com',
        github:  'https://github.com/MichaReiser/speedy.js',
        options: {
            unsafe: {
                label:   'Unsafe',
                default: true
            },
            binaryenOpt: {
                label:   'Optimize',
                default: true
            }
        },
        version: () => requestCommand(
            CompilerDescriptions['Speedy.js'].url + '/version'
        ),
        compile: (source, options) => {
            const requestBody = {
                files: [{
                    source,
                    fileName: 'module.ts'
                }],
                tsconfig: options
            };

            return requestCommand(
                CompilerDescriptions['Speedy.js'].url + '/compile',
                requestBody
            );
        },
        example:
`
async function fib(value: int): Promise<int> {
    "use speedyjs";

    return fibSync(value);
}

function fibSync(value: int): int {
    "use speedyjs";

    if (value <= 2) {
        return 1;
    }

    return fibSync(value - 2) + fibSync(value - 1);
}

async function main() {
    console.log(await fib(40));
}
`
    }
};

export const CompilerList = Object.keys(CompilerDescriptions);

const LibStdKeywords = [
    'new',
    'malloc',
    'free',
    'memcpy',
    'memset',
    'memcmp'
];

const LibStdKeywordsRegex = new RegExp(LibStdKeywords.join("|"), "gm");

export function isRequreStdlib(code) {
    LibStdKeywordsRegex.lastIndex = 0;
    return LibStdKeywordsRegex.test(code);
}


export function anyExists(array, value) {
    if (Array.isArray(value)) {
        for (let j = 0, lj = array.length; j < lj; j++) {
            let current = array[j];
            for (let i = 0, li = value.length; i < li; i++) {
                if (current === value[i]) {
                    return true;
                }
            }
        }
    } else {
        for (let i = 0, len = array.length; i < len; i++) {
            if (array[i] === value) {
                return true;
            }
        }
    }
    return false;
}


export function getCompilerVersion(compiler, callback = () => {}) {
    switch (compiler) {
        case 'TurboScript':
            if (window.turboscript)
                callback(window.turboscript.default.version);
            return;

        case 'AssemblyScript':
            if (window.assemblyscript)
                callback(window.assemblyscript.version);
            return;

        case 'Speedy.js':
            CompilerDescriptions['Speedy.js'].version()
                .then(version => callback(version['speedyjs-compiler']))
                .catch(err => callback('0.0.0'))
            return;

        default: callback('0.0.1');
    }
}


export function formatCode(buffer) {
    if (!buffer)
        return '';

    // buffer already formatted
    if (typeof buffer === 'string')
        return buffer;

    // format binary data
    const last = buffer.length;

    let output = 'new Uint8Array([\r\n    ';
    output += Array.prototype.map.call(buffer, (value, index) => {
        let result = '0x' + ('00' + value.toString(16)).slice(-2);

        index++;
        if (index !== last)
            result += ', ';

        if ((index % 10) === 0)
            result += '\r\n    ';

        return result;
    }).join('');
    output += '\r\n]);';

    return output;
}


export function formatSize(bytes) {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    let i = Math.floor(Math.log(bytes) * (1 / Math.log(1024)));
    return Math.round(bytes * Math.pow(1024, -i) * 100) / 100 + ' ' + units[i];
}


function checkResponseStatus(response) {
	if (response.status >= 200 && response.status < 300) {
		return Promise.resolve(response);
	} else {
		return Promise.reject(new Error(response.statusText))
	}
}

export function requestCommand(url, config = null) {
    const headers = config ? {
        'Accept':       'application/json',
        'Content-Type': 'application/json'
    } : void 0;

    return fetch(url, {
        headers,
        method: config ? 'POST' : 'GET',
        body:   config ? JSON.stringify(config) : void 0
    })
    .then(checkResponseStatus)
    .then(response => response.json());
}
