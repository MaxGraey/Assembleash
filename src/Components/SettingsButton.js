import React, { Component } from "react"
import {
    OverlayTrigger,
    DropdownButton,
    Glyphicon
} from 'react-bootstrap';

import ToggledOption from './ToggledOption'
import tooltip from './Tooltip'

import { CompilerDescriptions, CompilerList } from '../Common/Common'

export default class SettingsButton extends Component {

    static defaultProps = {
        compiler: CompilerList[1],
        onOptionChange: () => {}
    }

    render() {
        const { compiler, onOptionChange } = this.props;
        const options = CompilerDescriptions[compiler].options;

        options.base64 = {
            label:   'Base64',
            default: false
        };

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
                    disabled={ !options || !Object.keys(options).length }
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
                    { Object.keys(options).map((key, index) => {
                        if (!options[key] || !options[key].label)
                            return null;

                        const defaultActive = options[key].default || false;
                        return (
                            <ToggledOption
                                key={ key }
                                defaultActive={ defaultActive }
                                name={ `option-${key}` }
                                label={ options[key].label }
                                onChange={ value => onOptionChange(key, value) }
                            />
                        );
                    }) }
                </DropdownButton>
            </OverlayTrigger>
        );
    }
}
