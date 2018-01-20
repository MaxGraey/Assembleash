import Base64 from './Base64'

export const CompileMode = {
  Auto:   0,
  Manual: 1,
};

export const CompileModes = Object.keys(CompileMode);

export const CompilerDescriptions = {
  'AssemblyScript NEXT': {
    offline: true,
    loaded: false,
    github: 'https://github.com/AssemblyScript/assemblyscript',

    options: {
      longMode: {
        label:   'Use 64 bits',
        default: false
      },

      validate: {
        label:   'Validate',
        default: true
      },

      optimize: {
        label:   'Optimize',
        default: true
      }
    },

    example:
`export function fib(n: i32): i32 {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`
  },

  'Speedy.js': {
    offline: false,
    url:    'https://speedyjs-saas.herokuapp.com',
    github: 'https://github.com/MichaReiser/speedy.js',

    options: {
      unsafe: {
        label:   'Unsafe',
        default: true
      },

      optimize: {
        label:   'Optimize',
        default: true
      }
    },

    version: () => requestCommand(
      CompilerDescriptions['Speedy.js'].url + '/version'
    ),

    compile: (source, options) => {
      const requestBody = {
        files: [
          {
            source,
            fileName: 'module.ts'
          }
        ],
        tsconfig: options
      };

      return requestCommand(
        CompilerDescriptions['Speedy.js'].url + '/compile',
        requestBody
      );
    },

    example: `
function fibSync(n: int): int {
  "use speedyjs";
  if (n <= 1) return n;
  return fibSync(n - 1) + fibSync(n - 2);
}

async function fib(n: int): Promise<int> {
  "use speedyjs";
  return fibSync(n);
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
  const findFunc =
    Array.isArray(value)
    ? v => value.indexOf(v) >= 0
    : v => value === v;

  return array.some(findFunc);
}

export function getCompilerVersion(compiler, callback = () => {}) {
  switch (compiler) {
    /*case 'AssemblyScript':
      if (window.assemblyscript)
        callback(window.assemblyscript.version);
      break;*/

    case 'AssemblyScript NEXT':
      if (window.assemblyscript)
        callback(window.assemblyscript.version);
      break;

    case 'Speedy.js':
      CompilerDescriptions['Speedy.js'].version()
        .then(version => callback(version['speedyjs-compiler']))
        .catch(err => callback('0.0.0'));
      break;

    default:
      callback('0.0.1');
  }
}

export function formatCode(buffer, base64 = false) {
  if (!buffer)
    return '';

  // buffer already formatted
  if (typeof buffer === 'string')
    return buffer;

  if (base64) {
    let output = `const byteArray = decode('${Base64.encode(buffer)}');\n\n`;

    output += 'function decode(input) {\n';
    output += '    if (typeof window !== "undefined" && atob in window) {\n';
    output += '        return new Uint8Array(atob(input).split("").map(char => char.charCodeAt(0)));\n';
    output += '    } else if (typeof Buffer !== "undefined") {\n';
    output += '        return new Uint8Array(Buffer.from(input, "base64"));\n';
    output += '    }\n';
    output += '    return null;\n';
    output += '}';

    return output;
  }

  // format binary data as array
  const last = buffer.length;

  let output = 'new Uint8Array([\n    ';
  for (let i = 0, len = buffer.length; i < len; i++) {
    const value = buffer[i];
    let result = '0x' + ('00' + value.toString(16)).substr(-2);

    if (i !== last - 1)
      result += ', ';

    if (((i + 1) % 10) === 0)
      result += '\n    ';

    output += result;
  }
  output += '\n]);';
  return output;
}

export function formatSize(bytes) {
  if (!bytes) return '0 Bytes';
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  let i = Math.floor(Math.log(bytes) * (1 / Math.log(1024)));
  return Math.round(bytes * Math.pow(1024, -i) * 100) / 100 + ' ' + units[i];
}

function checkResponseStatus(response) {
  if (response.status >= 200 && response.status < 300)
    return Promise.resolve(response);
  else
    return Promise.reject(new Error(response.statusText));
}

export function requestCommand(url, config = null) {
  const headers = config ? {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  } : void 0;

  return fetch(url, {
    headers,
    method: config ? 'POST' : 'GET',
    body:   config ? JSON.stringify(config) : void 0,
  }).then(checkResponseStatus).then(response => response.json());
}
