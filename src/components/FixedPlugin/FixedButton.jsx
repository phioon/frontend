import React from "react";
import PropTypes from "prop-types";

import { Tooltip } from "reactstrap";

import { sleep } from "../../core/utils";

class FixedButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTooltipOpen: false,
    }

    this.isBlinkingAllowed = true;
  }
  componentDidUpdate(prevProps) {
    if (this.props.showTooltip !== prevProps.showTooltip)
      this.blinkTooltip()
  }
  componentWillUnmount() {
    this.isBlinkingAllowed = false
  }

  async blinkTooltip() {
    let { showTooltip } = this.props

    if (showTooltip) {
      let count = 1
      let limit = 3

      await sleep(1500)

      while (count <= limit) {
        this.setTooltipState(true)
        await sleep(400)

        if (count < limit)
          this.setTooltipState(false)
        count += 1
      }
      await sleep(4000)
      this.setTooltipState(false)
    }
  }
  setTooltipState(isOpen) {
    if (this.isBlinkingAllowed)
      this.setState({ isTooltipOpen: isOpen })
  }
  toggleTooltip() {
    this.setState({ isTooltipOpen: !this.state.isTooltipOpen })
  }

  render() {
    let { getString, prefs, position } = this.props;
    let { isTooltipOpen } = this.state;

    return (
      <div className={"fixed-plugin " + position}>
        <div id={this.props.id ? this.props.id : ""} onClick={this.props.onClick}>
          <i className={"icon " + this.props.icon} />
        </div>
        {
          this.props.id ?
            <Tooltip isOpen={isTooltipOpen} placement="left" target={this.props.id} toggle={() => this.toggleTooltip()}>
              {getString(prefs.locale, "fixedplugin", this.props.id + "_hint")}
            </Tooltip>
            :
            null
        }
      </div>
    );
  }
}

export default FixedButton;

FixedButton.propTypes = {
  prefs: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string.isRequired
}