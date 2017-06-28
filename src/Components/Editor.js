import React, { Component } from 'react'
import PropTypes from 'prop-types'
import MonacoEditor from 'react-monaco-editor'
import registerWastSyntax from '../Grammars/wast'
import registerTheme from '../Grammars/theme.js'

export default class Editor extends Component {
    static wastRegistered = false

    static propTypes = {
        focus:       PropTypes.bool,
        readOnly:    PropTypes.bool,
        mode:        PropTypes.string,
        width:       PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        height:      PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        code:        PropTypes.string,
        annotations: PropTypes.array,
        onChange:    PropTypes.func,

        onPositionChange: PropTypes.func
    }

    static defaultProps = {
        focus:       false,
        readOnly:    false,
        mode:        'typescript',
        width:       '100%',
        height:      '750px',
        code:        '',
        annotations: [],
        onChange:    () => {},

        onPositionChange: () => {}
    }

    constructor(props) {
        super(props);
        this.state = {
            value: props.code
        };

        this.decorations = [];
    }

    componentWillReceiveProps(nextProps) {
        if (this.editor) {
            if (nextProps.mode !== this.props.mode) {
                console.log('mode:', nextProps.mode);
                this.editor.getModel().updateOptions({
                    tabSize: nextProps.mode === 'wast' ? 1 : 4
                });

            }

            if (nextProps.code !== this.props.code) {
                this.editor.setValue(nextProps.code);
            }

            if (nextProps.width  !== this.props.width ||
                nextProps.height !== this.props.height) {
                const width  = nextProps.width  || this.props.width;
                const height = nextProps.height || this.props.height;
                this.editor.layout({ width, height });
            }

            if (nextProps.annotations !== this.props.annotations) {
                let decorations = [];
                if (nextProps.annotations.length > 0) {
                    const annotations = nextProps.annotations;

                    for (let annotation of annotations) {
                        decorations.push({
                            range: new Editor.monaco.Range(annotation.row, 1, annotation.row),
                            options: {
                                isWholeLine: false,
                                linesDecorationsClassName: 'errorDecoration',
                                glyphMarginHoverMessage:   annotation.text
                            }
                        });
                    }
                }

                this.decorations = this.editor.deltaDecorations(this.decorations, decorations);
            }
        }
    }

    static addExtraLibs() {
        if (this.monaco && !this.extraLibsRegistered) {
            this.extraLibsRegistered = true;

            if (window.assemblyscript) {
                const files = window.assemblyscript.library.files;
                const names = Object.keys(files);

                const typescript = this.monaco.languages.typescript;
                for (let index = 0, len = names.length; index < len; index++)
                    typescript.typescriptDefaults.addExtraLib(files[names[index]], names[index]);
            }
        }
    }

    replaceTextInRange(range, text) {
        const replaceOperation = {
            text,
            range,
            identifier: { major: 1, minor: 1 },
            forceMoveMarkers: true
        };
        this.editor.executeEdits("replace", [replaceOperation]);
    }

    onLoad = (editor, monaco) => {
        this.editor = editor;
        Editor.monaco = monaco;

        Editor.addExtraLibs();

        if (!Editor.wastRegistered) {
            Editor.wastRegistered = true;

            const typescript = window.monaco.languages.typescript;
            typescript.typescriptDefaults.setCompilerOptions({
                target: typescript.ScriptTarget.Latest,
                module: typescript.ModuleKind.None,
                noLib:  true,
                allowNonTsExtensions: true
            });

            registerWastSyntax(window.monaco);
            registerTheme(window.monaco);
        }

        this.editor.getModel().updateOptions({
            tabSize: this.props.mode === 'wast' ? 1 : 4
        });

        this.editor.updateOptions({
            theme: 'vs-assembleash'
        });

        this.editor.onDidChangeCursorPosition(e => {
            this.props.onPositionChange([e.position.lineNumber, e.position.column]);
        })

        if (this.props.focus) {
            editor.focus();
        }

        // TEST
        /*editor.deltaDecorations([], [{
            range: new monaco.Range(2,1, 2),
            options: {
                isWholeLine: false,
                linesDecorationsClassName: 'errorDecoration',
                glyphMarginHoverMessage:   'error TS10234: Bla bla'
            }
        }]);*/
    }

    onChange = newValue => {
        this.setState({ value: newValue });
        this.props.onChange(newValue);
    }

    render() {
        const { value } = this.state;
        const {
            width,
            height,
            mode,
            readOnly,
            code
        } = this.props;

        const text = !readOnly ? value : code;
        const fontSize = 14;

        return (
            <MonacoEditor
                id='editor'
                value={ text }
                language={ mode }
                width={ width }
                height={ height }
                options={{
                    readOnly,
                    renderLineHighlight:  'gutter',
                    selectOnLineNumbers:  true,
                    scrollBeyondLastLine: false,

                    cursorBlinking: 'smooth',
                    scrollbar: {
                        //vertical: 'visible',
                        //horizontal: 'visible',
                        verticalHasArrows: false,
                        horizontalHasArrows: false,
                        verticalScrollbarSize:   10,
		                horizontalScrollbarSize: 10,
                        verticalSliderSize: 8,
                        horizontalSliderSize: 8
                    },
                    //glyphMargin: true,
                    fontSize: fontSize,
                    lineHeight: fontSize + 5,
                    quickSuggestionsDelay: 300,
                    hideCursorInOverviewRuler: true,
                    suggestFontSize:   fontSize,
                    suggestLineHeight: fontSize + 16,
                    roundedSelection: false,
                    fixedOverflowWidgets: true,

                    folding: true,
                    renderIndentGuides: true
                }}
                onChange={ this.onChange }
                editorDidMount={ this.onLoad }
            />
        );
    }
}
