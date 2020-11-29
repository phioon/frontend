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

class SubscriptionPlatinum extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      isLoading: undefined,

      subscription: { name: "platinum", prices: {} }
    }
  }
  componentDidMount() {
    this.prepareRequirements()
  }

  async prepareRequirements() {
    let subscription = await this.props.managers.app.subscriptionRetrieve(this.state.subscription.name)
    this.setState({ subscription })
  }

  async onClick(action, data) {
    this.setState({ isLoading: true })
    await this.props.onClick(action, data)
    this.setState({ isLoading: false })
  }

  render() {
    let { prefs, getString, submitActionId } = this.props;
    let { subscription, isLoading } = this.state;

    return (
      <Card className="card-pricing">
        <CardHeader>
          <div className="subscription">
            {getString(prefs.locale, this.compId, "label_title")}
          </div>
        </CardHeader>
        <CardBody>
          <div className="card-icon icon-primary">
            <i className="nc-icon nc-planet" />
          </div>
          <CardTitle tag="h3">
            <label><small>R$</small></label>
            {" "}
            {this.props.activeInterval === 'month' ? 69 : 54}
            {" "}
            <label><small>/{getString(prefs.locale, this.compId, "label_month")}</small></label>
          </CardTitle>
          <ul>
            {/* Stock Exchanges */}
            <li>
              <b>1</b>
              {` ${getString(prefs.locale, this.compId, "label_stockExchange")}`}
              {" "}
              <i id={"label_stockExchange_hint"} className="nc-icon nc-alert-circle-i" />
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"label_stockExchange_hint"}>
                {getString(prefs.locale, this.compId, "label_stockExchange_hint")}
              </UncontrolledTooltip>
            </li>
            {/* Wallets */}
            <li>
              <b>10</b>
              {" "}
              <a href={project.info.website_wallets} target="_blank">
                {`${getString(prefs.locale, this.compId, "label_wallets")}`}
              </a>
            </li>
            {/* Dashboards */}
            <li>
              {` ${getString(prefs.locale, this.compId, "label_dashboards")}`}
              {" "}
              <i id={"label_dashboards_hint"} className="nc-icon nc-alert-circle-i" />
              <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"label_dashboards_hint"}>
                {getString(prefs.locale, this.compId, "label_dashboards_hint")}
              </UncontrolledTooltip>
            </li>
            {/* Strategies */}
            <li>
              <a href={project.info.website_strategies} target="_blank">
                <b>{getString(prefs.locale, this.compId, "label_strategies")}</b>
              </a>
            </li>
            {/* Phi Trader */}
            <li>
              <a href={project.info.website_phitrader} target="_blank">
                <b>{getString(prefs.locale, this.compId, "label_phiTrader")}</b>
              </a>
            </li>
          </ul>
        </CardBody>
        <CardFooter className="text-center">
          <Button
            className="btn-simple btn-round"
            id={`subscription_${submitActionId}_${subscription.name}`}
            color={submitActionId === "downgrade" ? "danger" : "success"}
            onClick={() => this.onClick(
              submitActionId, {
              priceId: subscription.prices[`${subscription.name}_${this.props.activeInterval}`]
            })}
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

export default SubscriptionPlatinum;

SubscriptionPlatinum.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  submitActionId: PropTypes.string.isRequired
}