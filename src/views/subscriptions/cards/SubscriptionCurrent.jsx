import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Col,
  Row,
  Spinner,
  UncontrolledTooltip
} from "reactstrap";
import Skeleton from "react-loading-skeleton";

import TimeManager from "../../../core/managers/TimeManager";
import {
  getDistinctValuesFromList,
  getInitials,
  getFirstAndLastName,
} from "../../../core/utils";

class SubscriptionCurrent extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      pageFirstLoading: true,
      isLoading: undefined,

      subscription: { name: undefined },

      personalData: {
        data: {
          email: "",
          username: "",
          first_name: "",
          last_name: "",
          full_name: "",
        },
      },

      measures: {
        positions: {
          amount: {},
          amountInvested: { id: "amountInvested" },
          result: { id: "result" },
          winners: { id: "winners" },
        }
      },

      insights: {
        phiOperations: { amount: {} },
        strategies: { amount: {} }
      },

      currency: { code: "BRL", symbol: "R$", thousands_separator_symbol: ".", decimal_symbol: "," },
    }
  }
  componentDidMount() {
    this.prepareRequirements()
  }
  async prepareRequirements() {
    let { measures, insights, currency } = this.state

    await this.prepareUserData()

    currency = await this.props.managers.app.currencyRetrieve(this.props.prefs.currency)
    measures = await this.prepareMeasures()
    insights = await this.prepareInsights()

    this.setState({ pageFirstLoading: false, measures, insights, currency })
  }
  async prepareUserData() {
    let { personalData, subscription } = this.state;

    let user = this.props.user
    user.initials = getInitials(`${user.first_name} ${user.last_name}`)
    user.full_name = getFirstAndLastName(`${user.first_name} ${user.last_name}`)

    subscription = user.subscription
    subscription.userJoinedOn = user.date_joined
    subscription = {
      ...await this.props.managers.app.subscriptionRetrieve(user.subscription.name),
      ...subscription,
    }

    for (var [k, v] of Object.entries(user))
      if (Object.keys(personalData.data).includes(k))
        personalData.data[k] = v

    this.setState({ subscription, personalData })
  }
  async prepareMeasures() {
    let { measures } = this.state
    let selection = await this.props.managers.app.positionData()

    // Amount of Positions
    measures.positions.amount.data = selection.length
    // Amount Invested
    measures.positions.amountInvested.currency = await this.props.managers.measure.totalVolumeAsKpi(selection, "currency")
    // Result
    measures.positions.result.percentage = await this.props.managers.measure.resultAsKpi(selection, "percentage")

    return measures
  }
  async prepareInsights() {
    let { subscription, insights } = this.state
    insights.phiOperations.amount.data = 0
    let wallets = await this.props.managers.app.walletData()
    let strategies = await this.props.managers.app.myStrategyData()

    let stockExchanges = getDistinctValuesFromList(wallets, "se_short")
    let dSetups = []

    // Strategies
    insights.strategies.amount.data = strategies.length

    if (subscription.name !== "basic") {
      let userJoinedOn = TimeManager.getMoment(subscription.userJoinedOn)
      // Phi Trader operations
      for (var se_short of stockExchanges) {
        let ds = await this.props.managers.market.dSetupList(se_short)
        if (ds.data)
          dSetups = dSetups.concat(ds.data)
      }
      for (var obj of dSetups) {
        let startedOn = TimeManager.getMoment(obj.started_on)

        if (startedOn.isSameOrAfter(userJoinedOn))
          insights.phiOperations.amount.data += 1
      }
    }

    return insights
  }

  async onClick(action, data) {
    this.setState({ isLoading: true })
    await this.props.onClick(action, data)
    this.setState({ isLoading: false })
  }

  render() {
    let { prefs, getString } = this.props;
    let {
      pageFirstLoading,
      isLoading,

      subscription,

      personalData,

      measures,
      insights,

      currency,

      alert
    } = this.state;

    return (
      <Card className="card-pricing">
        {alert}
        <CardHeader>
          <div className="subscription">
            {String(subscription.name).toUpperCase()}
          </div>
        </CardHeader>
        <CardBody>
          <div className="card-icon icon-primary">
            {subscription.name === "basic" ?
              <i className="nc-icon nc-user-run" /> :
              subscription.name === "premium" ?
                <i className="nc-icon nc-spaceship" /> :
                <i className="nc-icon nc-planet" />
            }
          </div>
          {/* Full Name */}
          <div className="user-name">
            <a href="" onClick={e => e.preventDefault()}>
              <h5 className="title">{personalData.data.full_name}</h5>
            </a>
          </div>
          {/* Joined On */}
          <Row>
            <Col md="7" sm="7" xs="7">
              <label>{getString(prefs.locale, this.compId, "label_joinedOn")}</label>
            </Col>
            <Col md="5" sm="5" xs="5" className="text-right">
              <label>{TimeManager.getLocaleDateString(subscription.userJoinedOn, false)}</label>
            </Col>
          </Row>
          <Row className="mt-3" />
          {/* Subscription Label */}
          <Row>
            <Col md="7" sm="7" xs="7">
              <label>
                {getString(prefs.locale, this.compId, "label_subscription")}
                {" "}
                <i id={"subscription_hint"} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"subscription_hint"}>
                {getString(prefs.locale, this.compId, "label_subscription_hint")}
              </UncontrolledTooltip>
            </Col>
            <Col md="5" sm="5" xs="5" className="text-right">
              <label><b>{subscription.label}</b></label>
            </Col>
          </Row>
          {/* Expires On */}
          {subscription.expires_on &&
            <Row>
              <Col md="7" sm="7" xs="7">
                <label>
                  {getString(prefs.locale, this.compId, "label_expiresOn")}
                  {" "}
                  <i id={"label_expiresOn_hint"} className="nc-icon nc-alert-circle-i" />
                </label>
                <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"label_expiresOn_hint"}>
                  {getString(prefs.locale, this.compId, "label_expiresOn_hint")}
                </UncontrolledTooltip>
              </Col>
              <Col md="5" sm="5" xs="5" className="text-right">
                <label className="text-warning">
                  {TimeManager.getLocaleDateString(subscription.expires_on, false)}
                </label>
              </Col>
            </Row>
          }
          {/* Renews On */}
          {subscription.renews_on &&
            <Row>
              <Col md="7" sm="7" xs="7">
                <label>
                  {getString(prefs.locale, this.compId, "label_renewsOn")}
                  {" "}
                  <i id={"label_renewsOn_hint"} className="nc-icon nc-alert-circle-i" />
                </label>
                <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"label_renewsOn_hint"}>
                  {getString(prefs.locale, this.compId, "label_renewsOn_hint")}
                </UncontrolledTooltip>
              </Col>
              <Col md="5" sm="5" xs="5" className="text-right">
                <label className={TimeManager.getDateString() > subscription.renews_on && "text-danger"}>
                  {TimeManager.getLocaleDateString(subscription.renews_on, false)}
                </label>
              </Col>
            </Row>
          }
          {/* Manage Subscription */}
          {subscription.name !== "basic" &&
            <>
              <Row className="mt-5" />
              <Row className="justify-content-center">
                <Button
                  id={`subscription_manage_${subscription.name}`}
                  color="success"
                  className="btn-simple btn-round"
                  onClick={() => this.onClick("manage")}>
                  {isLoading ?
                    <Spinner size="sm" /> :
                    getString(prefs.locale, this.compId, "btn_manage")
                  }
                </Button>
              </Row>
            </>
          }
          {/* Insights */}
          <hr />
          <p className="description text-center">
            {`${subscription.label} ${getString(prefs.locale, this.compId, "label_insights")}`}
          </p>
          <Row className="mt-4" />
          <div className="text-center">
            {/* Basic Insights */}
            <Row>
              {/* # Positions */}
              <Col xs="6">
                <h6>
                  {pageFirstLoading ?
                    <Skeleton /> :
                    measures.positions.amount.data
                  }
                  <br />
                  <small>{getString(prefs.locale, this.compId, "label_positions")}</small>
                  <br />
                  <i id={"positions_hint"} className="nc-icon nc-alert-circle-i" />
                </h6>
                <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"positions_hint"}>
                  {getString(prefs.locale, this.compId, "label_positions_hint")}
                </UncontrolledTooltip>
              </Col>
              {/* Result */}
              <Col xs="6">
                <h6>
                  {pageFirstLoading ?
                    <Skeleton /> :
                    this.props.managers.measure.handleKpiPresentation("nominal_percentage", measures.positions.result.percentage.data, currency, true)
                  }
                  <br />
                  <small>{getString(prefs.locale, this.compId, "label_result")}</small>
                  <br />
                  <i id={"result_hint"} className="nc-icon nc-alert-circle-i" />
                  <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"result_hint"}>
                    {getString(prefs.locale, this.compId, "label_result_hint")}
                  </UncontrolledTooltip>
                </h6>
              </Col>
            </Row>
            <Row className="mt-2" />
            <Row>
              {/* Volume */}
              <Col xs="6">
                <h6>
                  {pageFirstLoading ?
                    <Skeleton /> :
                    this.props.managers.measure.handleKpiPresentation("nominal_currency", measures.positions.amountInvested.currency.data, currency)
                  }
                  <br />
                  <small>{getString(prefs.locale, this.compId, "label_volume")}</small>
                  <br />
                  <i id={"volume_hint"} className="nc-icon nc-alert-circle-i" />
                  <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"volume_hint"}>
                    {getString(prefs.locale, this.compId, "label_volume_hint")}
                  </UncontrolledTooltip>
                </h6>
              </Col>
              {/* Strategies */}
              <Col xs="6">
                <h6>
                  {pageFirstLoading ?
                    <Skeleton /> :
                    insights.strategies.amount.data
                  }
                  <br />
                  <small>{getString(prefs.locale, this.compId, "label_strategies")}</small>
                  <br />
                  <i id={"strategies_hint"} className="nc-icon nc-alert-circle-i" />
                </h6>
                <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"strategies_hint"}>
                  {getString(prefs.locale, this.compId, "label_strategies_hint")}
                </UncontrolledTooltip>
              </Col>
            </Row>
            <Row className="mt-2" />
            <Row>
              {/* Phi Trader */}
              {subscription.name !== "basic" &&
                <Col xs="6">
                  <h6>
                    {pageFirstLoading ?
                      <Skeleton /> :
                      insights.phiOperations.amount.data
                    }
                    <br />
                    <small>{getString(prefs.locale, this.compId, "label_phiOperations")}</small>
                    <br />
                    <i id={"phiOperations_hint"} className="nc-icon nc-alert-circle-i" />
                  </h6>
                  <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"phiOperations_hint"}>
                    {getString(prefs.locale, this.compId, "label_phiOperations_hint")}
                  </UncontrolledTooltip>
                </Col>
              }
            </Row>
          </div>
        </CardBody>
      </Card>
    )
  }
};

export default SubscriptionCurrent;

SubscriptionCurrent.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,
  setAuthStatus: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
}