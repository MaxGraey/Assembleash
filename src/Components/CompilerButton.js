import React, { Component } from 'react'
import PropTypes from 'prop-types'

import {
    MenuItem,
    OverlayTrigger,
    DropdownButton,
    ProgressBar
} from 'react-bootstrap';

import tooltip from './Tooltip'
import { CompilerList } from '../Common/Common'

export default class CompilerButton extends Component {
    static defaultProps = {
        compiler: CompilerList[0],
        onSelect: (compiler) => {}
    }

    static propTypes = {
        compiler: PropTypes.string,
        onSelect: PropTypes.func
    }

    constructor(props) {
        super(props);
        this.state = {
            compiler: props.compiler
        };
    }

    onSelect = eventKey => {
        let compiler = CompilerList[eventKey];
        this.setState({ compiler });
        this.props.onSelect(compiler);
    }

    component() {
        return (
            <ProgressBar active now={45} />
        );
    }

    render() {
        const { compiler } = this.state;

        return (
            <OverlayTrigger
                rootClose
                placement='bottom'
                trigger={['hover']}
                overlay={ tooltip('Choose Compiler') }
            >
                <DropdownButton
                    id='compilers'
                    bsStyle='info'
                    bsSize='large'
                    title={ compiler }
                    style={{
                        minWidth: '210px'
                    }}
                    onSelect={ this.onSelect }
                >
                {
                    CompilerList.map((value, index) =>
                        <MenuItem
                            key={ index }
                            eventKey={ index }
                            href={ '#' + value }
                            bsStyle='info'
                            style={{
                                minWidth:  '210px',
                                textAlign: 'center'
                            }}>
                            <h4>{ value }</h4>
                        </MenuItem>
                    )
                }
                </DropdownButton>
            </OverlayTrigger>
        );
    }
}
