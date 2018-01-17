import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
    MenuItem,
    OverlayTrigger,
    DropdownButton,
} from 'react-bootstrap';

import tooltip from './Tooltip'
import { CompilerList } from '../Common/Common'

export default class CompilerButton extends Component {
    static defaultProps = {
        compiler: CompilerList[0],
        onSelect: () => {},
    }

    static propTypes = {
        compiler: PropTypes.string,
        onSelect: PropTypes.func,
    }

    static styles = {
        button: {
            minWidth: '238px',
        },

        menuItem: {
            minWidth: '238px',
            textAlign: 'center',
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            compiler: props.compiler,
        };
    }

    onSelect = eventKey => {
        const compiler = CompilerList[eventKey];
        this.setState({ compiler }, () => {
            this.props.onSelect(compiler);
        });
    }

    render() {
        const { styles } = this.constructor;
        return (
            <OverlayTrigger
                rootClose
                placement='bottom'
                trigger={[ 'hover' ]}
                overlay={ tooltip('Choose Compiler') }
            >
                <DropdownButton
                    id='compilers'
                    bsStyle='info'
                    bsSize='large'
                    title={ this.state.compiler }
                    style={ styles.button }
                    onSelect={ this.onSelect }
                >
                {
                    CompilerList.map((value, index) =>
                        <MenuItem
                            key={ index }
                            eventKey={ index }
                            href={ `#${ value }` }
                            bsStyle='info'
                            style={ styles.menuItem }>
                            <h4>{ value }</h4>
                        </MenuItem>
                    )
                }
                </DropdownButton>
            </OverlayTrigger>
        );
    }
}
