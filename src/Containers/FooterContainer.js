
import React, { Component } from "react"
import PropTypes from 'prop-types'
import {
    Button,
    Glyphicon,
    ButtonToolbar
} from 'react-bootstrap';

import BusySignal from '../Components/BusySignal';

export default class FooterContainer extends Component {
    static propTypes = {
        downloadDisabled:  PropTypes.bool,
        onDownloadPressed: PropTypes.func,
        errorMessage:      PropTypes.string,
        cursorPosition:    PropTypes.arrayOf(PropTypes.number, PropTypes.number)
    }

    static defaultProps = {
        busyState: 'busy',
        downloadDisabled: true,
        errorMessage: null,
        cursorPosition: [0, 0],
        onDownloadPressed: () => {}
    }

    render() {
        const {
            binarySize,
            onDownloadPressed,
            downloadDisabled,
            busyState,
            cursorPosition,
            errorCount,
            errorMessage
        } = this.props;

        const sizeUnits = binarySize.split(' ');
        const size = sizeUnits[0] ? sizeUnits[0] : '';
        const unit = sizeUnits[1] ? sizeUnits[1] : '';

        let statusBarMessage = '';
        let messageClass = 'busy-success-color';

        if (busyState === 'busy') {
            statusBarMessage = 'Processing...';
        } else if (busyState === 'success') {
            statusBarMessage = 'Compiled successfully';
        } else if (busyState === 'failure') {
            messageClass = 'busy-failure-color';
            statusBarMessage = `(${errorCount}) Error${errorCount > 1 ? 's' : ''}`;
            if (errorMessage) {
                statusBarMessage += ': ' + errorMessage;
            }
        }

        return (
            <ButtonToolbar className="navbar-fixed-bottom" style={{ textAlign: 'center', padding: 0, margin: '20px 20px 7px 15px' }}>
                <Button bsSize='large' bsStyle='info' className="pull-right" disabled={ downloadDisabled } onClick={ onDownloadPressed }>
                    <span><Glyphicon glyph="download" style={{ fontSize: "125%", marginTop: '-0.5rem', top: '0.5rem' }}/>Download .wasm</span>
                </Button>
                <div className="pull-right label">
                    <h4>{ size }
                        <span style={{ color: '#bbb', paddingRight: '1em', fontWeight: 100 }}>{ ' ' + unit }</span>
                    </h4>
                </div>
                <label className="pull-left" style={{ paddingTop: '2pt', paddingLeft: '10pt' }}>
                    <h4 style={{ fontWeight: 100, color: '#bbb' }}>{ cursorPosition[0] + ':' + cursorPosition[1] }</h4>
                </label>
                <BusySignal className="pull-left" state={ busyState }/>
                <label style={{
                    marginLeft: '30pt',
                    float:      'left',
                    paddingTop: '3pt'
                }}>
                    <h4
                        className={ messageClass }
                        style={{
                            fontWeight: 100,
                            textShadow: '0 0 1px rgba(0,0,0,0.6)'
                        }}
                    >{ statusBarMessage }</h4>
                </label>
            </ButtonToolbar>
        );
    }
}
