import React, { Component } from "react"
/*import {
    Button
} from 'react-bootstrap';*/

//import SwitchButton from 'react-switch-button'
import Toggle from 'react-toggle'

export default class ToggledOption extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: props.defaultActive || false
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
        return (
            // <label style={{ display: 'block', paddingLeft: '15px' }}>
            //     <h4>{ label }</h4>
            //     <Toggle
            //         id="toggle"
            //         defaultChecked={ defaultActive }
            //         onChange={ this.handleChange }
            //     />
            // </label>
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
                        defaultChecked={ defaultActive }
                        onChange={ this.handleChange }
                    />
                </h4>
            </label>
        );
    }
}
