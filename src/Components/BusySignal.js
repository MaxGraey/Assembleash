import React, { Component } from "react"
import PropTypes from 'prop-types'

export default class BusySignal extends Component {
    static defaultProps = {
        busy: false
    }

	constructor(props) {
		super(props);
	}

	render() {
		//const classes = `busy-signal ${this.props.busy ? 'busy-signal-busy' : 'busy-signal-idle'}`;
        return (
            <div className="busy-signal">
                <div className="busy-signal-spinner">
                    <div className="busy-signal-mask">
                        <div className="busy-signal-maskedCircle"></div>
                    </div>
                </div>
                <div className="busy-signal-symbol">•</div>
            </div>
        );
	}
}
