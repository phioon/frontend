import React from "react";
import PropTypes from "prop-types";

import { Tooltip } from "reactstrap";

import { sleep } from "../../core/utils";

class FixedButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,

      isTooltipOpen: false,
    }

    this.isBlinkingAllowed = true;
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
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
        this.toggleTooltip()
        await sleep(400)

        if (count < limit)
          this.toggleTooltip()
        count += 1
      }
      await sleep(4000)
      this.toggleTooltip()
    }
  }
  toggleTooltip() {
    if (this.isBlinkingAllowed)
      this.setState({ isTooltipOpen: !this.state.isTooltipOpen })
  }

  render() {
    let { getString, position } = this.props;
    let { langId, isTooltipOpen } = this.state;

    return (
      <div className={"fixed-plugin " + position}>
        <div id={this.props.id ? this.props.id : ""} onClick={this.props.onClick}>
          <i className={"icon " + this.props.icon} />
        </div>
        {
          this.props.id ?
            <Tooltip isOpen={isTooltipOpen} placement="left" target={this.props.id} toggle={() => this.toggleTooltip()}>
              {getString(langId, "fixedplugin", this.props.id + "_hint")}
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
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string.isRequired
}