
export const CompileModes = ['Auto', 'Manual', 'Decompile'];

export const CompilerDescriptions = {
    'TurboScript': {
        offline: true,
        url:     'compilers/Turboscript/turboscript.js',
        github:  'https://github.com/01alchemist/TurboScript',
        options: {

        }
    },

    'AssemblyScript': {
        offline: true,
        url:    'compilers/AssemblyScript/assemblyscript.min.js',
        github: 'https://github.com/dcodeIO/AssemblyScript',
        options: {
            stdlib: {
                label: 'Library',
                default: false
            },
            longMode: {
                label: 'Use 64 bits',
                default: false
            },
            validate: {
                label: 'Validate',
                default: false
            },
            optimize: {
                label: 'Optimize',
                default: true
            }
        }
    },

    'Speedy.js': {
        offline: false,
        url:    'https://speedyjs-saas.herokuapp.com/compile',
        github: 'https://github.com/MichaReiser/speedy.js',
        options: {
            unsafe: {
                label: 'Unsafe',
                default: true
            },
            saveWast: {
                default: true
            },
            binaryenOpt: {
                label: 'Optimize',
                default: true
            },
            optimizationLevel: {
                default: "s"
            }
        }
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

const LibStdKeywordsRegex = new RegExp(LibStdKeywords.join("|"), "g");

export function isRequreStdlib(code) {
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

export function getCompilerVersion(compiler) {
    switch (compiler) {
        case 'TurboScript':
            return window.turboscript.version;

        case 'AssemblyScript':
            if (window.assemblyscript)
                return window.assemblyscript.version;
            break;

        default: break;
    }

    return '0.0.1';
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
