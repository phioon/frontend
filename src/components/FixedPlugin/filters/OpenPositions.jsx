import React, { Component } from "react";
import PropTypes from "prop-types";

import { Col, Row, Tooltip } from "reactstrap";

// Filters
import WalletFilter from "../../cards/filters/WalletFilter";
import AssetFilter from "../../cards/filters/AssetFilter";
import OpeningIntervalFilter from "../../cards/filters/OpeningIntervalFilter";

import { sleep } from "../../../core/utils";

class FixedFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isOpen: props.isOpen,

      isTooltipOpen: false,

      dimensions: props.dimensions,
    };

    this.isBlinkingAllowed = true;
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    if (props.isOpen !== state.isOpen)
      return {
        isOpen: props.isOpen,
        dimensions: props.dimensions,
      }
    if (props.dimensions !== state.dimensions)
      return { dimensions: props.dimensions }

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

      await sleep(10000)

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

  renderTagFilters(props) {
    let { tag, key, disabled, onRemove, classNameRemove, getTagDisplayValue, ...other } = props
    return (
      <span key={key} {...other}>
        {getTagDisplayValue(tag)}
        {<a className={classNameRemove} onClick={(e) => onRemove(key)} />}
      </span>
    )
  }

  render() {
    let { getString, modalId, position } = this.props;
    let {
      langId,
      compId,
      isOpen,

      isTooltipOpen,

      dimensions,
    } = this.state;

    return (
      <div className={"fixed-plugin " + position}>
        <div className={isOpen ? "dropdown show" : "dropdown"}>
          <div id={this.props.id ? this.props.id : ""} onClick={() => this.props.toggleModal(modalId)}>
            <i className={"icon " + this.props.icon} />
          </div>
          <div className="dropdown-menu horizontal show">
            <li className="header-title">{getString(langId, compId, "label_title")}</li>
            <Row>
              {/* Time Interval */}
              <Col className="col-md-3 ml-auto mr-auto">
                <OpeningIntervalFilter
                  getString={getString}
                  prefs={this.props.prefs}
                  onSelectionChange={this.props.onSelectionChange}
                  renderTagFilters={this.renderTagFilters}
                  dimension={dimensions.dates}
                />
              </Col>
              {/* Wallet */}
              <Col className="col-md-3 ml-auto mr-auto">
                <WalletFilter
                  getString={getString}
                  prefs={this.props.prefs}
                  onSelectionChange={this.props.onSelectionChange}
                  renderTagFilters={this.renderTagFilters}
                  dimension={dimensions.wallets}
                />
              </Col>
              {/* Asset */}
              <Col className="col-md-3 ml-auto mr-auto">
                <AssetFilter
                  getString={getString}
                  prefs={this.props.prefs}
                  onSelectionChange={this.props.onSelectionChange}
                  renderTagFilters={this.renderTagFilters}
                  dimension={dimensions.assets}
                />
              </Col>
            </Row>
          </div>
        </div>
        {
          this.props.id ?
            <Tooltip isOpen={isTooltipOpen} placement="left" target={this.props.id} toggle={() => this.toggleTooltip()}>
              {getString(langId, "fixedplugin", this.props.id + "_hint")}
            </Tooltip> :
            null
        }
      </div >
    );
  }
}

export default FixedFilter;

FixedFilter.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
  dimensions: PropTypes.object.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
}