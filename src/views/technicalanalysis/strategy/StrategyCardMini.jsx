import React from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
// reactstrap components
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  UncontrolledTooltip
} from "reactstrap";
// react component used to flip cards
import ReactCardFlip from 'react-card-flip';

class StrategyCardMini extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,

      isFlipped: false,
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }

  formatLongText(desc) {
    let descLimit = 72
    desc = String(desc)

    if (desc.length > descLimit) {
      desc = desc.substring(0, descLimit)
      desc += "..."
    }

    return desc
  }

  render() {
    let { getString, strategy, isLoading } = this.props;
    let {
      langId,
      compId,

      isFlipped,
    } = this.state;

    return (
      <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
        {/* Front */}
        <Card className="card-stats-mini" onClick={() => this.setState({ isFlipped: !isFlipped })}>
          <CardBody>
            {/* Name */}
            <CardTitle>{strategy.name}</CardTitle>

            <div className="text-right">
              {/* Logic Type */}
              <label>{strategy.is_dynamic ?
                getString(langId, compId, "label_dynamic") :
                getString(langId, compId, "label_static")}
              </label>
              <br />
              <label>@{strategy.owner_username}</label>
            </div>
          </CardBody>
          {/* Background Icon */}
          <div className={classnames("bg-icon", strategy.type == "buy" ? "icon-success" : "icon-danger")}>
            {strategy.type == "buy" ?
              <i className="nc-icon nc-spaceship" /> :
              <i className="nc-icon nc-spaceship fa-rotate-90" />
            }
          </div>
        </Card>
        <Card className="card-stats-mini" onClick={() => this.setState({ isFlipped: !isFlipped })}>
          <CardBody>
            {/* Name */}
            <CardTitle>{strategy.name}</CardTitle>
            <div className="text-center">
              {/* Run */}
              <Button
                className="btn-icon btn-link"
                color="success"
                id={"run__" + strategy.id}
                size="sm"
                type="button"
                disabled={isLoading}
                onClick={() => this.props.onClick("run", strategy)}
              >
                <i className="nc-icon nc-button-play" />
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"run__" + strategy.id}>
                {getString(langId, compId, "btn_run_hint")}
              </UncontrolledTooltip>
              {/* Edit */}
              <Button
                className="btn-icon btn-link"
                color="warning"
                id={"update__" + strategy.id}
                size="sm"
                type="button"
                disabled={this.props.user.username !== strategy.owner_username}
                onClick={() => this.props.onClick("update", strategy)}
              >
                <i className="fa fa-edit" />
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"update__" + strategy.id}>
                {getString(langId, compId, "btn_update_hint")}
              </UncontrolledTooltip>
              {/* Delete */}
              <Button
                className="btn-icon btn-link remove"
                color="danger"
                id={"delete__" + strategy.id}
                size="sm"
                type="button"
                disabled={this.props.user.username !== strategy.owner_username}
                onClick={() => this.props.onClick("delete", strategy)}
              >
                <i className="fa fa-times" />
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"delete__" + strategy.id}>
                {getString(langId, compId, "btn_delete_hint")}
              </UncontrolledTooltip>
            </div>
          </CardBody>
        </Card>
      </ReactCardFlip>
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