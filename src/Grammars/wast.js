
// Based on https://github.com/dcodeIO/AssemblyScript/blob/gh-pages/assets/sexpr.js

export default function registerWastSyntax(monaco) {
    monaco.languages.register({ id: 'wast' });

    monaco.languages.setLanguageConfiguration('wast', {
        comments: {
		    lineComment: ';;',
		    blockComment: ['\\(;', ';\\)'],
        },
        brackets: [
            ['(', ')']
        ],
        autoClosingPairs: [
            { open: '(', close: ')' },
            { open: '"', close: '"' }
        ],
        surroundingPairs: [
            { open: '(', close: ')' },
            { open: '"', close: '"' }
        ]
    });

    monaco.languages.setMonarchTokensProvider('wast', {

        tokenPostfix: '.wast',

        keywords: [
            "module",
            "type",
            "memory",
            "data",
            "export",
            "import",
            "func",
            "struct",
            "start",
            "table",
            "elem",
            "element",
            "global",
            "mut",
            "local",
            "param",
            "result",
            "offset",
            "code",
            "segment",
            "invoke",
            "label",

            // Control
            "unreachable",
            "nop",
            "block",
            "loop",
            "if",
            "else",
            "end",
            "br",
            "br_if",
            "br_table",
            "return",

            // Call
            "call",
            "call_indirect",
            "call_import"
        ],

        types: [
            "i32",
            "i64",
            "f32",
            "f64",
            "anyfunc",
            "func",
            "void"
        ],

        operations: [
            // Parametric
            "drop",
            "select",

            // Variable access
            "get_local",
            "set_local",
            "tee_local",
            "get_global",
            "set_global",

            // Memory related
            "load",
            "load8_s",
            "load8_u",
            "load16_s",
            "load16_u",
            "load32_s",
            "load32_u",
            "store",
            "store8",
            "store16",
            "store32",
            "current_memory",
            "grow_memory",

            // Constants
            "const",

            // Comparison
            "eqz",
            "eq",
            "ne",
            "lt_s",
            "lt_u",
            "lt",
            "gt_s",
            "gt_u",
            "gt",
            "le_s",
            "le_u",
            "le",
            "ge_s",
            "ge_u",
            "ge",

            // Numeric
            "clz",
            "ctz",
            "popcnt",
            "add",
            "sub",
            "mul",
            "div_s",
            "div_u",
            "div",
            "rem_s",
            "rem_u",
            "and",
            "xor",
            "or",
            "shl",
            "shr_s",
            "shr_u",
            "rotl",
            "rotr",
            "abs",
            "neg",
            "ceil",
            "floor",
            "trunc",
            "nearest",
            "sqrt",
            "min",
            "max",
            "copysign",

            // Conversion
            "wrap",
            "trunc_s",
            "trunc_u",
            "extend_s",
            "extend_u",
            "convert_s",
            "convert_u",
            "demote",
            "promote",

            // Reinterpretations
            "reinterpret",

            // Misc
            "tableswitch",
            "has_feature",

            // Assertion
            "failure",
            "assert_invalid",
            "assert_trap",
            "assert_return_nan",
            "assert_return"
        ],

        escapes:      /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
        digits:       /\d+(_+\d+)*/,
        octaldigits:  /[0-7]+(_+[0-7]+)*/,
        binarydigits: /[0-1]+(_+[0-1]+)*/,
        hexdigits:    /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,

    	tokenizer: {
    		root: [
                { include: '@whitespace' },

                [/"([^"\\]|\\.)*$/, 'string.invalid'],
                [/"/, 'string', '@string'],

                [/(@digits)[eE]([+\-]?(@digits))?[fFdD]?/, 'number.float'],
                [/(@digits)\.(@digits)([eE][+\-]?(@digits))?[fFdD]?/, 'number.float'],
                [/0[xX](@hexdigits)[Ll]?/, 'number.hex'],
                [/0(@octaldigits)[Ll]?/, 'number.octal'],
                [/0[bB](@binarydigits)[Ll]?/, 'number.binary'],
                [/(@digits)[fFdD]/, 'number.float'],
                [/(@digits)[lL]?/, 'number'],
                [/[+\-]?(infinity|inf|nan)/, 'constant.number'],

                [/\./, 'punctuation.separator.dot'],

                [/\$[^\s"\(\)\{\}\[\]]+/, { token: 'variable' }],

                [/[a-zA-Z_$][\w$]*/, {
                    cases: {
                        '@keywords':   { token: 'keyword.$0' },
                        '@types':      { token: 'entity.name.type.class.$0' },
                        '@operations': { token: 'keyword.operator.$0' },
                        '@default':    'identifier'
                    }
                }]
            ],

            string: [
                [/[^\\"]+/,  'string'],
                [/@escapes/, 'string.escape'],
                [/\\./,      'string.escape.invalid'],
                [/"/,        'string', '@pop']
            ],

            whitespace: [
                [/[ \t\r\n]+/,           ''],
                [/(^;{2}.*$)/,           'comment.line'],
                [/(^\(;[\n\t\r\w]+;\))/, 'comment.block']
            ],

            comment: [
                [/(;{2})(.*)$/, 'comment.line']
            ]
        }
    });
}
