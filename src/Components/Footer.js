
import React, { Component } from "react"
import PropTypes from 'prop-types'
import {
    Button,
    Glyphicon,
    ButtonToolbar
} from 'react-bootstrap';

import BusySignal from './BusySignal';

export default class Footer extends Component {
    static propTypes = {
        downloadDisabled:  PropTypes.bool,
        onDownloadPressed: PropTypes.func
    }

    static defaultProps = {
        busyState: 'busy',
        downloadDisabled: true,
        onDownloadPressed: () => {}
    }

    render() {
        const {
            binarySize,
            onDownloadPressed,
            downloadDisabled,
            busyState
        } = this.props;

        const sizeUnits = binarySize.split(' ');

        if (!sizeUnits[0]) sizeUnits[0] = '';
        if (!sizeUnits[1]) sizeUnits[1] = '';

        return (
            <ButtonToolbar className="navbar-fixed-bottom" style={{ padding: '0', margin: '20px 20px 7px 15px' }}>
                <Button bsSize='large' bsStyle='info' className="pull-right" disabled={ downloadDisabled } onClick={ onDownloadPressed }>
                    <span><Glyphicon glyph="download" style={{ fontSize: "125%", marginTop: '-0.5rem', top: '0.5rem' }}/>Download .wasm</span>
                </Button>
                <div className="pull-right label">
                    <h4>{ sizeUnits[0] }
                        <span style={{ color: '#bbb', paddingRight: '2rem', fontWeight: 100 }}>{ ' ' + sizeUnits[1] }</span>
                    </h4>
                </div>
                <BusySignal state={ busyState }/>
            </ButtonToolbar>
        );
    }
}
