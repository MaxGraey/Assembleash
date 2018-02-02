
import React, { Component }  from 'react';
import ReactDOM              from 'react-dom';
import PropTypes             from 'prop-types';

import FileSaver             from 'file-saver';
import { NotificationStack } from 'react-notification';
import { OrderedSet }        from 'immutable';
import SplitPane             from 'react-split-pane';
import { throttle }          from 'throttle-debounce';

import Editor                from '../Components/Editor';
import ToolbarContainer      from './ToolbarContainer';
import FooterContainer       from './FooterContainer';

import {
    CompileMode,
    CompilerDescriptions,
    formatCode,
    formatSize,
    getCompilerVersion,
    isRequreStdlib,
} from '../Common/Common';

const AutoCompilationDelay = 800; //ms
const MaxPrintingErrors = 8;
const SplitGripWidth = 5;

export default class EditorContainer extends Component {
    static defaultProps = {
        compiler: 'AssemblyScript'
    }

    static propTypes = {
        compiler: PropTypes.string
    }

    constructor(props) {
         super(props);
         this.state = {
             version:           '0.0.0',
             compiler:          props.compiler,
             compileMode:       CompileMode.Auto,
             compilerReady:     false,
             // compileFailure:    false,
             compileState:      'pending',
             // compileSuccess:    false,
             splitPosition:     0.62,
             additionalStatusMessage: '',
             inputEditorWidth:  '100%',
             outputEditorWidth: '100%',
             editorsHeight:     '750px',
             input:             CompilerDescriptions[props.compiler].example.trim(),
             output: {
                 text:   '',
                 binary: null
             },
             outputType:        'text',

             // settings
             validate:          true,
             optimize:          true,
             longMode:          false,
             unsafe:            true,
             base64:            false,

             annotations:       OrderedSet(),
             notifications:     OrderedSet(),
             notificationCount: 0,

             inputCursorPosition: [1, 1]
         };

         this._errorCount       = 0;
         this._lastTextInput     = '';
         this._compileTimerDelay = null;
         this._cachedClientRect  = null;
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);
        this.changeCompiler();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions);
    }

    updateWindowDimensions = () => {
        this._cachedClientRect = null;
        this.handleSize();
    }

    _clearCompileTimeout() {
        this._compileTimerDelay && clearTimeout(this._compileTimerDelay);
        this._compileTimerDelay = null;
    }

    updateCompilationWithDelay = (delay = 5000) => {
        this._clearCompileTimeout();
        this._compileTimerDelay = setTimeout(() => {
            this.updateCompilation();
            this._compileTimerDelay = null;
        }, delay);
    }

    updateCompilation = () => {
        if (!this.inputEditor) return;

        //console.clear();

        // clean errors and messages
        this._errorCount = 0;
        this.removeAllNotifications();
        this.removeAllAnnotation();
        this.setState({
            additionalStatusMessage: ''
        });

        const {
            compiler,
            longMode,
            validate,
            optimize,
            unsafe
        } = this.state;

        const inputCode = this.inputEditor.state.value;

        if (this.toolbar && this.toolbar.compileButton) {
            this.toolbar.compileButton.startCompile();
            this.setState({ compileStatus: 'compiling' });
        }

        setImmediate(() => {
            try {
                switch (compiler) {
                    case 'AssemblyScript':
                        const stdlib = isRequreStdlib(inputCode);
                        this.compileByAssemblyScript(inputCode, {
                             noMemory: !stdlib,
                             longMode,
                             validate,
                             optimize
                         });
                        break;

                    case 'Speedy.js':
                        this.compileBySpeedyJs(inputCode, {
                            unsafe,
                            optimizationLevel: optimize ? 3 : 0,
                            saveWast: true
                        });
                        break;

                    default: console.warn('Compiler not supported');
                }

            } catch (e) {

                this.setState({ compileStatus: 'failure' });
                this._errorCount = 1;

                const message = '<' + compiler + '> internal error: ';
                this.addNotification(message + e.message);
                console.error(message, e);

                this.setState({
                    additionalStatusMessage: message + e.message
                });

            } finally {
                if (this.toolbar && this.toolbar.compileButton)
                    this.toolbar.compileButton.endCompile();
            }
        });
    }

    compileByAssemblyScript(code, { noMemory, longMode, validate, optimize }) {
        const as = window.assemblyscript;

        const options = as.createOptions();

        as.setTarget(options,        +longMode);
        as.setNoTreeShaking(options, false);
        as.setNoAssert(options,      false);
        as.setNoMemory(options,      noMemory);

        const module = as.compile(as.parseFile(code, 'index.ts', null, true), options);

        setImmediate(() => {
            if (!module) {
                this.setState({ compileStatus: 'success' });

                // const diagnostics = as.Compiler.lastDiagnostics;
                // this._errorCount = diagnostics.length;

                /* for (let i = 0; i < diagnostics.length; i++) {
                    let errorMessage = as.typescript.formatDiagnostics([diagnostics[i]]);

                    if (i <= MaxPrintingErrors) {
                        console.error(errorMessage);
                        this.addNotification(errorMessage);
                        this.addAnnotation(errorMessage);
                    } else {
                        errorMessage = `Too many errors (${diagnostics.length})`;
                        console.error(errorMessage);
                        this.addNotification(errorMessage);
                        break;
                    }
                }*/

                return;
            }

            setImmediate(() => {
                if (validate) {
                    if (!module.validate()) {
                        let notValid = 'Code validation error';
                        console.error(notValid);
                        this.addNotification(notValid);
                        this._errorCount = 1;
                        this.setState({
                            compileStatus:           'failure',
                            additionalStatusMessage: notValid
                        });
                        module.dispose();
                        return;
                    }
                }

                if (optimize)
                    module.optimize();

                this._errorCount = 0;

                setImmediate(() => {
                    const text = module.toText();
                    const {
                      output: binary,
                    } = module.toBinary();

                    this.setState({
                        compileStatus: 'success',
                        output: { text, binary },
                    });

                    module.dispose();
                });
            });
        });
    }

    compileBySpeedyJs(code, options) {
        CompilerDescriptions['Speedy.js'].compile(code, options)
        .then(response => {
            if (this.state.compiler !== 'Speedy.js') return;

            if (response.length) {
                const output = response[0];
                if (output.exitStatus !== 0) {
                    this.setState({ compileStatus: 'failure' });

                    // compiled failure
                    const diagnostics = output.diagnostics;
                    this._errorCount = diagnostics.length;

                    for (let i = 0; i < diagnostics.length; i++) {
                        let errorMessage = diagnostics[i];

                        if (i <= MaxPrintingErrors) {
                            console.error(errorMessage);
                            this.addNotification(errorMessage);
                            this.addAnnotation(errorMessage);
                        } else {
                            errorMessage = `Too many errors (${diagnostics.length})`;
                            console.error(errorMessage);
                            this.addNotification(errorMessage);
                            break;
                        }
                    }
                } else {

                    this._errorCount = 0;

                    // compiled successfully
                    this.setState({
                        compileStatus: 'success',

                        output: {
                            text:   output.wast || '',
                            binary: new Uint8Array(output.wasm)
                        }
                    });
                }
            }
        })
        .catch(error => {
            this.setState({ compileStatus: 'failure' });
            this._errorCount = 1;

            const message = '<' + this.state.compiler + '> Service not response';
            this.addNotification(message);
            console.error(message);
        });
    }

    onInputChange = value => {
        // skip compilation if possible
        value = value.trim();
        if (this._lastTextInput !== value) {
            if (this.state.compileMode === CompileMode.Auto)
                this.updateCompilationWithDelay(AutoCompilationDelay);
            this._lastTextInput = value;
        }
    }

    onInputPositionChange = inputCursorPosition => {
        this.setState({ inputCursorPosition });
    }

    onDownloadBinary = () => {
        const { output, compiler } = this.state;
        var blob = new Blob([output.binary], { type: "application/octet-stream" });
        FileSaver.saveAs(blob, `${compiler.toLowerCase()}.module.wasm`);
    }

    changeCompiler = compiler => {
        this._errorCount        = 0;
        this._lastTextInput     = '';
        this._compileTimerDelay = null;

        compiler = compiler || this.state.compiler;

        const description = CompilerDescriptions[compiler];

        this.setState({
            compiler,
            input: description.example.trim(),
        }, () => {
            if (description.offline) {
                if (!description.loaded && description.scripts && description.scripts.length) {
                    if (description.scripts.length > 1) {
                        window.$script.order(description.scripts.slice(), () => {
                            description.loaded = true;
                            this.onScriptLoad();
                        });
                    } else {
                        window.$script(description.scripts[0], () => {
                            description.loaded = true;
                            this.onScriptLoad();
                        });
                    }

                } else {
                    this.onScriptLoad();
                }
            } else {
                this.onScriptLoad();
            }
        });
    }

    onScriptLoad() {
        this.setState({ compilerReady: true }, () => {
            getCompilerVersion(this.state.compiler, version => this.setState({ version }));
            this.updateCompilation();
        });
    }

    onScriptError = () => {
        console.error('Script not load');
        this.setState({
            compilerReady: false,
        });
    }

    onSplitPositionChange = size => {
        this.handleSize(size);
    }

    onCompileButtonClick = mode => {
        this._clearCompileTimeout();

        if (mode === CompileMode.Auto || mode === CompileMode.Manual)
            this.updateCompilation();
    }

    onSettingsOptionChange = (key, value) => {
        if (!this.state.compilerReady) return;
        this.setState({ [key]: value }, key !== 'base64' ? this.updateCompilation : null);
    }

    handleSize = throttle(8, size => {
        if (this.splitEditor) {
            if (!this._cachedClientRect)
                this._cachedClientRect = ReactDOM.findDOMNode(this.splitEditor).getBoundingClientRect();

            const { width, height } = this._cachedClientRect;
            const pos = (size ? size / width : this.state.splitPosition);
            const primaryWidth = width * pos;

            this.setState({
                inputEditorWidth:  Math.ceil(primaryWidth),
                outputEditorWidth: Math.ceil(width - primaryWidth - SplitGripWidth),
                editorsHeight:     height - 160,
                splitPosition:     pos,
            });

            this.splitEditor.setSize(
                { primary: 'first', size: primaryWidth },
                { draggedSize: primaryWidth }
            );
        }
    })

    addNotification = (message) => {
      // skip notifications for Auto compile mode
      // if (this.state.compileMode === CompileMode.Auto) {
      //    return;
      // }

    	const {
        notifications,
        notificationCount,
      } = this.state;

      const id = notifications.size + 1;
      const newCount = notificationCount + 1;
      return this.setState({
      	notificationCount: newCount,
      	notifications: notifications.add({
          id,
      		message,
      		key:          newCount,
      		action:       '✕',
      		dismissAfter: 5000,
          actionStyle:  {
            borderRadius: 0,
            paddingLeft:  '1.5rem',
            paddingRight: '0.6rem',
            fontSize:     '1.8rem',
            color:        '#fff',
          },
      		onClick: this.removeAllNotifications,
      	})
      });
    }

    addAnnotation = (message, type = 'error') => {
        const rowRegex = /\(([^)]+)\)/;
        const matches = rowRegex.exec(message);
        if (matches && matches.length === 2) {
            var row = ((matches[1].split(','))[0] >>> 0);
            this.setState(({ annotations }) => ({
                annotations: annotations.add({ row, type, text: message }),
            }));
        }
    }

    removeAllAnnotation = () => {
        this.setState({ annotations: OrderedSet() });
    }

    removeNotification = index => {
        const { notifications } = this.state;
        return this.setState({
            notifications: notifications.filter(n => n.key !== index),
        })
    }

    removeAllNotifications = () => {
        return this.setState({
            notificationCount: 0,
            notifications:     OrderedSet(),
        });
    }

    render() {
        const {
            version,
            compiler,

            compilerReady,
            compileStatus,
            notifications,
            annotations,
            additionalStatusMessage,

            splitPosition,
            inputEditorWidth,
            outputEditorWidth,
            editorsHeight,

            input,
            output,
            outputType,
            base64,

            inputCursorPosition,

        } = this.state;

        function notificationStyle(index, style, notification) {
            return {
                zOrder: 999,
                color: '#fff',
                background: '#f00',
                fontSize: '1.5rem',
                padding: '1.2em',
                paddingLeft: '1.8em',
                borderRadius: 0,
                left: '5.3em',
                bottom: `${4.2 + (index * 3.6)}em`
            };
        }

        const errorNotifications = notifications ? (<NotificationStack
            activeBarStyleFactory={ notificationStyle }
            notifications={ notifications.toArray() }
            onDismiss={ notification => this.setState({
                notifications: this.state.notifications.delete(notification)
            }) }
        />) : null;

        const canBinaryDownload = (
          compilerReady &&
          compileStatus === 'success' &&
          output.binary
        );

        let busyState = 'pending';
        if (compilerReady) {
            switch (compileStatus) {
                case 'success': busyState = 'success'; break;
                case 'failure': busyState = 'failure'; break;
                default: break;
            }
        }

        return (
            <div>
                <ToolbarContainer
                    ref={ self => this.toolbar = self }
                    version={ version }
                    compiler={ compiler }
                    compileDisabled={ !compilerReady }
                    onCompilerChange={ this.changeCompiler }
                    onCompileClick={ this.onCompileButtonClick }
                    onCompileModeChange={ mode => {
                        this._clearCompileTimeout();
                        this.setState({ compileMode: mode });
                        if (mode === CompileMode.Auto)
                            this.updateCompilationWithDelay(AutoCompilationDelay);
                    }}
                    onSettingsOptionChange={ this.onSettingsOptionChange }
                    onOutputSelect={ type => this.setState({ outputType: type }) }
                />

                <SplitPane
                    ref={ self => this.splitEditor = self }
                    split="vertical"
                    minSize={ 200 }
                    defaultSize={ splitPosition * 100 + '%' }
                    onChange={ this.onSplitPositionChange }
                    style={{
                        margin: '12px',
                    }}
                >
                    <Editor
                        focus
                        id="input"
                        ref={ self => this.inputEditor = self }
                        width={ inputEditorWidth }
                        height={ editorsHeight }
                        code={ input }
                        annotations={ annotations.toArray() }
                        onChange={ this.onInputChange }
                        onPositionChange={ this.onInputPositionChange }
                    />
                    <Editor
                        readOnly
                        id="output"
                        mode={ outputType === 'text' ? 'wast' : 'typescript' }
                        ref={ self => this.outputEditor = self }
                        width={ outputEditorWidth }
                        height={ editorsHeight }
                        code={ formatCode(output[outputType], base64) }
                    />
                </SplitPane>

                <FooterContainer
                    errorCount={ this._errorCount }
                    busyState={ busyState }
                    binarySize={ output.binary ? formatSize(output.binary.length) : '' }
                    onDownloadPressed={ this.onDownloadBinary }
                    downloadDisabled={ !canBinaryDownload }
                    errorMessage={ additionalStatusMessage }
                    cursorPosition={ inputCursorPosition }
                />

                { errorNotifications }
            </div>
        );
    }
}
