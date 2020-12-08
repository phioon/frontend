import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Nav,
  NavItem,
  NavLink,
  Col,
  Row,
} from "reactstrap";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";

import SubscriptionCurrent from "./cards/SubscriptionCurrent";
import SubscriptionPremium from "./cards/SubscriptionPremium";
import SubscriptionBasic from "./cards/SubscriptionBasic";
import SubscriptionPlatinum from "./cards/SubscriptionPlatinum";

class UserSubscription extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase()

    this.state = {
      pageFirstLoading: true,

      activeInterval: "month",

      user: {},
      subscription: {},

      currency: { code: "BRL", symbol: "R$", thousands_separator_symbol: ".", decimal_symbol: "," },
    }

    this.onClick = this.onClick.bind(this);
  }
  componentDidMount() {
    this.props.setNavbarTitleId("title_" + this.compId)
    this.prepareRequirements()
  }
  async prepareRequirements() {
    let { subscription } = this.state

    if (window.location.pathname.includes("/app/order/success") && window.location.search) {
      this.validateSession()
    }

    let user = this.props.user
    subscription = await this.props.managers.app.subscriptionRetrieve(user.subscription.name)

    this.setState({ user, subscription })
  }

  async validateSession() {
    let sessionId = window.location.search
    sessionId = sessionId.replace("?session_id=", "")

    let checkoutSession = await this.props.managers.stripe.checkoutSessionRetrieve(sessionId)

    if (checkoutSession.id) {
      // Seems like it's a valid Checkout object...

      if (checkoutSession.payment_status === "paid") {
        let price = checkoutSession.amount_total && checkoutSession.amount_total / 100
        let gtag_obj = {
          currency: String(checkoutSession.currency).toUpperCase(),
          value: price,
          items: [{ id: checkoutSession.subscription, price: price }],
        }
        this.props.managers.gtag.sendEvent("purchase", gtag_obj)

        this.subscriptionDone()
      }
    }
  }

  async onClick(action, data) {
    let { subscription } = this.state;

    switch (action) {
      case "upgrade":
        if (subscription.name === "basic") {
          // data.priceId needed
          await this.openCheckoutSession(data)
        }
        else
          await this.openCustomerPortal()
        break;
      case "downgrade":
        await this.openCustomerPortal()
        break;
      case "manage":
        await this.openCustomerPortal()
        break;
    }
  }

  async openCheckoutSession(data) {
    await this.props.managers.stripe.checkoutSessionCreate(data)
  }
  async openCustomerPortal() {
    await this.props.managers.stripe.customerPortalSessionCreate()
  }

  subscriptionDone() {
    let { prefs, getString } = this.props;

    this.setState({
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={getString(prefs.locale, this.compId, "alert_subscriptionDone_title")}
          confirmBtnText={getString(prefs.locale, this.compId, "btn_getStarted")}
          onConfirm={() => this.reloadApp()}
          confirmBtnBsStyle="success"
        >
          {getString(prefs.locale, this.compId, "alert_subscriptionDone_text_p1")}
          <br /><br />
          {getString(prefs.locale, this.compId, "alert_subscriptionDone_text_p2")}
        </ReactBSAlert>
      )
    });
  }
  reloadApp() {
    this.setState({ alert: null });
    window.location.href = window.location.origin + "/app/user/subscription"
  }
  hideAlert() {
    this.setState({ alert: null });
  };
  toggleNavLink(navId, value) {
    this.setState({ [navId]: value })
  }

  render() {
    let { prefs, getString } = this.props;
    let {
      activeInterval,

      subscription,

      alert
    } = this.state;

    return (
      <div className="content">
        {alert}
        <Nav pills role="subsInterval" className="nav-pills nav-pills-icons justify-content-center">
          <NavItem>
            <NavLink
              data-toggle="tab"
              href="#"
              role="subsInterval"
              className={activeInterval === "month" ? "active" : ""}
              onClick={() => this.toggleNavLink("activeInterval", "month")}
            >
              {getString(prefs.locale, this.compId, "label_monthly")}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              data-toggle="tab"
              href="#"
              role="subsInterval"
              className={activeInterval === "year" ? "active" : ""}
              onClick={() => this.toggleNavLink("activeInterval", "year")}
            >
              {getString(prefs.locale, this.compId, "label_yearly")}
            </NavLink>
          </NavItem>
        </Nav>
        <Row className="mt-5" />
        <Row>
          {/* Subscription 01*/}
          <Col md="4">
            {subscription.name === "basic" ?
              <SubscriptionCurrent
                {...this.props}
                subscription={subscription}
                onClick={this.onClick}
              /> :
              <SubscriptionBasic
                getString={getString}
                prefs={this.props.prefs}
                managers={this.props.managers}
                onClick={this.onClick}
                submitActionId="downgrade"
              />
            }
          </Col>
          {/* Subscription 02*/}
          <Col md="4">
            {subscription.name === "premium" ?
              <SubscriptionCurrent
                {...this.props}
                subscription={subscription}
                onClick={this.onClick}
              /> :
              subscription.name === "basic" ?
                <SubscriptionPremium
                  getString={getString}
                  prefs={this.props.prefs}
                  managers={this.props.managers}
                  activeInterval={activeInterval}
                  onClick={this.onClick}
                  submitActionId="upgrade"
                /> :
                <SubscriptionPremium
                  getString={getString}
                  prefs={this.props.prefs}
                  managers={this.props.managers}
                  activeInterval={activeInterval}
                  onClick={this.onClick}
                  submitActionId="downgrade"
                />
            }
          </Col>
          {/* Subscription 03*/}
          <Col md="4">
            {subscription.name === "platinum" ?
              <SubscriptionCurrent
                {...this.props}
                subscription={subscription}
                onClick={this.onClick}
              /> :
              <SubscriptionPlatinum
                getString={getString}
                prefs={this.props.prefs}
                managers={this.props.managers}
                activeInterval={activeInterval}
                onClick={this.onClick}
                submitActionId="upgrade"
              />
            }
          </Col>
        </Row>
      </div>
    );
  }
}

export default UserSubscription;

UserSubscription.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setAuthStatus: PropTypes.func.isRequired
}