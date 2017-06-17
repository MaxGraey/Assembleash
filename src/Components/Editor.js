import React, { Component } from 'react'
import PropTypes from 'prop-types'
import MonacoEditor from 'react-monaco-editor';

export default class Editor extends Component {
    static propTypes = {
        focus:       PropTypes.bool,
        readOnly:    PropTypes.bool,
        mode:        PropTypes.string,
        width:       PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        height:      PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        code:        PropTypes.string,
        annotations: PropTypes.array,
        onChange:    PropTypes.func
    }

    static defaultProps = {
        focus:       false,
        readOnly:    false,
        mode:        'typescript',
        width:       '100%',
        height:      '750px',
        code:        '',
        annotations: [],
        onChange:    () => {}
    }

    static requireConfig = {
        url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.3/require.min.js',
        paths: {
            vs: 'https://unpkg.com/monaco-editor@0.8.3/min/vs'
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            value: props.code
        };

        this.decorations = [];
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.mode !== this.props.mode) {
            if (this.editor) {
                const editor = this.editor;
                if (nextProps.mode === 'wast') {
                    //session.setMode(new WastMode());
                }
            }
        }

        if (this.editor) {
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
                            range: new this.monaco.Range(annotation.row, 1, annotation.row),
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

    onLoad = (editor, monaco) => {
        /*this.editor = editor;
        const session = editor.getSession();

        if (this.props.mode === 'wast') {
            session.setMode(new WastMode());
        }

        session.setUseSoftTabs(true);
        session.setOptions({ useWorker: true });
        editor.renderer.setScrollMargin(14, 14);*/

        this.editor = editor;
        this.monaco = monaco;

        if (this.props.mode === 'typescript') {
            const typescript = monaco.languages.typescript;
            typescript.typescriptDefaults.setCompilerOptions({
                target: typescript.ScriptTarget.Latest,
                module: typescript.ModuleKind.None,
                noLib:  true,
                allowNonTsExtensions: true
            });

            if (window.assemblyscript) {
                const files = window.assemblyscript.library.files;
                const names = Object.keys(files);

                const typescript = monaco.languages.typescript;
                for (let index = 0, len = names.length; index < len; index++) {
                    typescript.typescriptDefaults.addExtraLib(files[names[index]], names[index]);
                }
            }
        }

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

    onChange = (newValue, e) => {
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
                language={ 'typescript' }
                width={ width }
                height={ height }
                options={{
                    readOnly,
                    theme: 'vs-dark',
                    renderLineHighlight:  'gutter',
                    selectOnLineNumbers:  true,
                    scrollBeyondLastLine: false,
                    lineDecorationsWidth: 20,

                    cursorBlinking: 'smooth',
                    scrollbar: {
                        //vertical: 'hidden',
                        //horizontal: 'hidden',
                        verticalHasArrows: false,
                        horizontalHasArrows: false,
                        verticalScrollbarSize:   10,
		                horizontalScrollbarSize: 10
                    },
                    // glyphMargin: true,
                    fontSize: fontSize,
                    lineHeight: fontSize + 5,
                    quickSuggestionsDelay: 300,
                    hideCursorInOverviewRuler: true,
                    suggestFontSize:   fontSize,
                    suggestLineHeight: fontSize + 12
                }}
                onChange={ this.onChange }
                editorDidMount={ this.onLoad }
                requireConfig={ this.constructor.requireConfig }
            />
        );
    }
}
