import React, { Component } from "react"
/*import {
    Button
} from 'react-bootstrap';*/

//import SwitchButton from 'react-switch-button'
import Toggle from 'react-toggle'

export default class ToggledOption extends Component {
    static defualtProps = {
        active: false,
        defaultActive: false
    }

    constructor(props) {
        super(props);
        this.state = {
            active: props.active || props.defaultActive
        };
    }

    handleChange = () => {
        let newValue = !this.state.active;
        this.setState({
            active: newValue
        });

        if (this.props.onChange) {
            this.props.onChange(newValue);
        }
    }

    render() {
        const { label, defaultActive } = this.props;
        const { active } = this.state;
        return (
            <label
                className="label"
                style={{
                    textAlign: 'left',
                    display: 'inline-block',
                    paddingLeft: '15px',
                    paddingRight: '15px',
                    width: '200px'
                }}>
                <h4><span style={{ paddingRight: '10px', lineHeight: '3rem' }}>{ label }</span>
                    <Toggle
                        aria-labelledby="toggle"
                        checked={ active }
                        defaultChecked={ defaultActive }
                        onChange={ this.handleChange }
                    />
                </h4>
            </label>
        );
    }
}
