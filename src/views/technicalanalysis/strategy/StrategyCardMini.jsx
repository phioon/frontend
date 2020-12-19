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
  UncontrolledTooltip
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
    else if (Object.keys(rules.basic_1).length > 0)
      return "label_cat_transition"
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

  renderActions(context) {
    if (context === "myStrategies")
      return this.renderMyActions();
    else if (context === "savedStrategies")
      return this.renderSavedActions();
    else if (context === "gallery")
      return this.renderGalleryActions();
  }
  renderMyActions() {
    let { prefs, getString, strategy, isLoading } = this.props;

    return (
      <div className="text-right">
        {/* Run */}
        <Button
          className="btn-icon btn-neutral"
          color="success"
          id={"run__" + strategy.id}
          size="sm"
          type="button"
          disabled={isLoading}
          onClick={() => this.props.onClick("run", strategy)}
        >
          <i id="strategy_run" className="nc-icon nc-button-play" />
        </Button>
        <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"run__" + strategy.id}>
          {getString(prefs.locale, this.compId, "btn_run_hint")}
        </UncontrolledTooltip>
        {/* Edit */}
        {strategy.isOwner &&
          <>
            <Button
              className="btn-icon btn-neutral"
              color="warning"
              id={"update__" + strategy.id}
              size="sm"
              type="button"
              onClick={() => this.props.onClick("update", strategy)}
            >
              <i id="strategy_update" className="far fa-edit" />
            </Button>
            <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"update__" + strategy.id}>
              {getString(prefs.locale, this.compId, "btn_update_hint")}
            </UncontrolledTooltip>
          </>
        }
        {/* Delete */}
        {strategy.isOwner &&
          <>
            <Button
              className="btn-icon btn-neutral remove"
              color="danger"
              id={"delete__" + strategy.id}
              size="sm"
              type="button"
              onClick={() => this.props.onClick("delete", strategy)}
            >
              <i id="strategy_delete" className="fa fa-times" />
            </Button>
            <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"delete__" + strategy.id}>
              {getString(prefs.locale, this.compId, "btn_delete_hint")}
            </UncontrolledTooltip>
          </>
        }
      </div>
    )
  }
  renderSavedActions() {
    let { prefs, getString, strategy, isLoading } = this.props;

    return (
      <div className="text-right">
        {/* Run */}
        <Button
          className="btn-icon btn-neutral"
          color="success"
          id={"run__" + strategy.id}
          size="sm"
          type="button"
          disabled={isLoading}
          onClick={() => this.onClick("run", strategy)}
        >
          <i id="strategy_run" className="nc-icon nc-button-play" />
        </Button>
        <UncontrolledTooltip delay={{ show: 500 }} placement="bottom" target={"run__" + strategy.id}>
          {getString(prefs.locale, this.compId, "btn_run_hint")}
        </UncontrolledTooltip>
        {strategy.isOwner ?
          <>
            {/* Edit */}
            <Button
              className="btn-icon btn-neutral"
              color="warning"
              id={"update__" + strategy.id}
              size="sm"
              type="button"
              onClick={() => this.props.onClick("update", strategy)}
            >
              <i id="strategy_update" className="far fa-edit" />
            </Button>
            <UncontrolledTooltip delay={{ show: 500 }} placement="bottom" target={"update__" + strategy.id}>
              {getString(prefs.locale, this.compId, "btn_update_hint")}
            </UncontrolledTooltip>
          </> :
          <>
            {/* View */}
            <Button
              className="btn-icon btn-neutral"
              color="warning"
              id={"view__" + strategy.id}
              size="sm"
              type="button"
              onClick={() => this.onClick("view", strategy)}
            >
              <i id="strategy_view" className="far fa-eye" />
            </Button>
            <UncontrolledTooltip delay={{ show: 500 }} placement="bottom" target={"view__" + strategy.id}>
              {getString(prefs.locale, this.compId, "btn_view_hint")}
            </UncontrolledTooltip>
          </>
        }
        {/* Save */}
        <Button
          className="btn-icon btn-neutral"
          color="info"
          id={"save__" + strategy.id}
          size="sm"
          type="button"
          onClick={() => this.onClick("save", strategy)}
        >
          <i id="strategy_save" className={strategy.isSaved ? "fas fa-bookmark" : "far fa-bookmark"} />
        </Button>
        <UncontrolledTooltip delay={{ show: 500 }} placement="bottom" target={"save__" + strategy.id}>
          {strategy.isSaved ?
            getString(prefs.locale, this.compId, "btn_unsave_hint") :
            getString(prefs.locale, this.compId, "btn_save_hint")
          }
        </UncontrolledTooltip>
      </div>
    )
  }
  renderGalleryActions() {
    let { prefs, getString, strategy } = this.props;

    return (
      <div className="text-right">
        {/* View */}
        <Button
          className="btn-icon btn-neutral"
          color="warning"
          id={"view__" + strategy.id}
          size="sm"
          type="button"
          onClick={() => this.onClick("view", strategy)}
        >
          <i id="strategy_view" className="far fa-eye" />
        </Button>
        <UncontrolledTooltip delay={{ show: 500 }} placement="bottom" target={"view__" + strategy.id}>
          {getString(prefs.locale, this.compId, "btn_view_hint")}
        </UncontrolledTooltip>
        {/* Save */}
        <Button
          className="btn-icon btn-neutral"
          color="info"
          id={"save__" + strategy.id}
          size="sm"
          type="button"
          onClick={() => this.onClick("save", strategy)}
        >
          <i id="strategy_save" className={strategy.isSaved ? "fas fa-bookmark" : "far fa-bookmark"} />
        </Button>
        <UncontrolledTooltip delay={{ show: 500 }} placement="bottom" target={"save__" + strategy.id}>
          {strategy.isSaved ?
            getString(prefs.locale, this.compId, "btn_unsave_hint") :
            getString(prefs.locale, this.compId, "btn_save_hint")
          }
        </UncontrolledTooltip>
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
            {strategy.name}
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
            <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"category__" + strategy.id}>
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
            <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"logic__" + strategy.id}>
              {strategy.is_dynamic ?
                getString(prefs.locale, this.compId, "label_dynamic_hint") :
                getString(prefs.locale, this.compId, "label_static_hint")
              }
            </UncontrolledTooltip>
          </Row>
          {/* Owner */}
          <div className="text-right">
            <label>@{strategy.owner_username}</label>
          </div>

          {/* <Row className="mt-3" /> */}
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