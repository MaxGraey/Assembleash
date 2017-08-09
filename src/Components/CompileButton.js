import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
    OverlayTrigger,
    MenuItem,
    Glyphicon,
    SplitButton
} from 'react-bootstrap';

import { CompileMode, CompileModes } from '../Common/Common'

import tooltip from './Tooltip'

export default class CompileButton extends Component {
    static propTypes = {
        disabled: PropTypes.bool,
        onChange: PropTypes.func,
		    onClick:  PropTypes.func
    }

    static defaultProps = {
        disabled: true,
        onChange: () => {},
        onClick:  () => {}
    }

    constructor(props) {
        super(props);
        this.state = {
            isCompiling: false,
            compileMode: CompileMode.Auto,
            cursor:      'pointer'
        };
    }

    startCompile() {
        this.setState({
            isCompiling: true,
            cursor:      'wait'
        });
    }

    endCompile() {
        this.setState({
            isCompiling: false,
            cursor:      'pointer'
        });
    }

    onCompile = () => {
        const { onClick } = this.props;
        onClick(this.state.compileMode);
    }

    onSelect = compileMode => {
        this.setState({ compileMode });
        this.props.onChange(compileMode);
    }

    render() {
        const { disabled } = this.props;
        const { isCompiling, compileMode, cursor } = this.state;

        const title = (
            <span>
                <Glyphicon
                    glyph={ !isCompiling ? 'play' : 'refresh' }
                    className={ isCompiling ? 'gly-spin' : '' }
                />{ '\t' + CompileModes[compileMode] }
            </span>
        );

        return (
            <OverlayTrigger
                rootClose
                placement='right'
                trigger={['hover', 'focus']}
                overlay={ tooltip('Compile') }
            >
                <SplitButton
                    id='compileButton'
                    title={ title }
                    disabled={ isCompiling || disabled }
                    className='pull-left'
                    bsStyle='success'
                    bsSize='large'
                    style={{
                        cursor,
                        width: '161px'
                    }}
                    onClick={ !isCompiling ? this.onCompile : null }
                >
                {
                    CompileModes.map((value, index) =>
                        <MenuItem
                            key={ index }
                            eventKey={ index }
                            onSelect={ this.onSelect }
                            style={{ textAlign: 'center' }}
                        >
                            <h4>{ value }</h4>
                        </MenuItem>
                    )
                }
                </SplitButton>
            </OverlayTrigger>
        );
    }
}
