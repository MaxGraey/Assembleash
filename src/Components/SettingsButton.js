import React, { PureComponent } from 'react';

import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Glyphicon      from 'react-bootstrap/lib/Glyphicon';

import ToggledOption  from './ToggledOption';
import tooltip        from './Tooltip';

import { CompilerDescriptions, CompilerList } from '../Common/Common';

export default class SettingsButton extends PureComponent {

    static defaultProps = {
        compiler:             CompilerList[1],
        onOptionChange:       () => {},
        overlayTriggers:      ['hover'],
        dropdownTitleElement: <Glyphicon glyph='cog'/>,
        dropdownStyle: {
          paddingLeft:  '0.9em',
          paddingRight: '0.9em',
        },
    }

    render() {
        const {
          compiler,
          onOptionChange,
          overlayTriggers,
          dropdownTitleElement,
          dropdownStyle,
        } = this.props;

        const options = {
          ...CompilerDescriptions[compiler].options,
          base64: {
            label:   'Base64',
            default: false,
          },
        };

        return (
            <OverlayTrigger
                rootClose
                placement='bottom'
                trigger={ overlayTriggers }
                overlay={ tooltip('Settings') }
            >
                <DropdownButton
                    noCaret
                    pullRight
                    disabled={ !Object.keys(options).length }
                    id='settings-button'
                    className='pull-right'
                    bsStyle='info'
                    title={ dropdownTitleElement }
                    style={ dropdownStyle }
                    bsSize='large'
                >
                    { Object.keys(options).map(key => {
                        const option = options[key];
                        if (!option || !option.label)
                            return null;

                        return (
                            <ToggledOption
                                key={ key }
                                defaultActive={ !!option.default }
                                name={ `option-${key}` }
                                label={ option.label }
                                onChange={ value => onOptionChange(key, value) }
                            />
                        );
                    }) }
                </DropdownButton>
            </OverlayTrigger>
        );
    }
}
