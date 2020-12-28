import React from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
// reactstrap components
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Row,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledDropdown,
  UncontrolledTooltip,
} from "reactstrap";

class StrategyCardMini extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();
  }

  getCategoryId(strRules) {
    let rules = JSON.parse(strRules)

    if (Object.keys(rules.advanced).length > 0)
      return "label_cat_advanced"
    else
      return "label_cat_basic"
  }
  onClick(action, strategy) {
    this.props.onClick(action, strategy)

    // Handle immediate actions...
    switch (action) {
      case "save":
        strategy.isSaved = !strategy.isSaved
        this.setState({ strategy })
    }
  }

  // Components
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
          onClick={() => this.props.onClick("run", strategy)}
        >
          <i id="strategy_run" className="nc-icon nc-button-play" />
        </Button>
        <UncontrolledTooltip delay={{ show: 1000 }} placement="bottom" target={"run__" + strategy.id}>
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
  renderGoToProfile(prefs, getString, strategy) {
    return (
      <DropdownItem onClick={() => this.props.onClick("goToProfile", strategy)}>
        {getString(prefs.locale, this.compId, "btn_userProfile")}
      </DropdownItem>
    )
  }
  renderSave(prefs, getString, strategy, context = "any", format = "listItem") {
    if (format === "listItem")
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
            className="btn-icon btn-neutral"
            color={strategy.isSaved ? "success" : "default"}
            id={`${context}__${strategy.id}`}
            type="button"
            onClick={() => this.onClick("save", strategy)}
          >
            <i id="strategy_save" className={strategy.isSaved ? "fas fa-bookmark" : "far fa-bookmark"} />
          </Button>
          <UncontrolledTooltip delay={{ show: 1000 }} placement="top" target={`${context}__${strategy.id}`}>
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
  renderView(prefs, getString, strategy, context = "any", format = "listItem") {
    if (format === "listItem")
      return (
        <DropdownItem
          id="strategy_view"
          onClick={() => this.onClick("view", strategy)}
        >
          {getString(prefs.locale, this.compId, "btn_view")}
        </DropdownItem>
      )
    else if (format === "btn")
      return (
        <>
          <Button
            className="btn-icon btn-round"
            color="warning"
            outline
            size="sm"
            id={`${context}__${strategy.id}`}
            type="button"
            onClick={() => this.onClick("view", strategy)}
          >
            <i id="strategy_view" className="far fa-eye" />
          </Button>
          <UncontrolledTooltip delay={{ show: 1000 }} placement="top" target={`${context}__${strategy.id}`}>
            {getString(prefs.locale, this.compId, "btn_view")}
          </UncontrolledTooltip>
        </>
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

  renderActions(context) {
    if (context === "myStrategies")
      return this.renderMyActions();
    else if (context === "savedStrategies")
      return this.renderSavedActions();

    else if (context === "mostRuns")
      return this.renderGalleryActions();
    else if (context === "mostSaved")
      return this.renderGalleryActions();
  }
  renderMyActions() {
    let { prefs, getString, strategy, context, isLoading } = this.props;

    return (
      <div className="text-right">
        <UncontrolledDropdown>
          {/* Run */}
          {this.renderRun(prefs, getString, strategy, isLoading)}
          {/* ... */}
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
            {/* User Profile */}
            {this.renderGoToProfile(prefs, getString, strategy)}
            <DropdownItem divider />
            {/* Save/Unsave */}
            {this.renderSave(prefs, getString, strategy, context)}
            {/* Share */}
            {this.renderShare(prefs, getString, strategy)}
            <DropdownItem divider />
            {/* Edit */}
            {strategy.isOwner && this.renderEdit(prefs, getString, strategy)}
            {/* Delete */}
            {strategy.isOwner && this.renderDelete(prefs, getString, strategy)}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    )
  }
  renderSavedActions() {
    let { prefs, getString, strategy, context, isLoading } = this.props;

    return (
      <div className="text-right">
        <UncontrolledDropdown>
          {/* Run */}
          {this.renderRun(prefs, getString, strategy, isLoading)}
          {/* ... */}
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
            {/* User Profile */}
            {this.renderGoToProfile(prefs, getString, strategy)}
            <DropdownItem divider />
            {/* Save/Unsave */}
            {this.renderSave(prefs, getString, strategy, context)}
            {/* Share */}
            {this.renderShare(prefs, getString, strategy)}
            <DropdownItem divider />
            {/* View/Edit */}
            {strategy.isOwner ?
              this.renderEdit(prefs, getString, strategy) :
              this.renderView(prefs, getString, strategy)
            }
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    )
  }
  renderGalleryActions() {
    let { prefs, getString, strategy, context, isLoading } = this.props;

    return (
      <div className="text-right">
        <UncontrolledDropdown>
          {/* Run */}
          {this.renderRun(prefs, getString, strategy, isLoading)}
          {/* ... */}
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
            {/* User Profile */}
            {this.renderGoToProfile(prefs, getString, strategy)}
            <DropdownItem divider />
            {/* Save/Unsave */}
            {this.renderSave(prefs, getString, strategy, context)}
            {/* Share */}
            {this.renderShare(prefs, getString, strategy)}
            <DropdownItem divider />
            {/* View/Edit */}
            {strategy.isOwner ?
              this.renderEdit(prefs, getString, strategy) :
              this.renderView(prefs, getString, strategy)
            }
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    )
  }

  render() {
    let { prefs, getString, context, strategy } = this.props;

    return (
      <Card className="card-stats-mini">
        <CardBody>
          {/* Name */}
          <CardTitle draggable>
            <Row>
              <Col className="align-center">
                {strategy.name}
              </Col>
              {context !== "myStrategies" &&
                <Col xs="2" className="centered">
                  {this.renderSave(prefs, getString, strategy, context, "btn")}
                </Col>
              }
            </Row>
          </CardTitle>
          {/* Category */}
          <Row>
            <Col>
              <label>{getString(prefs.locale, this.compId, "label_category")}</label>
            </Col>
            <Col className="text-right">
              <label id={"category__" + strategy.id}>
                {getString(prefs.locale, this.compId, this.getCategoryId(strategy.rules))}
              </label>
            </Col>
            <UncontrolledTooltip delay={{ show: 500 }} placement="top" target={"category__" + strategy.id}>
              {getString(prefs.locale, this.compId, [this.getCategoryId(strategy.rules) + "_hint"])}
            </UncontrolledTooltip>
          </Row>
          {/* Logic */}
          <Row>
            <Col>
              <label>{getString(prefs.locale, this.compId, "label_logic")}</label>
            </Col>
            <Col className="text-right">
              <label id={"logic__" + strategy.id}>
                {strategy.is_dynamic ?
                  getString(prefs.locale, this.compId, "label_dynamic") :
                  getString(prefs.locale, this.compId, "label_static")}
              </label>
            </Col>
            <UncontrolledTooltip delay={{ show: 500 }} placement="top" target={"logic__" + strategy.id}>
              {strategy.is_dynamic ?
                getString(prefs.locale, this.compId, "label_dynamic_hint") :
                getString(prefs.locale, this.compId, "label_static_hint")
              }
            </UncontrolledTooltip>
          </Row>
          {/* Owner */}
          <Row className="justify-content-end">
            <Button
              className="btn-neutral description"
              size="sm"
              onClick={() => this.props.onClick("goToProfile", strategy)}
            >
              @{strategy.owner_username}
            </Button>
          </Row>

          <hr />
          {/* Action buttons */}
          {this.renderActions(context)}

        </CardBody>
        {/* Background Icon */}
        <div className={classnames("bg-icon", strategy.type == "buy" ? "icon-success" : "icon-danger")}>
          {strategy.type == "buy" ?
            <i className="nc-icon nc-spaceship" /> :
            <i className="nc-icon nc-spaceship fa-rotate-90" />
          }
        </div>
      </Card>
    )
  }
}

export default StrategyCardMini;

StrategyCardMini.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,

  strategy: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
}