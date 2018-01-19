
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Button        from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Glyphicon     from 'react-bootstrap/lib/Glyphicon';

import BusySignal from '../Components/BusySignal';

export default class FooterContainer extends PureComponent {
    static propTypes = {
        downloadDisabled:  PropTypes.bool,
        onDownloadPressed: PropTypes.func,
        errorMessage:      PropTypes.string,
        cursorPosition:    PropTypes.arrayOf(PropTypes.number, PropTypes.number)
    }

    static defaultProps = {
        busyState:         'pending',
        downloadDisabled:  true,
        errorMessage:      null,
        cursorPosition:    [0, 0],
        onDownloadPressed: () => {},
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

        if (busyState === 'pending') {
            statusBarMessage = 'Processing...';
        } else if (busyState === 'success') {
            statusBarMessage = 'Compiled successfully';
        } else if (busyState === 'failure') {
            messageClass = 'busy-failure-color';
            statusBarMessage = `(${ errorCount }) Error${ errorCount > 1 ? 's' : '' }`;
            if (errorMessage) {
                statusBarMessage += ': ' + errorMessage;
            }
        }

        return (
            <ButtonToolbar
                className="navbar-fixed-bottom"
                style={{
                    textAlign: 'center',
                    padding:    0,
                    margin:    '20px 20px 7px 15px'
                }}
            >
                <Button
                    bsSize='large'
                    bsStyle='info'
                    className="pull-right"
                    disabled={ downloadDisabled }
                    onClick={ onDownloadPressed }
                >
                    <span>
                        <Glyphicon
                            glyph="download"
                            style={{ fontSize: "125%", marginTop: '-0.25em', top: '0.25em' }}
                        />
                        Download .wasm
                    </span>
                </Button>

                <div className="pull-right label" style={{ paddingRight: '2em', paddingTop: '3pt' }}>
                    <h4>{ size }
                        <span style={{ color: '#bbb', fontWeight: 100 }}>
                            { ' ' + unit }
                        </span>
                    </h4>
                </div>

                <label
                    className="pull-left"
                    style={{
                        marginTop:  '3pt',
                        marginLeft: '-2pt',
                        minWidth:   '51pt',
                    }}
                >
                    <h4 style={{
                        fontSize: '1.8rem',
                        fontWeight: 100,
                        color: '#aaa'
                    }}>
                        { cursorPosition[0] + ':' + cursorPosition[1] }
                    </h4>
                </label>

                <div className="pull-left" style={{ marginLeft: '-12pt' }}>
                    <BusySignal
                        className="pull-left"
                        state={ busyState }
                    />

                    <label
                        style={{
                            marginLeft: '30pt',
                            float:      'left',
                            paddingTop: '3pt'
                        }}
                    >
                        <h4
                            className={ messageClass }
                            style={{
                                fontWeight: 100,
                                textShadow: '0 0 1px rgba(0,0,0,0.6)'
                            }}
                        >
                          { statusBarMessage }
                        </h4>
                    </label>
                </div>
            </ButtonToolbar>
        );
    }
}
