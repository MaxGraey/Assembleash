
export default function registerTheme(monaco) {
  let rules = {
    'comment':                           '65737e',
    'identifier':                        'c0c5ce',
    'delimiter':                         'c0c5ce',

    'variable.parameter.function':       'c0c5ce',
    'punctuation.definition.variable':   'c0c5ce',
    'punctuation.definition.parameters': 'c0c5ce',
    'punctuation.definition.string':     'c0c5ce',
    'punctuation.definition.array':      'c0c5ce',
    'punctuation.separator.dot':         'f2777a',

    'keyword':                           'cc99cc',
    'keyword.operator':                  'f69057',
    'keyword.call':                      '48c7e0',
    'keyword.call_indirect':             '48c7e0',
    'keyword.call_import':               '48c7e0',

    'variable':                          '6699cc',
    'variable.other.dollar':             'bf616a',

    'entity.name.function':              '8fa1b3',
    'meta.require':                      '8fa1b3',
    'support.function.any-method':       '8fa1b3',
    'variable.function':                 '8fa1b3',

    'support.class':                     'ebcb8b',
    'entity.name.class':                 'ebcb8b',
    'entity.name.type.class':            'ebcb8b',

    'meta.class':                        'eff1f5',
    'keyword.other.special-method':      '8fa1b3',

    'storage':                           'cc99cc',
    'support.function':                  '96b5b4',

    'string':                            '81c56c',
    'constant.other.symbol':             '81c56c',
    'entity.other.inherited-class':      '81c56c',

    'number':                            'f2777a',

    'entity.name.tag':                   'bf616a',
    'entity.other.attribute-name':       'f2777a',
    'meta.selector':                     'c0c5ce',

    'keyword.other.unit':                'f2777a',
    'string.other.link':                 'bf616a',

    'meta.link':                         'f2777a',

    'string.regexp':                     '96b5b4',
    'constant.character.escape':         '96b5b4',

    'punctuation.section.embedded':      'ab7967',
    'variable.interpolation':            'ab7967',

    'invalid.illegal':                   ['2b303b', 'bf616a'],
  };

  rules = Object.entries(rules).map(([token, props]) => {
    const hasArray = Array.isArray(props);
    return {
      token,
      foreground: hasArray ? props[0] : props,
      background: hasArray ? props[1] : void 0,
    }
  });

  monaco.editor.defineTheme('vs-assembleash', { base: 'vs-dark', inherit: true, rules });
}
