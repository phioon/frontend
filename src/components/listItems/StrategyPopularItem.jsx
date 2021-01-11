import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Row,
  Col,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import { integerWithThousandsSeparator } from "../../core/utils";

class StrategyPopularItem extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      onHover: undefined,
    };

    this.onClick = this.onClick.bind(this);
  }

  onClick(action, obj) {
    // Handle immediate actions...
    switch (action) {
      case "save":
        this.props.onClick(action, obj)

        obj.isSaved = !obj.isSaved
        this.setState({ strategy: obj })
        break;
      case "share":
        this.shareClick(obj.uuid)
        break;
      default:
        this.props.onClick(action, obj)
        break;
    }
  }
  shareClick(uuid) {
    let { getString, prefs } = this.props;

    let pageLink = this.props.managers.app.strategyPageLink(uuid)
    navigator.clipboard.writeText(pageLink)

    let message = getString(prefs.locale, "generic", "label_sharedLinkCopied")
    this.props.notify("br", "success", "nc-icon nc-send", "shareStrategy", message)
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
          {/* Strategy Page */}
          {this.props.managers.strategy.goToStrategyPageBtn(prefs, getString, this.onClick, strategy)}
          <DropdownItem divider />
          {/* Save/Unsave */}
          {this.props.managers.strategy.saveBtn(prefs, getString, this.onClick, strategy)}
          {/* Share */}
          {this.props.managers.strategy.shareBtn(prefs, getString, this.onClick, strategy)}
          <DropdownItem divider />
          {/* Edit */}
          {strategy.isOwner && this.props.managers.strategy.editBtn(prefs, getString, this.onClick, strategy)}
          {/* Delete */}
          {strategy.isOwner && this.props.managers.strategy.deleteBtn(prefs, getString, this.onClick, strategy)}
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }

  render() {
    let { getString, prefs, strategy, isLoading } = this.props;
    let { onHover } = this.state;

    return (
      <Row
        className="list-item"
        onMouseOver={() => this.setState({ onHover: true })}
        onMouseLeave={() => this.setState({ onHover: false })}
      >
        <Col sm="1" xs="2" className="centered">
          {onHover ?
            this.props.managers.strategy.runBtn(prefs, getString, this.onClick, strategy, isLoading) :
            <label>{strategy.index}</label>
          }
        </Col>
        <Col xs="1" className="centered">
          {this.props.managers.strategy.saveBtn(prefs, getString, this.onClick, strategy, "any", "btn")}
        </Col>

        <Col sm="7" xs="5">
          <a
            className="text-default"
            href={this.props.managers.app.strategyPagePath(strategy.uuid)}
            onClick={e => {
              e.preventDefault()
              this.onClick("goToStrategyPage", strategy)
            }}
          >
            {strategy.name}
          </a>
        </Col>

        <Col xs="1" centered="centered">
          {onHover && this.renderActions(prefs, getString, strategy)}
        </Col>

        <Col sm="2" xs="2" className="text-right">
          <label>
            {integerWithThousandsSeparator(strategy.total_runs, ",")}
          </label>
        </Col>
      </Row>
    )
  }
}

export default StrategyPopularItem;

StrategyPopularItem.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,

  strategy: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  isRunning: PropTypes.bool.isRequired,
}