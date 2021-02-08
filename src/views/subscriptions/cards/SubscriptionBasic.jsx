import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Spinner,
  UncontrolledTooltip
} from "reactstrap";

import { project } from "../../../core/projectData";

class SubscriptionBasic extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {}
  }

  async onClick(action, data) {
    this.setState({ isLoading: true })
    await this.props.onClick(action, data)
    this.setState({ isLoading: false })
  }

  render() {
    let { prefs, getString, submitActionId } = this.props;
    let { isLoading } = this.state;

    return (
      <Card className="card-pricing">
        <CardHeader>
          <div className="subscription">
            {getString(prefs.locale, this.compId, "label_title")}
          </div>
        </CardHeader>
        <CardBody>
          <div className="card-icon icon-primary">
            <i className="nc-icon nc-user-run" />
          </div>
          <CardTitle tag="h3">
            <label><small>R$</small></label>
            {" "}
            {0}
            {" "}
            <label><small>/{getString(prefs.locale, this.compId, "label_month")}</small></label>
          </CardTitle>
          <ul>
            {/* Stock Exchange */}
            <li>
              <b>1</b>
              {` ${getString(prefs.locale, this.compId, "label_stockExchange")}`}
            </li>
            {/* Wallets */}
            <li>
              <b>2</b>
              {" "}
              <a href={project.info.website_wallets} target="_blank">
                {`${getString(prefs.locale, this.compId, "label_wallets")}`}
              </a>
            </li>
            {/* Static Panels */}
            <li>
              {` ${getString(prefs.locale, this.compId, "label_staticPanels")}`}
              {" "}
              <i id={"label_staticPanels_hint"} className="nc-icon nc-alert-circle-i" />
              <UncontrolledTooltip placement="bottom" target={"label_staticPanels_hint"}>
                {getString(prefs.locale, this.compId, "label_staticPanels_hint")}
              </UncontrolledTooltip>
            </li>
            {/* Strategies */}
            <li>
              <a href={project.info.website_strategies} target="_blank">
                <b>{getString(prefs.locale, this.compId, "label_strategies")}</b>
              </a>:
              {" "}
              {` 5 ${getString(prefs.locale, this.compId, "label_runs")}`}
              {" "}
              {getString(prefs.locale, this.compId, "label_perDay")}
            </li>
          </ul>
        </CardBody>
        <CardFooter className="text-center">
          <Button
            className="btn-simple btn-round"
            color={submitActionId === "downgrade" ? "danger" : "success"}
            onClick={() => this.onClick(submitActionId)}
          >
            {isLoading ?
              <Spinner size="sm" /> :
              getString(prefs.locale, this.compId, `btn_${submitActionId}`)
            }
          </Button>
        </CardFooter>
      </Card>
    )
  }
};

export default SubscriptionBasic;

SubscriptionBasic.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  submitActionId: PropTypes.string.isRequired
}