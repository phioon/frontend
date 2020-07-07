import React from "react";
import PropTypes from "prop-types";

import { UncontrolledTooltip } from "reactstrap";

class FixedButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }

  render() {
    let { getString, position } = this.props;
    let { langId, compId } = this.state;

    return (
      <div className={"fixed-plugin " + position}>
        <div id={this.props.id ? this.props.id : ""} onClick={this.props.onClick}>
          <i className={"icon " + this.props.icon} />
        </div>
        {
          this.props.id ?
            <UncontrolledTooltip delay={0} placement="left" target={this.props.id}>
              {getString(langId, "fixedplugin", this.props.id + "_hint")}
            </UncontrolledTooltip> :
            null
        }
      </div>
    );
  }
}

export default FixedButton;

FixedButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string.isRequired
}