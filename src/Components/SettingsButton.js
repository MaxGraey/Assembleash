import React, { Component } from "react"
import {
    OverlayTrigger,
    DropdownButton,
    Glyphicon
} from 'react-bootstrap';

import ToggledOption from './ToggledOption'
import tooltip from './Tooltip'

export default class SettingsButton extends Component {
    onStdlibChange = value => {
        const { onOptionChange } = this.props;
        onOptionChange && onOptionChange('stdlib', value);
    }

    onValidateChange = value => {
        const { onOptionChange } = this.props;
        onOptionChange && onOptionChange('validate', value);
    }

    onOptimizeChange = value => {
        const { onOptionChange } = this.props;
        onOptionChange && onOptionChange('optimize', value);
    }

    onLongPointersChange = value => {
        const { onOptionChange } = this.props;
        onOptionChange && onOptionChange('longMode', value);
    }

    render() {
        return (
            <OverlayTrigger
                rootClose
                placement="left"
                trigger={[ "hover" ]}
                overlay={ tooltip('Settings') }
            >
                <DropdownButton
                    //open
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
                    <ToggledOption
                        name="option-stdlib"
                        style={{ width: '500px' }}
                        label="Library"
                        onChange={ this.onStdlibChange }
                    />
                    <ToggledOption
                        name="option-64bits"
                        style={{ width: '500px' }}
                        label="Use 64 bits"
                        onChange={ this.onLongPointersChange }
                    />
                    <ToggledOption
                        defaultActive
                        name="option-validate"
                        style={{ width: '500px' }}
                        label="Validate"
                        onChange={ this.onValidateChange }
                    />
                    <ToggledOption
                        defaultActive
                        name="option-optimize"
                        style={{ width: '500px' }}
                        label="Optimize"
                        onChange={ this.onOptimizeChange }
                    />
                </DropdownButton>
            </OverlayTrigger>
        );
    }
}
