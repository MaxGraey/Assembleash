import React, { Component } from 'react'
import Toggle from 'react-toggle'

export default class ToggledOption extends Component {
    static defualtProps = {
        active: false,
        defaultActive: false,
        onChange: () => {}
    }

    constructor(props) {
        super(props);
        this.state = {
            active: props.active || props.defaultActive
        };
    }

    onChange = () => {
        const active = !this.state.active;
        this.setState({ active });
        this.props.onChange(active);
    }

    render() {
        const { label } = this.props;
        const active = this.state.active;
        return (
            <div
                style={{
                    textAlign:    'left',
                    display:      'inline-block',
                    paddingLeft:  '15px',
                    paddingRight: '15px',
                    width:        '200px'
                }}>
                <h4><span style={{ paddingRight: '10px', lineHeight: '3rem' }}>{ label }</span>
                    <Toggle
                        aria-labelledby='toggle'
                        checked={ active }
                        onChange={ this.onChange }
                    />
                </h4>
            </div>
        );
    }
}
