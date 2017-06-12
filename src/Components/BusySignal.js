import React, { Component } from "react"
import PropTypes from 'prop-types'

import {
    Glyphicon
} from 'react-bootstrap';

export default class BusySignal extends Component {
    static propTypes = {
        state: PropTypes.oneOf(['busy', 'success', 'failure'])
    }

    static defaultProps = {
        state: 'busy'
    }

	constructor(props) {
		super(props);
	}

    _renderSpinner() {
        const state = this.props.state;
        return state === 'busy' ? (
            <div className="busy-signal-spinner busy-success-color">
                <div className="busy-signal-mask">
                    <div className="busy-signal-maskedCircle"></div>
                </div>
            </div>
        ) : null;
    }

    _renderDot() {
        const state = this.props.state;
        return state === 'busy' ? (
            <div className="busy-signal-symbol busy-success-color">•</div>
        ) : null;
    }

    _renderReadyState() {
        const state = this.props.state;

        if (state === 'success') {
            return <Glyphicon glyph="ok" className="busy-success-color"/>;
        } else if (state === 'failure') {
            return <Glyphicon glyph="remove" className="busy-filure-color"/>;
        }

        return null;
    }

	render() {
        const state = this.props.state;
        return (
            <div className="busy-signal">
                { this._renderSpinner() }
                { this._renderDot() }
                { this._renderReadyState() }
            </div>
        );
	}
}
