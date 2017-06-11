
import React, { Component }  from "react"
import PropTypes             from 'prop-types'
import ReactDOM              from "react-dom"
import SplitPane             from 'react-split-pane'
import Script                from 'react-load-script'
import { NotificationStack } from 'react-notification'
import { throttle }          from 'throttle-debounce'
import FileSaver             from 'file-saver'

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

import { OrderedSet } from 'immutable';

const input =
`export function fib(num: int32): int32 {
    if (num <= 1) return 1;
    return fib(num - 1) + fib(num - 2);
}`;


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
             version:           '0.0.1',
             compiler:          props.compiler,
             compileMode:       CompileModes[0],
             compilerReady:     false,
             compileSuccess:    false,
             inputEditorWidth:  '100%',
             outputEditorWidth: '100%',
             editorsHeight:     '750px',
             output: {
                 text:   '',
                 binary: null
             },
             outputType:        'text',

             // settings
             validate:          true,
             optimize:          true,
             stdlib:            false,
             longMode:          false,

             notifications:     OrderedSet(),
             notificationCount: 0
         };

         this._compileTimerDelay = null;
         this._cachedClientRect  = null;
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateWindowDimensions);
    }

    updateWindowDimensions = () => {
        this._cachedClientRect = null;
        this.handleSize();
    }

    onScriptLoad = () => {
        this.setState({
            compilerReady: true,
            version: getCompilerVersion(this.state.compiler)
        });

        this.updateCompilation();
    }

    _clearCompileTimeout() {
        this._compileTimerDelay && clearTimeout(this._compileTimerDelay);
        this._compileTimerDelay = null;
    }

    updateCompilationWithDelay = (delay = 2000) => {
        this._clearCompileTimeout();
        this._compileTimerDelay = setTimeout(() => {
            this.updateCompilation();
            this._compileTimerDelay = null;
        }, delay);
    }

    updateCompilation = () => {
        if (!this.inputEditor) return;

        this.removeAllNotification();

        let stdlib = this.state.stdlib;
        const { compiler, validate, optimize, longMode } = this.state;
        const inputCode = this.inputEditor.state.value;

        if (this.toolbar && this.toolbar.compileButton)
            this.toolbar.compileButton.startCompile();

        setImmediate(() => {
            if (!stdlib && isRequreStdlib(inputCode)) {
                stdlib = true;
                this.setState({ stdlib });
            }

            try {
                if (compiler === 'AssemblyScript') {
                    this.compileByAssemblyScript(inputCode, { stdlib, validate, optimize, longMode });
                } else if (compiler === 'TurboScript') {
                    this.compileByTurboScript(inputCode);
                } else {
                    console.warn('compiler nor supported');
                }
            } catch (e) {
                this.setState({
                    compileSuccess: false
                });

                let message = '<' + compiler + '> internal error:\n';
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
        var module = as.Compiler.compileString(code, { silent: true, uintptrSize: longMode ? 8 : 4, noLib: !stdlib });

        if (!module) {
            this.setState({
                compileSuccess: false
            });

            const diagnostics = as.Compiler.lastDiagnostics;

            for (let i = 0; i < diagnostics.length; i++) {
                const errorMessage = as.typescript.formatDiagnostics([diagnostics[i]]);
                console.error(errorMessage);
                this.addNotification(errorMessage);
            }

        } else {
            if (validate)
                module.validate();

            if (optimize)
                module.optimize();

            this.setState({
                compileSuccess: true,
                output: {
                    text:   module.emitText(),
                    binary: module.emitBinary()
                }
            });

            module.dispose();
        }
    }

    compileByTurboScript(code, options) {
        // TODO
    }

    onInputChange = value => {
        const mode = this.state.compileMode;

        if (mode === CompileModes[0]) { // Auto
            this.updateCompilationWithDelay(2000);
        }
    }

    onDownloadBinary = () => {
        const { output, compiler } = this.state;
        var blob = new Blob([output.binary], { type: "application/octet-stream" });
        FileSaver.saveAs(blob, `${compiler.toLowerCase()}.module.wasm`);
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

        } else if (CompileModes[2]) {
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

    removeNotification = index => {
        const { notifications } = this.state;
        return this.setState({
            notifications: notifications.filter(n => n.key !== index)
        })
    }

    removeAllNotification = () => {
        return this.setState({ notifications: OrderedSet() });
    }

    render() {
        const {
            version,
            compiler,
            compilerReady,
            compileSuccess,
            inputEditorWidth,
            outputEditorWidth,
            editorsHeight,
            output,
            outputType,
            notifications,
            stdlib
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

        const compilerScript = (compilerDescription ? <Script
            url={ compilerDescription.url }
            onError={ this.onScriptError }
            onLoad={ this.onScriptLoad }
        /> : null);

        return (
            <div>
                { compilerScript }

                <ToolbarContainer
                    ref={ self => this.toolbar = self }
                    version={ version }
                    compiler={ compiler }
                    requireStdLib={ stdlib }
                    compileDisabled={ !compilerReady }
                    onCompilerChange={ compiler => this.setState({ compiler }) }
                    onCompileClick={ this.onCompileButtonClick }
                    onCompileModeChange={ mode => {
                        this._clearCompileTimeout();
                        this.setState({ compileMode: mode });
                        if (mode === CompileModes[0]) { // Auto
                            this.updateCompilationWithDelay(2000);
                        }
                    }}
                    onSettingsOptionChange={ this.onSettingsOptionChange }
                    onOutputSelect={ type => this.setState({ outputType: type }) }
                />
                <SplitPane
                    ref={ self => this.splitEditor = self }
                    split="vertical"
                    minSize={ 200 }
                    defaultSize="58%"
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
                    binarySize={ output.binary ? formatSize(output.binary.length) : '' }
                    onDownloadPressed={ this.onDownloadBinary }
                    downloadDisabled={ !canBinaryDownload }
                />

                { errorNotifications }
            </div>
        );
    }
}
