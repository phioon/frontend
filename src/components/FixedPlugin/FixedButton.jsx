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
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    if (props.prefs.showTooltip !== state.showTooltip)
      return { showTooltip: props.prefs.showTooltip }
    return null
  }
  componentDidMount() {
    this.startTooptip()
  }

  async startTooptip() {
    let { showTooltip } = this.props

    if (showTooltip) {
      let count = 1
      while (count <= 2) {
        this.toggleTooltip()
        await sleep(2000)
        this.toggleTooltip()
        count += 1
      }
    }
  }

  toggleTooltip() {
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