
export default function registerTheme(monaco) {
    monaco.editor.defineTheme('vs-assembleash', {
    	base:    'vs-dark',
    	inherit: true,

    	rules: [
    		{ token: 'comment', foreground: '65737e' },
            // { token: 'number', foreground: 'ff0000' },

            { token: 'identifier', foreground: 'c0c5ce' },

            { token: 'delimiter', foreground: 'c0c5ce' },

            { token: 'variable.parameter.function', foreground: 'c0c5ce'},
            { token: 'punctuation.definition.string', foreground: 'c0c5ce'},
            { token: 'punctuation.definition.variable', foreground: 'c0c5ce'},
            { token: 'punctuation.definition.string', foreground: 'c0c5ce'},
            { token: 'punctuation.definition.parameters', foreground: 'c0c5ce'},
            { token: 'punctuation.definition.string', foreground: 'c0c5ce'},
            { token: 'punctuation.definition.array', foreground: 'c0c5ce'},
            { token: 'punctuation.separator.dot', foreground: 'f2777a' },

            { token: 'keyword', foreground: 'cc99cc' },
            { token: 'keyword.operator', foreground: 'f69057' },
            { token: 'keyword.call', foreground: '48c7e0' },
            { token: 'keyword.call_indirect', foreground: '48c7e0' },
            { token: 'keyword.call_import', foreground: '48c7e0' },

            { token: 'variable', foreground: '6699cc' },
            { token: 'variable.other.dollar', foreground: 'bf616a' },

            { token: 'entity.name.function', foreground: '8fa1b3' },
            { token: 'meta.require', foreground: '8fa1b3' },
            { token: 'support.function.any-method', foreground: '8fa1b3' },
            { token: 'variable.function', foreground: '8fa1b3' },

            { token: 'support.class', foreground: 'ebcb8b' },
            { token: 'entity.name.class', foreground: 'ebcb8b' },
            { token: 'entity.name.type.class', foreground: 'ebcb8b' },

            { token: 'meta.class', foreground: 'eff1f5' },
            { token: 'keyword.other.special-method', foreground: '8fa1b3' },

            { token: 'storage', foreground: 'cc99cc' },
            { token: 'support.function', foreground: '96b5b4' },

            { token: 'string', foreground: '81c56c' },
            { token: 'constant.other.symbol', foreground: '81c56c' },
            { token: 'entity.other.inherited-class', foreground: '81c56c' },

            { token: 'number', foreground: 'f2777a' },

            { token: 'entity.name.tag', foreground: 'bf616a' },
            { token: 'entity.other.attribute-name', foreground: 'f2777a' },
            { tonen: 'meta.selector', foreground: 'c0c5ce' },

            { token: 'keyword.other.unit', foreground: 'f2777a' },
            { token: 'string.other.link', foreground: 'bf616a' },

            { token: 'meta.link', foreground: 'f2777a' },

            { token: 'string.regexp', foreground: '96b5b4' },
            { token: 'constant.character.escape', foreground: '96b5b4' },

            { token: 'punctuation.section.embedded', foreground: 'ab7967' },
            { token: 'variable.interpolation', foreground: 'ab7967' },

            { token: 'invalid.illegal', background: 'bf616a', foreground: '2b303b' }
    	]
    });
}
