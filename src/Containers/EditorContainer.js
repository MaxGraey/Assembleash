
import React, { Component }  from "react"
import PropTypes             from 'prop-types'
import ReactDOM              from "react-dom"
import SplitPane             from 'react-split-pane'
import { NotificationStack } from 'react-notification'
import { throttle }          from 'throttle-debounce'
import FileSaver             from 'file-saver'

import $script               from 'scriptjs'

import ToolbarContainer from './ToolbarContainer'
import Editor           from '../Components/Editor'
import Footer           from '../Components/Footer'

import {
    isRequreStdlib,
    getCompilerVersion,
    CompilerDescriptions,
    CompileModes,
    formatCode,
    formatSize
} from '../Common/Common'

import { OrderedSet } from 'immutable'


const AutoCompilationDelay = 800; //ms
const MaxPrintingErrors = 8;

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
             compileMode:       CompileModes[0],
             compilerReady:     false,
             compileFailure:    false,
             compileSuccess:    false,
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
             //stdlib:            false,
             longMode:          false,
             unsafe:            true,

             annotations:       OrderedSet(),
             notifications:     OrderedSet(),
             notificationCount: 0
         };

         this._errorCounts       = 0;
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
        this.removeAllNotification();
        this.removeAllAnnotation();

        const {
            compiler,
            longMode,
            validate,
            optimize,
            unsafe
        } = this.state;

        const inputCode = this.inputEditor.state.value;

        if (this.toolbar && this.toolbar.compileButton) {
            this._errorCounts = 0;
            this.toolbar.compileButton.startCompile();
            this.setState({
                compileSuccess: false,
                compileFailure: false
            });
        }

        setImmediate(() => {
            try {
                switch (compiler) {
                    case 'AssemblyScript':
                        const stdlib = isRequreStdlib(inputCode);
                        this.compileByAssemblyScript(inputCode, { stdlib, validate, optimize, longMode });
                        break;

                    case 'TurboScript':
                        this.compileByTurboScript(inputCode);
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

                this.setState({
                    compileSuccess: false,
                    compileFailure: true
                });

                this._errorCounts = 1;

                const message = '<' + compiler + '> internal error:\n';
                this.addNotification(message + e.message);
                console.error(message, e);

            } finally {
                if (this.toolbar && this.toolbar.compileButton)
                    this.toolbar.compileButton.endCompile();
            }
        });
    }

    compileByAssemblyScript(code, { stdlib, validate, optimize, longMode }) {

        const as = window.assemblyscript;
        const module = as.Compiler.compileString(
            code, {
                silent: true,
                uintptrSize: longMode ? 8 : 4,
                noLib: !stdlib
            }
        );

        setImmediate(() => {
            if (!module) {
                this.setState({
                    compileSuccess: false,
                    compileFailure: true
                });

                const diagnostics = as.Compiler.lastDiagnostics;
                this._errorCounts = diagnostics.length;

                for (let i = 0; i < diagnostics.length; i++) {
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
                }

            } else {
                setImmediate(() => {
                    if (validate) {
                        if (!module.validate()) {
                            let notValid = 'Wasm validation error';
                            console.error(notValid);
                            this.addNotification(notValid);
                            this._errorCounts = 1;
                            return;
                        }
                    }

                    if (optimize)
                        module.optimize();

                    this._errorCounts = 0;

                    setImmediate(() => {
                        this.setState({
                            compileSuccess: true,
                            compileFailure: false,

                            output: {
                                text:   module.emitText(),
                                binary: module.emitBinary()
                            }
                        });

                        module.dispose();
                    });
                });
            }
        });
    }

    compileByTurboScript(code, options) {
        const turbo = window.turboscript;
        const result = turbo.compileString(code, {
            target:   turbo.CompileTarget.WEBASSEMBLY,
            silent:   true,
            logError: true
        });

        if (!result.success) {
            this.setState({
                compileSuccess: false,
                compileFailure: true
            });
            setImmediate(() => {
                let diagnostic = result.log.first;
                let errorCount = 0;
                let errorMessage;
                while (diagnostic != null) {
                    const location = diagnostic.range.source.indexToLineColumn(diagnostic.range.start);
                    errorMessage = `[${location.line + 1}:${location.column + 1}] `;
                    errorMessage += diagnostic.kind === turbo.DiagnosticKind.ERROR ? "ERROR: " : "WARN: ";
                    errorMessage += diagnostic.message + "\n";

                    if (errorCount <= MaxPrintingErrors) {
                        this.addNotification(errorMessage);
                        let annotations = this.state.annotations;
                        this.setState({
                            annotations: annotations.add({row: location.line, type: "error", text: errorMessage})
                        });
                    }

                    errorCount++;
                    this._errorCounts++;
                    diagnostic = diagnostic.next;
                }

                if (errorCount > MaxPrintingErrors) {
                    errorMessage = `Too many errors (${errorCount})`;
                    console.error(errorMessage);
                    this.addNotification(errorMessage);
                }
            });

        } else {
            setImmediate(() => {
                this._errorCounts = 0;
                this.setState({
                    compileSuccess: true,
                    compileFailure: false,
                    output: {
                        text: result.wast,
                        binary: result.wasm
                    }
                });
            });
        }
    }

    compileBySpeedyJs(code, options) {
        CompilerDescriptions['Speedy.js'].compile(code, options)
        .then(response => {
            this.setState({
                compilerReady:  true
            });

            if (response.length) {
                const output = response[0];
                if (output.exitStatus !== 0) {
                    this.setState({
                        compileSuccess: false,
                        compileFailure: true
                    });

                    // compiled failure
                    const diagnostics = output.diagnostics;
                    this._errorCounts = diagnostics.length;

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

                    this._errorCounts = 0;

                    // compiled successfully
                    this.setState({
                        compileSuccess: true,
                        compileFailure: false,

                        output: {
                            text:   output.wast || '',
                            binary: new Uint8Array(output.wasm)
                        }
                    });
                }
            }
        })
        .catch(error => {
            this.setState({
                compileSuccess: false,
                compileFailure: true
            });

            this._errorCounts = 1;

            const message = '<' + this.state.compiler + '> Service not response';
            this.addNotification(message);
            console.error(message);
        });
    }

    onInputChange = value => {
        // skip compilation if possible
        value = value.trim();
        if (this._lastTextInput === value)
            return;

        this._lastTextInput = value;
        const mode = this.state.compileMode;

        if (mode === CompileModes[0]) { // Auto
            this.updateCompilationWithDelay(AutoCompilationDelay);
        }
    }

    onDownloadBinary = () => {
        const { output, compiler } = this.state;
        var blob = new Blob([output.binary], { type: "application/octet-stream" });
        FileSaver.saveAs(blob, `${compiler.toLowerCase()}.module.wasm`);
    }

    changeCompiler = compiler => {
        this._errorCounts       = 0;
        this._lastTextInput     = '';
        this._compileTimerDelay = null;

        compiler = compiler || this.state.compiler;

        const description = CompilerDescriptions[compiler];

        this.setState({
            compiler,
            input: description.example,
            compilerReady: false
        });

        if (description.offline) {
            if (!description.loaded) {
                $script.order(description.scripts, () => {
                    this.setState({ compilerReady: true }, () => {
                        description.loaded = true;
                        getCompilerVersion(compiler, version => this.setState({ version }));
                        this.updateCompilation();
                    });
                });
            } else {
                this.setState({ compilerReady: true }, () => {
                    getCompilerVersion(compiler, version => this.setState({ version }));
                    this.updateCompilation();
                });
            }
        } else {
            this.setState({ compilerReady: true }, () => {
                console.log('loaded');

                getCompilerVersion(compiler, version => this.setState({ version }));
                this.updateCompilation();
            });
        }
    }

    onScriptLoad = () => {
        console.log('Compiler', window.assemblyscript);
        this.setState({ compilerReady: true }, () => {
            this.changeCompiler();
        });
    }

    onScriptError = () => {
        console.error('Script not load');
        this.setState({
            compilerReady: false
        });
    }

    onSplitPositionChange = size => {
        this.handleSize(size);
    }

    onCompileButtonClick = mode => {
        this._clearCompileTimeout();

        if (mode === CompileModes[0] || // Auto
            mode === CompileModes[1]) { // Manual

            this.updateCompilation();

        } else if (CompileModes[2]) { // Decompile
            // Decompile not supported yet
        }
    }

    onSettingsOptionChange = (key, value) => {
        if (!this.state.compilerReady) return;
        this.setState({ [key]: value }, this.updateCompilation );
    }

    handleSize = throttle(8, size => {
        if (this.splitEditor) {
            if (!this._cachedClientRect) {
                this._cachedClientRect = ReactDOM.findDOMNode(this.splitEditor).getBoundingClientRect();
            }
            const { width, height } = this._cachedClientRect;
            const gripWidth = 4;

            this.setState({
                inputEditorWidth:  size ? size : '100%',
                outputEditorWidth: size ? width - size - gripWidth : '100%',
                editorsHeight:     height - 160
            });
        }
    })

    addNotification = (message) => {
        // skip notifications for Auto compile mode
        if (this.state.compileMode === CompileModes[0]) { //Auto
            return;
        }

    	const { notifications, notificationCount } = this.state;

        const id = notifications.size + 1;
        const newCount = notificationCount + 1;
        return this.setState({
        	notificationCount: newCount,
        	notifications: notifications.add({
                id,
        		message,
        		key: newCount,
        		action: '✕',
        		dismissAfter: 5000,
                actionStyle: {
                    borderRadius: 0,
                    paddingLeft: '1.5rem',
                    paddingRight: '0.6rem',
                    fontSize: '1.8rem',
                    color: '#fff'
                },
        		onClick: () => this.removeAllNotification()
        	})
        });
    }

    addAnnotation = (message, type = 'error') => {
        const rowRegex = /\(([^)]+)\)/;
        const matches = rowRegex.exec(message);
        if (matches && matches.length === 2) {
            var row = ((matches[1].split(','))[0] >>> 0) - 1;
            let annotations = this.state.annotations;
            this.setState({ annotations:
                annotations.add({ row, type, text: message })
            });
        }
    }

    removeAllAnnotation = () => {
        this.setState({ annotations: OrderedSet() });
    }

    removeNotification = index => {
        const { notifications } = this.state;
        return this.setState({
            notifications: notifications.filter(n => n.key !== index)
        })
    }

    removeAllNotification = () => {
        return this.setState({
            notificationCount: 0,
            notifications: OrderedSet()
        });
    }

    render() {
        const {
            version,
            compiler,

            compilerReady,
            compileSuccess,
            compileFailure,
            notifications,
            annotations,

            inputEditorWidth,
            outputEditorWidth,
            editorsHeight,

            input,
            output,
            outputType

        } = this.state;

        function notificationStyle(index, style, notification) {
            return {
                zOrder: 999,
                color: '#fff',
                background: '#f00',
                fontSize: '1.5rem',
                padding: '1.6rem',
                paddingLeft: '2.1rem',
                borderRadius: 0,
                left: '74px',
                bottom: `${6.6 + (index * 5)}rem`
            };
        }

        const errorNotifications = notifications ? (<NotificationStack
            activeBarStyleFactory={ notificationStyle }
            notifications={ notifications.toArray() }
            onDismiss={ notification => this.setState({
                notifications: this.state.notifications.delete(notification)
            }) }
        />) : null;

        const canBinaryDownload   = compilerReady && compileSuccess && output.binary;
        const compilerDescription = CompilerDescriptions[compiler];

        /*const compilerScripts =
        (compilerDescription && compilerDescription.offline ?
        (compilerDescription.scripts.map((script, index) => {
            console.log(script, index);
            return <Script
                key={ index }
                url={ script.url }
                onError={ this.onScriptError }
                onLoad={ index === compilerDescription.scripts.length - 1 ? this.onScriptLoad : void 0 }
            />
        }))
        : null);*/

        let busyState = 'busy';

        if (compilerReady) {
            // TODO change this to compileStatus
            if (!compileSuccess && compileFailure) {
                busyState = 'failure';
            } else if (compileSuccess && !compileFailure) {
                busyState = 'success';
            }
        }

        return (
            <div>
                {/* { compilerScripts } */}

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
                        if (mode === CompileModes[0]) { // Auto
                            this.updateCompilationWithDelay(AutoCompilationDelay);
                        }
                    }}
                    onSettingsOptionChange={ this.onSettingsOptionChange }
                    onOutputSelect={ type => this.setState({ outputType: type }) }
                />

                <SplitPane
                    ref={ self => this.splitEditor = self }
                    split="vertical"
                    minSize={ 200 }
                    defaultSize="62%"
                    onChange={ this.onSplitPositionChange }
                    style={{
                        margin: '12px'
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
                    >
                    </Editor>
                    <Editor
                        readOnly
                        id="output"
                        ref={ self => this.outputEditor = self }
                        width={ outputEditorWidth }
                        height={ editorsHeight }
                        code={ formatCode(output[outputType]) }
                    />
                </SplitPane>

                <Footer
                    errorCount={ this._errorCounts }
                    busyState={ busyState }
                    binarySize={ output.binary ? formatSize(output.binary.length) : '' }
                    onDownloadPressed={ this.onDownloadBinary }
                    downloadDisabled={ !canBinaryDownload }
                />

                { errorNotifications }
            </div>
        );
    }
}
