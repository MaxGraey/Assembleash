
import React, { Component } from "react"
import PropTypes from 'prop-types'
import {
    ButtonToolbar,
    ButtonGroup,
    OverlayTrigger
} from 'react-bootstrap';

import tooltip from '../Components/Tooltip'

//const Logo = require('react-svg-loader!../logo.svg');

import CompilerButton    from '../Components/CompilerButton'
import AboutButton       from '../Components/AboutButton'
import CompileButton     from '../Components/CompileButton'
import SettingsButton    from '../Components/SettingsButton'
import OutputButtonGroup from '../Components/OutputButtonGroup'

export default class ToolbarContainer extends Component {
    static propTypes = {
        version:                PropTypes.string,
        compiler:               PropTypes.string,
        compileDisabled:        PropTypes.bool,

        onCompilerChange:       PropTypes.func,
        onCompileClick:         PropTypes.func,
        onCompileModeChange:    PropTypes.func,
        onSettingsOptionChange: PropTypes.func,
        onOutputSelect:         PropTypes.func
    }

    static defaultProps = {
        version:                '0.0.0',
        compiler:               'Unknown',
        compileDisabled:        false,

        onCompilerChange:       () => {},
        onCompileClick:         () => {},
        onCompileModeChange:    () => {},
        onSettingsOptionChange: () => {},
        onOutputSelect:         () => {}
    }

    constructor(props) {
        super(props);
        this.state = {
            compiler: props.compiler
        }
    }

    render() {
        const { compiler } = this.state;
        const {
            version,
            compileDisabled,
            onSettingsOptionChange,
            onCompilerChange,
            onCompileModeChange,
            onCompileClick,
            onOutputSelect
        } = this.props;

        return (
            <ButtonToolbar style={{ padding: '0', margin: '20px 20px 12px 15px' }}>
                <ButtonGroup>
                    <CompilerButton
                        compiler={ compiler }
                        onSelect={ compiler => {
                            this.setState({ compiler });
                            onCompilerChange(compiler);
                        }}
                    />
                    <AboutButton compiler={ compiler } version={ version }/>
                </ButtonGroup>

                <CompileButton
                    ref={ self => this.compileButton = self }
                    disabled={ compileDisabled }
                    onChange={ onCompileModeChange }
                    onClick={ onCompileClick }
                />

                <ButtonToolbar className="pull-right">
                    <SettingsButton compiler={ compiler } onOptionChange={ onSettingsOptionChange }/>
                    <OutputButtonGroup onSelect={ onOutputSelect }/>
                </ButtonToolbar>

                <div className="logo pull-right">
                    <h2>Assembleash <sup style={{ fontWeight: 100, fontSize: '1.9rem', color: '#bbb' }}>BETA</sup></h2>
                </div>
                <OverlayTrigger
                    rootClose
                    placement='bottom'
                    trigger={['hover', 'focus']}
                    overlay={ tooltip('Pet the octocat on GitHub') }
                >
                    <div className="fork-me pull-right">
                        <a target="_blank" href="https://github.com/MaxGraey/Assembleash">
                            <svg aria-hidden="true" className="github-octicon-mark" version="1.1" viewBox="0 0 16 16" width="32" height="32">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" fillRule="evenodd"></path>
                            </svg>
                        </a>
                    </div>
                </OverlayTrigger>
            </ButtonToolbar>
        );
    }
}
