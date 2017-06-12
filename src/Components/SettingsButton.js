import React, { Component } from "react"
import {
    OverlayTrigger,
    DropdownButton,
    Glyphicon
} from 'react-bootstrap';

import ToggledOption from './ToggledOption'
import tooltip from './Tooltip'

export default class SettingsButton extends Component {

    static Options = {
        'stdlib': {
            label: 'Library',
            default: false
        },
        'longMode': {
            label: 'Use 64 bits',
            default: false
        },
        'validate': {
            label: 'Validate',
            default: false
        },
        'optimize': {
            label: 'Optimize',
            default: true
        }
    }

    static defaultProps = {
        requireStdLib: false
    }

    constructor(props) {
        super(props);
        this.state = {
            requireStdLib: props.requireStdLib
        }
    }

    onChange = (key, value) => {
        const { onOptionChange } = this.props;
        onOptionChange && onOptionChange(key, value);
    }

    render() {
        const options = SettingsButton.Options;
        const requireStdLib = this.props.requireStdLib;

        return (
            <OverlayTrigger
                rootClose
                placement="bottom"
                trigger={[ "hover" ]}
                overlay={ tooltip('Settings') }
            >
                <DropdownButton
                    noCaret
                    pullRight
                    id="settings-button"
                    className="pull-right"
                    bsStyle="info"
                    title={ <Glyphicon glyph="cog"/> }
                    bsSize="large"
                    style={{
                        paddingLeft:  '0.9em',
                        paddingRight: '0.9em'
                    }}
                >
                    { Object.keys(options).map((key, index) =>
                        <ToggledOption
                            key={ index }
                            // defaultActive={ options[key].default }
                            name={ `option-${key}` }
                            label={ options[key].label }
                            active={ (key === 'stdlib' && requireStdLib) || options[key].default }
                            onChange={ value => { this.onChange(key, value) }}
                        />)
                    }
                </DropdownButton>
            </OverlayTrigger>
        );
    }
}
