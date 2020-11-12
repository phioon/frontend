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

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      pageFirstLoading: true,

      activeInterval: "month",

      subscription: {},

      currency: { code: "BRL", symbol: "R$", thousands_separator_symbol: ".", decimal_symbol: "," },
    }

    this.onClick = this.onClick.bind(this);
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }
  componentDidMount() {
    this.props.setNavbarTitleId("title_" + this.state.compId)
    this.prepareRequirements()
  }
  async prepareRequirements() {
    let { subscription } = this.state

    if (window.location.pathname.includes("/app/order/success") && window.location.search) {
      this.validateSession()
    }

    let user = await this.props.managers.auth.instantUser()
    subscription = await this.props.managers.app.subscriptionRetrieve(user.subscription)

    this.setState({ subscription })
  }

  async validateSession() {
    let sessionId = window.location.search
    sessionId = sessionId.replace("?session_id=", "")

    let checkoutSession = await this.props.managers.stripe.checkoutSessionRetrieve(sessionId)

    if (checkoutSession.id) {
      // Checkout session finished with success?
      // Test others use cases: payment declined, etc...

      if (checkoutSession.payment_status === "paid") {
        this.subscriptionDone()
      }
    }
  }

  async onClick(action, data) {
    switch (action) {
      // props.priceId needed
      case "upgrade":
        if (this.state.subscription.name === "basic")
          await this.openCheckoutSession(data)
        else
          await this.openCustomerPortal()
        break;
      case "downgrade":
        await this.openCustomerPortal()
        // Open manage
        break;
      case "manage":
        await this.openCustomerPortal()
        // Open manage
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
    this.setState({
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={this.props.getString(this.state.langId, this.state.compId, "alert_subscriptionDone_title")}
          confirmBtnText={this.props.getString(this.state.langId, this.state.compId, "btn_getStarted")}
          onConfirm={() => this.reloadApp()}
          confirmBtnBsStyle="success"
        >
          {this.props.getString(this.state.langId, this.state.compId, "alert_subscriptionDone_text_p1")}
          <br /><br />
          {this.props.getString(this.state.langId, this.state.compId, "alert_subscriptionDone_text_p2")}
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
    let { getString } = this.props;
    let {
      langId,
      compId,
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
              {getString(langId, compId, "label_monthly")}
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
              {getString(langId, compId, "label_yearly")}
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