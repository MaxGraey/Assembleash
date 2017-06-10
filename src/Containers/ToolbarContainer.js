
import React, { Component } from "react"
import PropTypes from 'prop-types'
import {
    Row,
    ButtonToolbar,
    ButtonGroup
} from 'react-bootstrap';

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
        requireStdLib:          PropTypes.bool,

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
        requireStdLib:          false,

        onCompilerChange:       () => {},
        onCompileClick:         () => {},
        onCompileModeChange:    () => {},
        onSettingsOptionChange: () => {},
        onOutputSelect:         () => {}
    }

    constructor(props) {
        super(props);
        this.state = {
            compiler: props.compiler,
            version:  props.version
        }
    }

    render() {
        const { compiler, version } = this.state;
        const {
            compileDisabled,
            onSettingsOptionChange,
            onCompilerChange,
            onCompileModeChange,
            onCompileClick,
            onOutputSelect,
            requireStdLib
        } = this.props;

        return (
            <ButtonToolbar style={{ padding: '0', margin: '20px 20px 12px 15px' }}>
                <div
                    style={{
                        position: 'absolute',
                        right: 0,
                        marginTop: '-1.3rem',
                        marginRight: '23.5rem',
                        textAlign: 'center'
                    }}>
                        <h2>Assembleash</h2>
                </div>

                <ButtonGroup>
                    <CompilerButton
                        compiler={ compiler }
                        onSelect={ compiler => {
                            this.setState({
                                compiler,
                                version: getCompilerVersion(compiler)
                            });
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
                    <SettingsButton requireStdLib={ requireStdLib } onOptionChange={ onSettingsOptionChange }/>
                    <OutputButtonGroup onSelect={ onOutputSelect }/>
                </ButtonToolbar>
            </ButtonToolbar>
        );
    }
}
