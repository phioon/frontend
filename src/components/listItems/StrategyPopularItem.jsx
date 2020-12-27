import React from "react";
import {
  Button,
  Row,
  Col,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledDropdown,
  UncontrolledTooltip,
} from "reactstrap";
import { integerWithThousandsSeparator } from "../../core/utils";

class StrategyPopularItem extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      onHover: undefined,
      isLoading: undefined,
    };
  }

  onClick(action, strategy) {
    this.props.onClick(action, strategy)

    // Handle immediate actions...
    switch (action) {
      case "run":
        this.setState({ isLoading: true })
        break;
      case "save":
        strategy.isSaved = !strategy.isSaved
        this.setState({ strategy })
        break;
    }
  }

  renderRun(prefs, getString, strategy, isLoading) {
    return (
      <>
        <Button
          className="btn-icon btn-round"
          size="sm"
          color="info"
          outline
          id={"run__" + strategy.id}
          type="button"
          disabled={isLoading}
          onClick={() => this.onClick("run", strategy)}
        >
          <i id="strategy_run" className="nc-icon nc-button-play" />
        </Button>
        <UncontrolledTooltip delay={{ show: 1000 }} placement="top" target={"run__" + strategy.id}>
          {getString(prefs.locale, this.compId, "btn_run_hint")}
        </UncontrolledTooltip>
      </>
    )
  }
  renderGoToStats(prefs, getString, strategy) {
    return (
      <DropdownItem>
        {getString(prefs.locale, this.compId, "btn_stats")}
      </DropdownItem>
    )
  }
  renderSave(prefs, getString, strategy, format = "item") {
    if (format === "item")
      return (
        <DropdownItem
          id="strategy_save"
          onClick={() => this.onClick("save", strategy)}
        >
          {strategy.isSaved ?
            getString(prefs.locale, this.compId, "btn_unsave") :
            getString(prefs.locale, this.compId, "btn_save")
          }
        </DropdownItem>
      )
    else if (format === "btn")
      return (
        <>
          <Button
            id={`save__${strategy.id}`}
            className="btn-icon btn-neutral"
            color={strategy.isSaved ? "success" : "default"}
            onClick={() => this.onClick("save", strategy)}
          >
            <i id="strategy_save" className={strategy.isSaved ? "fas fa-bookmark" : "far fa-bookmark"} />
          </Button>
          <UncontrolledTooltip delay={{ show: 1000 }} placement="top" target={`save__${strategy.id}`}>
            {strategy.isSaved ?
              getString(prefs.locale, this.compId, "btn_unsave_hint") :
              getString(prefs.locale, this.compId, "btn_save_hint")
            }
          </UncontrolledTooltip>
        </>
      )
  }
  renderShare(prefs, getString, strategy) {
    return (
      <DropdownItem
        id="strategy_share"
        onClick={() => this.onClick("share", strategy)}
      >
        {getString(prefs.locale, this.compId, "btn_share")}
      </DropdownItem>
    )
  }
  renderView(prefs, getString, strategy) {
    return (
      <DropdownItem
        id="strategy_view"
        onClick={() => this.onClick("view", strategy)}
      >
        {getString(prefs.locale, this.compId, "btn_view")}
      </DropdownItem>
    )
  }
  renderEdit(prefs, getString, strategy) {
    return (
      <DropdownItem
        id="strategy_update"
        onClick={() => this.props.onClick("update", strategy)}
      >
        {getString(prefs.locale, this.compId, "btn_update")}
      </DropdownItem>
    )
  }
  renderDelete(prefs, getString, strategy) {
    return (
      <DropdownItem
        id="strategy_delete"
        onClick={() => this.props.onClick("delete", strategy)}
      >
        {getString(prefs.locale, this.compId, "btn_delete")}
      </DropdownItem>
    )
  }

  renderActions(prefs, getString, strategy) {
    return (
      <UncontrolledDropdown>
        <DropdownToggle
          className="btn-sm btn-icon btn-round btn-simple"
          data-toggle="dropdown"
          type="button"
        >
          <i className="fas fa-ellipsis-h" />
        </DropdownToggle>
        <DropdownMenu right>
          {/* Stats */}
          {this.renderGoToStats(prefs, getString, strategy)}
          <DropdownItem divider />
          {/* Save/Unsave */}
          {this.renderSave(prefs, getString, strategy)}
          {/* Share */}
          {this.renderShare(prefs, getString, strategy)}
          <DropdownItem divider />
          {/* View/Edit */}
          {strategy.isOwner ?
            this.renderEdit(prefs, getString, strategy) :
            this.renderView(prefs, getString, strategy)
          }
          {/* Delete */}
          {strategy.isOwner && this.renderDelete(prefs, getString, strategy)}
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }

  render() {
    let { getString, prefs, strategy } = this.props;
    let { onHover, isLoading } = this.state;

    return (
      <Row
        className="align-center"
        onMouseOver={() => this.setState({ onHover: true })}
        onMouseLeave={() => this.setState({ onHover: false })}
      >
        <Col xs="1" className="centered">
          {onHover ?
            this.renderRun(prefs, getString, strategy, isLoading) :
            <label>{strategy.index}</label>
          }
        </Col>
        <Col xs="1" className="centered">
          {this.renderSave(prefs, getString, strategy, "btn")}
        </Col>

        <Col xs="6">
          {strategy.name}
        </Col>

        <Col xs="1" centered="centered">
          {onHover && this.renderActions(prefs, getString, strategy)}
        </Col>

        <Col sm="3" xs="2" className="text-right">
          <label>
            {integerWithThousandsSeparator(strategy.total_runs, ",")}
          </label>
        </Col>
      </Row>
    )
  }
}

export default StrategyPopularItem;