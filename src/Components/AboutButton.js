import React, { Component } from 'react'
import {
    Button,
    Popover,
    OverlayTrigger,
    Glyphicon,
    Badge
} from 'react-bootstrap';

import FeatureProperty from './FeatureProperty'
import { CompilerDescriptions } from '../Common/Common'


export default class AboutButton extends Component {
    static defaultProps = {
        compiler: 'TurboScript',
        version: '0.0.0'
    }

    getPopover() {
        const { compiler, version } = this.props;
        const title = (
            <span>
                <h5>About</h5>
                <h4><strong>{ `${compiler} `}</strong></h4>
                <Badge><strong>{ `${version}` }</strong></Badge>
            </span>
        );

        const description = CompilerDescriptions[compiler];
        const github = description ? description.github : '';

        return (
        	<Popover
                id="popover-about"
                title={ title }
                style={{ minWidth: '280px' }}
            >
        		<div className="label" style={{ padding: 0 }}>
                    <a href={ github } target="_blank" rel="noopener noreferrer">
                        <h5>Project on Github</h5>
                    </a>
                </div>
        	</Popover>
        );
    }

    render() {
        return (
            <OverlayTrigger
                rootClose
                placement="bottom"
                trigger="click"
                overlay={ this.getPopover() }
            >
                <Button bsSize='large' bsStyle='info'>
                    <Glyphicon
                        glyph="info-sign"
                        style={{ fontSize: "114%", marginTop: '-0.2em', top: '0.2em' }}
                    />
                </Button>
            </OverlayTrigger>
        );
    }
}
