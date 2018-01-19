import React, { Component } from 'react';
import Toggle from 'react-toggle';

export default class ToggledOption extends Component {
    static defualtProps = {
        active:        false,
        defaultActive: false,
        onChange:      () => {},
    }

    constructor(props) {
        super(props);
        this.state = {
            active: props.active || props.defaultActive
        };
    }

    onChange = () => {
        this.setState(({ active }) => ({ active: !active }));
        // We can call onChange in parallel manner without wait of state changes
        this.props.onChange(!this.state.active);
    }

    render() {
        const { label } = this.props;
        return (
          <div
            style={{
                textAlign:    'left',
                display:      'inline-block',
                paddingLeft:  '15pt',
                paddingRight: '15pt',
                width:        '190pt',
            }}
          >
            <h4>
              <span style={{
                paddingRight: '10pt',
                lineHeight:   '3rem',
              }}>
                { label }
              </span>

              <Toggle
                aria-labelledby='toggle'
                checked={ this.state.active }
                onChange={ this.onChange }
              />
            </h4>
          </div>
        );
    }
}
