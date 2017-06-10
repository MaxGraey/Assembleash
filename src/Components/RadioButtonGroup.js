import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
    ButtonGroup
} from 'react-bootstrap'

export default class RadioButtonGroup extends Component {
	static propTypes = {
		children:  PropTypes.node,
		type:      PropTypes.oneOf(['checkbox', 'radio']),
		value:     PropTypes.object,
		onChange:  PropTypes.func,
		valueLink: PropTypes.shape({
            value: PropTypes.any,
            requestChange: PropTypes.func.isRequired
        })
	}

	static defaultProps = {
		value:     {},
		valueLink: null,
		onChange:  () => {}
	}

	binding(props) {
		let { onChange, value } = props;
		return props.valueLink || {
            requestChange: onChange,
			value: value
		}
	}

	onClick(child) {
		let { value, requestChange } = this.binding(this.props);

		let keys = this.childKeys(),
		    key  = child.props.eventKey;

		if (this.props.type === 'radio') {
			keys.forEach(k => {
                value[k] = k === key;
            });
		} else {
			keys.forEach(k => {
                value[k] = (k === key) ? !value[k] : value[k]
            });
		}
		requestChange(value);
	}

	childKeys() {
		let keys = [];
		React.Children.forEach(this.props.children, child => {
			keys.push(child.props.eventKey);
		});
		return keys;
	}

	renderChildren() {
		return React.Children.map(this.props.children, child => {
			let value  = this.binding(this.props).value || {};
			let active = value[child.props.eventKey] || false;

			return React.cloneElement(child, {
				onClick: () => this.onClick(child),
                active
			})
		})
	}

	render() {
		return (
            <ButtonGroup
                className={ this.props.className }
                bsSize={ this.props.bsSize }
            >
			    { this.renderChildren() }
            </ButtonGroup>
        );
	}
}
