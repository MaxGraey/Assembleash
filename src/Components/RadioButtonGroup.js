import React, {
  PureComponent
} from 'react'

import { ButtonGroup } from 'react-bootstrap'
import PropTypes from 'prop-types'

export default class RadioButtonGroup extends PureComponent {

  static propTypes = {
    children:  PropTypes.node,
    type:      PropTypes.oneOf(['checkbox', 'radio']),
    value:     PropTypes.object,
    onChange:  PropTypes.func,
    valueLink: PropTypes.shape({
      value:         PropTypes.any,
      requestChange: PropTypes.func.isRequired
    })
  }

  static defaultProps = {
    value:     {},
    valueLink: null,
    onChange:  () => {},
  }

  binding(props) {
    const { onChange, value } = props;
    return props.valueLink || {
      requestChange: onChange,
      value,
    };
  }

  onClick(child) {
    const { value, requestChange } = this.binding(this.props);

    let keys = React.Children.map(this.props.children, child => child.props.eventKey),
        key  = child.props.eventKey;

    if (this.props.type === 'radio') {
      keys.forEach(k => { value[k] = k === key });
    } else {
      keys.forEach(k => {
        value[k] = (k === key) ? !value[k] : value[k]
      });
    }
    requestChange(value);
  }

  renderChildren() {
    const value = this.binding(this.props).value || {};
    return React.Children.map(this.props.children, child => {
      const active = value[child.props.eventKey] || false;
      return React.cloneElement(child, {
        onClick: () => this.onClick(child),
        active
      })
    })
  }

  render() {
    const { className, bsSize } = this.props;
    return (
      <ButtonGroup className={ className } bsSize={ bsSize }>
        { this.renderChildren()}
      </ButtonGroup>
    );
  }
}
