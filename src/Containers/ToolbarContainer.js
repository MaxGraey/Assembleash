
import React, { Component } from "react"
import PropTypes from 'prop-types'
import {
    ButtonToolbar,
    ButtonGroup
} from 'react-bootstrap';

//const Logo = require('react-svg-loader!../logo.svg');

import CompilerButton    from '../Components/CompilerButton'
import AboutButton       from '../Components/AboutButton'
import CompileButton     from '../Components/CompileButton'
import SettingsButton    from '../Components/SettingsButton'
import OutputButtonGroup from '../Components/OutputButtonGroup'

import { getCompilerVersion } from '../Common/Common'

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
                <div
                    style={{
                        position: 'absolute',
                        right: 0,
                        marginTop: '-1.3rem',
                        marginRight: '21.0rem',
                        textAlign: 'center'
                    }}>
                        <h2>Assembleash <sup style={{ fontWeight: 100, fontSize: '1.9rem', color: '#bbb' }}>BETA</sup></h2>
                </div>

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
                    <SettingsButton onOptionChange={ onSettingsOptionChange }/>
                    <OutputButtonGroup onSelect={ onOutputSelect }/>
                </ButtonToolbar>
            </ButtonToolbar>
        );
    }
}
