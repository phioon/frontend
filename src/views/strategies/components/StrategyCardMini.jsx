import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
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

    this.onClick = this.onClick.bind(this);
  }

  getCategoryId(rules) {
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
    let { prefs, getString, strategy, context, isRunning } = this.props;

    return (
      <div className="text-right">
        <UncontrolledDropdown>
          {/* Run */}
          {this.props.managers.strategy.runBtn(prefs, getString, this.onClick, strategy, isRunning)}
          {/* ... */}
          <DropdownToggle
            className="btn-sm btn-icon btn-round btn-simple"
            data-toggle="dropdown"
            type="button"
          >
            <i className="fas fa-ellipsis-h" />
          </DropdownToggle>
          <DropdownMenu right>
            {/* Strategy Page */}
            {this.props.managers.strategy.goToStrategyPageBtn(prefs, getString, this.onClick, strategy)}
            <DropdownItem divider />
            {/* Edit */}
            {strategy.isOwner && this.props.managers.strategy.editBtn(prefs, getString, this.onClick, strategy)}
            {/* Delete */}
            {strategy.isOwner && this.props.managers.strategy.deleteBtn(prefs, getString, this.onClick, strategy)}
            <DropdownItem divider />
            {/* Save/Unsave */}
            {this.props.managers.strategy.saveBtn(prefs, getString, this.onClick, strategy, context)}
            {/* Share */}
            {this.props.managers.strategy.shareBtn(prefs, getString, this.onClick, strategy)}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    )
  }
  renderSavedActions() {
    let { prefs, getString, strategy, context, isRunning } = this.props;

    return (
      <div className="text-right">
        <UncontrolledDropdown>
          {/* Run */}
          {this.props.managers.strategy.runBtn(prefs, getString, this.onClick, strategy, isRunning)}
          {/* ... */}
          <DropdownToggle
            className="btn-sm btn-icon btn-round btn-simple"
            data-toggle="dropdown"
            type="button"
          >
            <i className="fas fa-ellipsis-h" />
          </DropdownToggle>
          <DropdownMenu right>
            {/* Strategy Page */}
            {this.props.managers.strategy.goToStrategyPageBtn(prefs, getString, this.onClick, strategy)}
            <DropdownItem divider />
            {/* Edit */}
            {strategy.isOwner && this.props.managers.strategy.editBtn(prefs, getString, this.onClick, strategy)}
            <DropdownItem divider />
            {/* Save/Unsave */}
            {this.props.managers.strategy.saveBtn(prefs, getString, this.onClick, strategy, context)}
            {/* Share */}
            {this.props.managers.strategy.shareBtn(prefs, getString, this.onClick, strategy)}
            <DropdownItem divider />
            {/* User Profile */}
            {this.props.managers.strategy.goToProfileBtn(prefs, getString, this.onClick, strategy)}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    )
  }
  renderGalleryActions() {
    let { prefs, getString, strategy, context, isRunning } = this.props;

    return (
      <div className="text-right">
        <UncontrolledDropdown>
          {/* Run */}
          {this.props.managers.strategy.runBtn(prefs, getString, this.onClick, strategy, isRunning)}
          {/* ... */}
          <DropdownToggle
            className="btn-sm btn-icon btn-round btn-simple"
            data-toggle="dropdown"
            type="button"
          >
            <i className="fas fa-ellipsis-h" />
          </DropdownToggle>
          <DropdownMenu right>
            {/* Strategy Page */}
            {this.props.managers.strategy.goToStrategyPageBtn(prefs, getString, this.onClick, strategy)}
            <DropdownItem divider />
            {/* Edit */}
            {strategy.isOwner && this.props.managers.strategy.editBtn(prefs, getString, this.onClick, strategy)}
            <DropdownItem divider />
            {/* Save/Unsave */}
            {this.props.managers.strategy.saveBtn(prefs, getString, this.onClick, strategy, context)}
            {/* Share */}
            {this.props.managers.strategy.shareBtn(prefs, getString, this.onClick, strategy)}
            <DropdownItem divider />
            {/* User Profile */}
            {this.props.managers.strategy.goToProfileBtn(prefs, getString, this.onClick, strategy)}
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
              <Col xs="9" className="align-center">
                <a
                  href={`/app/strategies/${strategy.id}/`}
                  onClick={e => {
                    e.preventDefault()
                    this.onClick("goToStrategyPage", strategy)
                  }}
                >
                  {strategy.name}
                </a>
              </Col>
              {/* Save */}
              {context !== "myStrategies" &&
                <Col className="text-right">
                  {this.props.managers.strategy.saveBtn(prefs, getString, this.onClick, strategy, context, "btn")}
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
          <br />
          {/* Owner */}
          <Row>
            <Col className="text-right">
              <a
                className="description"
                href={this.props.managers.app.userProfilePath(strategy.owner_username)}
                onClick={e => {
                  e.preventDefault()
                  this.onClick("goToProfile", strategy)
                }}
              >
                @{strategy.owner_username}
              </a>
            </Col>
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
      </Card >
    )
  }
}

export default StrategyCardMini;

StrategyCardMini.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,

  strategy: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  isRunning: PropTypes.bool.isRequired,
}