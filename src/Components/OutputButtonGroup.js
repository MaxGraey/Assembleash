import React, { Component } from 'react';

import Button         from 'react-bootstrap/lib/Button';
import Glyphicon      from 'react-bootstrap/lib/Glyphicon';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';

import tooltip          from './Tooltip';
import RadioButtonGroup from './RadioButtonGroup';

export default class OutputButtonGroup extends Component {
    static defaultProps = {
        onSelect: () => {},
    }

    state = {
        radio: {
            text:   true,
            binary: false,
        },
    }

    onSelect = values => {
        this.setState({ radio: values });
        this.props.onSelect(this._getOutputType());
    }

    _getOutputType() {
        const { text, binary } = this.state.radio;
        if (text)   return 'text';
        if (binary) return 'binary';
        return 'text';
    }

    render() {
        return (
            <OverlayTrigger
                rootClose
                placement='left'
                trigger={[ 'hover', 'focus' ]}
                overlay={ tooltip('Output') }
            >
                <RadioButtonGroup
                    value={ this.state.radio }
                    type='radio'
                    bsSize='large'
                    className='pull-right'
                    onChange={ this.onSelect }
                >
                    <Button eventKey='text' bsStyle='primary' style={{ paddingLeft: '0.95em', paddingRight: '0.95em' }}>
                        <Glyphicon glyph='align-left'/>
                    </Button>
                    <Button eventKey='binary' bsStyle='primary' style={{ paddingLeft: '1.12em', paddingRight: '1.12em' }}>
                        <span className='icon-binary-code'/>
                    </Button>
                </RadioButtonGroup>
            </OverlayTrigger>
        );
    }
}
