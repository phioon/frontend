import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
// reactstrap components
import {
  Badge,
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

import { cutLine, round } from "../../../core/utils";

class StrategyCardMini extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      onHover: undefined
    }

    this.onClick = this.onClick.bind(this);
  }

  onClick(action, strategy) {
    this.props.onClick(action, strategy)

    // Handle immediate actions...
    switch (action) {
      case "save":
        strategy.isSaved = !strategy.isSaved
        this.setState({ strategy })
        break;
    }
  }

  getDescTitle(desc) {
    let lines = []
    let title = undefined
    let addDots = undefined
    let limitLength = 58
    let blankSpaceLookup = 50

    if (desc) {
      lines = desc.split("\n")
      title = lines[0]

      if (title.length > limitLength) {
        // Title is long enough for 2 lines
        title = cutLine(title, limitLength, blankSpaceLookup)
        addDots = true
      }
      else if (lines.length > 1) {
        if (title.length < limitLength / 2) {
          // Title needs only 1 line. Bring the next line and cut it if needed
          title += `\n`
          title += cutLine(lines[1], round(limitLength / 2, 0), round(blankSpaceLookup / 2, 0))
          addDots = true
        }
        else
          addDots = true
      }

      if (addDots)
        title += `...`
    }
    else {
      // No description
      title = ``
    }

    return title
  }

  renderActions(context) {
    let actions = null;

    switch (context) {
      case "myStrategies":
        actions = this.renderMyActions();
        break;
      case "savedStrategies":
        actions = this.renderSavedActions();
        break;

      default:
        actions = this.renderHomeActions();
        break;
    }

    return actions
  }
  renderMyActions() {
    let { prefs, getString, strategy, context, isRunning } = this.props;

    return (
      <div className="text-right">
        <UncontrolledDropdown>
          {/* Run */}
          {this.props.managers.strategy.runBtn(prefs, getString, this.onClick, strategy, isRunning, context)}
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
          {this.props.managers.strategy.runBtn(prefs, getString, this.onClick, strategy, isRunning, context)}
          {/* Save */}
          {this.props.managers.strategy.saveBtn(prefs, getString, this.onClick, strategy, context, "btn", "sm")}
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
  renderHomeActions() {
    let { prefs, getString, strategy, context, isRunning } = this.props;

    return (
      <div className="text-right">
        <UncontrolledDropdown>
          {/* Run */}
          {this.props.managers.strategy.runBtn(prefs, getString, this.onClick, strategy, isRunning, context)}
          {/* Save */}
          {this.props.managers.strategy.saveBtn(prefs, getString, this.onClick, strategy, context, "btn", "sm")}
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

  renderStars(value) {
    let states = [
      value > 0.75 ? "full" : value > 0.25 ? "half" : "empty",
      value > 1.75 ? "full" : value > 1.25 ? "half" : "empty",
      value > 2.75 ? "full" : value > 2.25 ? "half" : "empty",
      value > 3.75 ? "full" : value > 3.25 ? "half" : "empty",
      value > 4.75 ? "full" : value > 4.25 ? "half" : "empty",
    ]

    return states.map((state, i) => {
      return (
        <span key={i}>
          {this.renderStar(state)}
          {" "}
        </span>
      )
    })
  }
  renderStar = (state) => {
    let iClass = undefined
    switch (state) {
      case "empty":
        iClass = "far fa-star"
        break;
      case "half":
        iClass = "fas fa-star-half-alt"
        break;
      case "full":
        iClass = "fas fa-star"
        break;
    }

    return (
      <small>
        <i className={iClass} />
      </small>
    )
  }

  render() {
    let { prefs, getString, context, strategy } = this.props;
    let { onHover } = this.state;

    return (
      <Card className="card-stats-mini"
        onMouseOver={() => this.setState({ onHover: true })}
        onMouseLeave={() => this.setState({ onHover: false })}
      >
        <CardBody>
          {/* Name */}
          <CardTitle>
            <a
              href={this.props.managers.app.strategyPagePath(strategy.uuid)}
              onClick={e => {
                e.preventDefault()
                this.onClick("goToStrategyPage", strategy)
              }}
            >
              <b>{strategy.name}</b>
            </a>
            {/* Stars */}
            <Row>
              <Button
                className="btn-neutral"
                color="orange"
                size="sm"
                onClick={() => this.onClick("openReview", strategy)}
              >
                {strategy.stats && this.renderStars(strategy.stats.ratings.avg)}
              </Button>
            </Row>
          </CardTitle>
          {/* Desc */}
          <div className="description-box">
            <pre className="description">
              {this.getDescTitle(strategy.desc)}
            </pre>
          </div>
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
                <small>
                  - @{strategy.owner_username}
                </small>
              </a>
            </Col>
          </Row>
          <Row>
            <Col>
              {/* Logic */}
              <label>
                <Badge id={`logic__${context}__${strategy.uuid}`} color="default" pill>
                  {strategy.is_dynamic ?
                    getString(prefs.locale, this.compId, "label_dynamic") :
                    getString(prefs.locale, this.compId, "label_static")}
                </Badge>
              </label>
              <UncontrolledTooltip placement="bottom" target={`logic__${context}__${strategy.uuid}`}>
                {strategy.is_dynamic ?
                  getString(prefs.locale, this.compId, "label_dynamic_hint") :
                  getString(prefs.locale, this.compId, "label_static_hint")
                }
              </UncontrolledTooltip>
              {" "}
              {context === "myStrategies" &&
                <label>
                  <Badge color="default" pill>
                    {strategy.is_public ?
                      getString(prefs.locale, this.compId, "label_public") :
                      getString(prefs.locale, this.compId, "label_private")}
                  </Badge>
                </label>
              }
            </Col>
          </Row>
          <hr />
          {/* Action buttons */}
          {this.renderActions(context)}
        </CardBody >
        {/* Background Icon */}
        <div id={`type__${context}__${strategy.uuid}`}
          className={classnames("icon-bg", strategy.type == "buy" ? "icon-success" : "icon-danger")}
        >
          {strategy.type == "buy" ?
            <i className="nc-icon nc-spaceship" /> :
            <i className="nc-icon nc-spaceship fa-rotate-90" />
          }
          <UncontrolledTooltip placement="bottom" target={`type__${context}__${strategy.uuid}`}>
            {strategy.type == "buy" ?
              getString(prefs.locale, this.compId, "icon_type_buy_hint") :
              getString(prefs.locale, this.compId, "icon_type_sell_hint")
            }
          </UncontrolledTooltip >
        </div >
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