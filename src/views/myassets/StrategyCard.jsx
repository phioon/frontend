import React from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
// reactstrap components
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Row,
  UncontrolledTooltip
} from "reactstrap";

import TimeManager from "../../core/managers/TimeManager";

class StrategyCard extends React.Component {
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
    let { getString, strategy } = this.props;
    let {
      langId,
      compId,

      isFlipped,
    } = this.state;

    return (

      <Card className="card-summary">
        <CardHeader>
          {/* Name */}
          <h6 className="card-category text-center">{strategy.name}</h6>
        </CardHeader>
        <CardBody>
          {/* Type */}
          <div id={"type__" + strategy.id} className={classnames("card-icon", "text-center", strategy.type == "buy" ? "icon-success" : "icon-danger")}>
            {strategy.type == "buy" ?
              <i className="nc-icon nc-spaceship" /> :
              <i className="nc-icon nc-spaceship fa-rotate-90" />
            }
          </div>
          <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"type__" + strategy.id}>
            {getString(langId, compId, ["icon_type_" + strategy.type + "_hint"])}
          </UncontrolledTooltip>
          <br />
          {/* Description */}
          {strategy.desc &&
            <>
              <div className="icon icon-primary big-title">
                <i className="fas fa-quote-right" />
              </div>
              <i className="card-description">{this.formatLongText(strategy.desc)}</i>
              <p className="card-description text-right">
                {strategy.owner_first_name}
                {" "}
                {strategy.owner_last_name}
              </p>
            </>
          }
          {/* Created On */}
          <Row>
            <Col xl="7" xs="6" className="ml-auto mr-auto">
              <label>{getString(langId, compId, "label_createdOn")}</label>
            </Col>
            <Col xl="5" xs="6" className="ml-auto mr-auto text-right">
              <label>{TimeManager.getLocaleDateString(strategy.created_on, false)}</label>
            </Col>
          </Row>
          <br />
          {/* Logic Type */}
          <Row>
            <Col xl="7" xs="6" className="ml-auto mr-auto">
              <label>
                {getString(langId, compId, "label_logic")}
                {" "}
                <i id={"logic_hint_" + strategy.id} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"logic_hint_" + strategy.id}>
                {getString(langId, compId, "label_logic_hint")}
              </UncontrolledTooltip>
            </Col>
            <Col xl="5" xs="6" className="ml-auto mr-auto text-right">
              <label>
                {strategy.is_dynamic ?
                  getString(langId, compId, "label_dynamic") :
                  getString(langId, compId, "label_static")
                }
              </label>
            </Col>
          </Row>
        </CardBody>
        <CardFooter>
          <hr />
          <Row>
            <Col>
              <div className="stats text-left">
                {getString(langId, compId, "label_actions")}:
                </div>
            </Col>
            <Col className="text-right">
              <Button
                className="btn-icon btn-link"
                color="warning"
                id={"update__" + strategy.id}
                size="sm"
                type="button"
                onClick={() => this.props.onClick("update", strategy)}
              >
                <i className="fa fa-edit" />
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"update__" + strategy.id}>
                {getString(langId, compId, "btn_update_hint")}
              </UncontrolledTooltip>
              <Button
                className="btn-icon btn-link remove"
                color="danger"
                id={"delete__" + strategy.id}
                size="sm"
                type="button"
                onClick={() => this.props.onClick("delete", strategy)}
              >
                <i className="fa fa-times" />
              </Button>
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"delete__" + strategy.id}>
                {getString(langId, compId, "btn_delete_hint")}
              </UncontrolledTooltip>
            </Col>
          </Row>
        </CardFooter>
      </Card>
    )
  }
}

export default StrategyCard;

StrategyCard.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,

  strategy: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
}