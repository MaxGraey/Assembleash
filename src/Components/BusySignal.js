import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';

export default class BusySignal extends Component {

  static propTypes = {
    state: PropTypes.oneOf(['pending', 'success', 'failure'])
  }

  static defaultProps = {
    state: 'pending'
  }

  _renderSpinner() {
    const state = this.props.state;
    return (
      state === 'pending' ?
        <div className='busy-signal-spinner busy-success-color'>
          <div className='busy-signal-mask'>
            <div className='busy-signal-maskedCircle' />
          </div>
        </div> : null
    );
  }

  _renderDot() {
    return (
      this.props.state === 'pending' ?
        <div className='busy-signal-symbol busy-success-color'>•</div>
        : null
    );
  }

  _renderReadyState() {
    const state   = this.props.state;
    const success = state === 'success';
    if (success || state === 'failure')
      return (
        <Glyphicon
          glyph={ success ? 'ok' : 'remove' }
          className={ `busy-${ state }-color` }
        />
      );

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
