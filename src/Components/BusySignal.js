import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Glyphicon } from 'react-bootstrap';

export default class BusySignal extends Component {
    static propTypes = {
        state: PropTypes.oneOf(['busy', 'success', 'failure'])
    }

    static defaultProps = {
        state: 'busy'
    }

    _renderSpinner() {
        const state = this.props.state;
        return state === 'busy' ? (
            <div className='busy-signal-spinner busy-success-color'>
                <div className='busy-signal-mask'>
                    <div className='busy-signal-maskedCircle'></div>
                </div>
            </div>
        ) : null;
    }

    _renderDot() {
        const state = this.props.state;
        return state === 'busy' ? (
            <div className='busy-signal-symbol busy-success-color'>•</div>
        ) : null;
    }

    _renderReadyState() {
        const state   = this.props.state;
        const success = state === 'success';
        const failure = state === 'failure';

        if (success || failure) {
            return (
                <Glyphicon
                    glyph={ success ? 'ok' : 'remove' }
                    className={ `busy-${state}-color` }
                />
            );
        }

        return null;
    }

	render() {
        const className = this.props.className + " busy-signal";
        return (
            <div className={ className }>
                { this._renderSpinner() }
                { this._renderDot() }
                { this._renderReadyState() }
            </div>
        );
	}
}
