import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Col,
  FormGroup,
  Form,
  Input,
  Row,
  Spinner,
  UncontrolledTooltip
} from "reactstrap";
import Skeleton from "react-loading-skeleton";
// react plugin used to create datetimepicker
import ReactDatetime from "react-datetime";
import Select from "react-select";

import TimeManager from "../../core/managers/TimeManager";
import { getLangList } from "../../core/lang";
import {
  areObjsEqual,
  deepCloneObj,
  getDistinctValuesFromList,
  verifyLength,
  verifyOnlyLetters
} from "../../core/utils";

class UserProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      pageFirstLoading: true,

      subscription: {},

      initial_personalData: {},
      personalData: {
        data: {
          email: "",
          first_name: "",
          last_name: "",
          initials: "",
          nationality: "",
          birthday: "",
        },
        states: {},

        isLoading: false,
        isValidated: undefined
      },
      initial_prefs: {},
      prefs: {
        data: {
          pref_langId: "",
          pref_currency: ""
        },
        states: {},

        isLoading: false,
        isValidated: undefined
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
        suggestions: {
          amount: {}
        }
      },

      currency: { code: "BRL", symbol: "R$", thousands_separator_symbol: ".", decimal_symbol: "," },
      currencies: [],
      languages: []
    }
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
    let { measures, insights, currency } = this.state

    await this.prepareUserData()

    currency = await this.props.managers.app.currencyRetrieve(this.props.prefs.currency)
    measures = await this.prepareMeasures()

    if (this.state.subscription.name != "basic")
      insights = await this.prepareInsights()

    this.setState({ pageFirstLoading: false, measures, insights, currency })
  }
  async prepareUserData() {
    let { getString, prefs: prefsFromProps } = this.props;
    let { langId, personalData, prefs, subscription } = this.state;

    let user = await this.props.managers.auth.storedUser()
    user = user.user
    user.initials = `${user.first_name[0]}${user.last_name[0]}`
    user.initials = user.initials

    subscription = await this.props.managers.app.subscriptionRetrieve(user.subscription)
    subscription.expiresOn = user.subscription_expires_on
    subscription.renewsOn = user.subscription_renews_on
    subscription.userJoinedOn = user.date_joined

    for (var [k, v] of Object.entries(user)) {
      if (Object.keys(personalData.data).includes(k))
        personalData.data[k] = v
      else if (Object.keys(prefs.data).includes(k))
        prefs.data[k] = v
    }

    // Currencies
    let currencies = await this.props.managers.app.currenciesForSelect()
    for (var c of currencies)
      if (prefsFromProps.currency == c.value)
        prefs.data.pref_currency = c

    // Languages
    let langList = getLangList()
    let languages = []
    for (var id of langList) {
      let option = {
        value: id,
        label: getString(langId, "languages", id)
      }
      languages.push(option)

      if (prefsFromProps.langId == id)
        prefs.data.pref_langId = option
    }

    let initial_personalData = deepCloneObj(personalData)
    let initial_prefs = deepCloneObj(prefs)

    this.setState({
      subscription,
      initial_personalData, personalData,
      initial_prefs, prefs,
      currencies, languages,
    })
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
    insights.suggestions.amount.data = 0
    let wallets = await this.props.managers.app.walletData()
    let stockExchanges = getDistinctValuesFromList(wallets, "se_short")
    let dSetups = []

    let userJoinedOn = TimeManager.getMoment(subscription.userJoinedOn)

    for (var se_short of stockExchanges) {
      let ds = await this.props.managers.market.dSetupList(se_short)
      if (ds.data)
        dSetups = dSetups.concat(ds.data)
    }

    for (var obj of dSetups) {
      let startedOn = TimeManager.getMoment(obj.started_on)

      if (startedOn.isSameOrAfter(userJoinedOn))
        insights.suggestions.amount.data += 1
    }

    return insights
  }

  onChange(event, type, stateName) {
    let newState = { [type]: this.state[type] }

    if (this.state.alertState !== null) {
      newState.alertState = null
      newState.alertMsg = ""
    }

    newState[type].data[stateName] = event.target.value

    switch (stateName) {
      case "first_name":
        if (verifyLength(event.target.value, 3) && verifyOnlyLetters(event.target.value)) {
          newState[type].states[stateName] = "has-success";

          newState[type].data.initials = `${event.target.value[0]}${newState[type].data.last_name[0]}`
          newState[type].data.initials = newState[type].data.initials
        }
        else
          newState[type].states[stateName] = "has-danger";
        break;
      case "last_name":
        if (verifyLength(event.target.value, 3) && verifyOnlyLetters(event.target.value)) {
          newState[type].states[stateName] = "has-success";

          newState[type].data.initials = `${newState[type].data.first_name[0]}${event.target.value[0]}`
          newState[type].data.initials = newState[type].data.initials
        }
        else
          newState[type].states[stateName] = "has-danger";
        break;
      default:
        break;
    }

    newState[type].isValidated = this.isValidated(type, newState[type])

    this.setState(newState)
  }
  onSelectChange(type, fieldName, value) {
    let newState = { [type]: this.state[type] }

    newState[type].data[fieldName] = value

    switch (fieldName) {
      case "birthday":
        if (!value) {
          newState[type].data[fieldName] = null
          newState[type].states[fieldName] = ""
        }
        else if (value._isAMomentObject)
          newState[type].states[fieldName] = "has-success"
        else
          newState[type].states[fieldName] = "has-danger"
        break;
      case "pref_currency":
        // this.props.setPrefs({ pref_currency: value.value })
        newState[type].states[fieldName] = "has-success"
        break;
      case "pref_langId":
        // this.props.setPrefs({ pref_langId: value.value })
        newState[type].states[fieldName] = "has-success"
        break;
      default:
        break;
    }

    newState[type].isValidated = this.isValidated(type, newState[type])

    this.setState(newState)
  }

  isValidated(type, obj) {
    let initial_obj = this.state["initial_" + type]

    if (areObjsEqual(initial_obj.data, obj.data))
      return false

    if (Object.values(obj.states).includes("has-danger"))
      return false

    return true
  }

  isDateValid(date) {
    var today = new Date()
    return date.isBefore(today) ? true : false
  }

  async saveClick(e, type, obj) {
    e.preventDefault();
    obj.isLoading = true
    this.setState({ obj })

    let obj_data = deepCloneObj(obj.data)

    for (let [k, v] of Object.entries(obj_data)) {
      if (typeof v === "object") {
        // Data from Selects {value: "", label: ""} must be readable for the API. So, just considers the field 'value'
        obj_data[k] = v.value
      }
    }

    await this.props.managers.auth.userUpdate(obj_data)

    obj.isLoading = false
    obj.isValidated = undefined
    obj.states = {}
    this.setState({
      obj,
      ["initial_" + type]: deepCloneObj(obj)
    })
  }

  hideAlert() {
    this.setState({
      alert: null
    });
  };

  render() {
    let { getString } = this.props;
    let {
      langId,
      compId,
      pageFirstLoading,

      subscription,

      personalData,
      prefs,

      measures,
      insights,

      currency,
      currencies,
      languages,

      alert
    } = this.state;

    return (
      <>
        <div className="content">
          {alert}
          <Row>
            <Col md="4">
              {/* Subscription */}
              <Card className="card-user">
                <div className="image">
                  <img
                    alt="..."
                    src={"/static/app/assets/img/bg/bg-app-clean-reverse.jpg"}
                  />
                  <div className={`subscription ${subscription.name}`}>{String(subscription.name).toUpperCase()}</div>
                </div>
                <CardBody>
                  <div className="author">
                    {/* Avatar */}
                    <a className="centered">
                      <span className="avatar border-gray centered">
                        <span color="primary">{String(personalData.data.initials).toUpperCase()}</span>
                      </span>
                    </a>
                    {/* Full Name */}
                    <a href="" onClick={e => e.preventDefault()}>
                      <h5 className="title">{personalData.data.first_name}{" "}{personalData.data.last_name}</h5>
                    </a>
                  </div>
                  <br />
                  <div>
                    {/* Joined On */}
                    <Row className="centered">
                      <Col md="5" sm="5" xs="6" className="ml-auto mr-auto">
                        <label>{getString(langId, compId, "label_joinedOn")}</label>
                      </Col>
                      <Col md="4" sm="4" xs="5" className="ml-auto mr-auto text-right">
                        <label>{TimeManager.getLocaleDateString(subscription.userJoinedOn)}</label>
                      </Col>
                    </Row>
                    <br />
                    {/* Subscription Label */}
                    <Row className="centered">
                      <Col md="5" sm="5" xs="6" className="ml-auto mr-auto">
                        <label>
                          {getString(langId, compId, "label_subscription")}
                          {" "}
                          <i id={"subscription_hint"} className="nc-icon nc-alert-circle-i" />
                        </label>
                        <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"subscription_hint"}>
                          {getString(langId, compId, "label_subscription_hint")}
                        </UncontrolledTooltip>
                      </Col>
                      <Col md="4" sm="4" xs="5" className="ml-auto mr-auto text-right">
                        <label>{subscription.label}</label>
                      </Col>
                    </Row>
                    {/* Expires On */}
                    {subscription.expiresOn ?
                      <Row className="centered">
                        <Col md="5" sm="5" xs="6" className="ml-auto mr-auto">
                          <label>
                            {getString(langId, compId, "label_expiresOn")}
                            {" "}
                            <i id={"label_expiresOn_hint"} className="nc-icon nc-alert-circle-i" />
                          </label>
                          <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"label_expiresOn_hint"}>
                            {getString(langId, compId, "label_expiresOn_hint")}
                          </UncontrolledTooltip>
                        </Col>
                        <Col md="4" sm="4" xs="5" className="ml-auto mr-auto text-right">
                          <label>{TimeManager.getLocaleDateString(subscription.expiresOn)}</label>
                        </Col>
                      </Row> :
                      null
                    }
                    {/* Renews On */}
                    {subscription.renewsOn ?
                      <Row className="centered">
                        <Col md="5" sm="5" xs="6" className="ml-auto mr-auto">
                          <label>
                            {getString(langId, compId, "label_renewsOn")}
                            {" "}
                            <i id={"label_renewsOn_hint"} className="nc-icon nc-alert-circle-i" />
                          </label>
                          <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"label_renewsOn_hint"}>
                            {getString(langId, compId, "label_renewsOn_hint")}
                          </UncontrolledTooltip>
                        </Col>
                        <Col md="4" sm="4" xs="5" className="ml-auto mr-auto text-right">
                          <label>{TimeManager.getLocaleDateString(subscription.renewsOn)}</label>
                        </Col>
                      </Row> :
                      null
                    }
                  </div>
                </CardBody>
                <CardFooter>
                  <hr />
                  {/* Insights */}
                  <p className="description text-center">
                    {subscription.label}
                    {" "}
                    {getString(langId, compId, "label_insights")}
                  </p>
                  <div className="button-container">
                    {/* Basic Insights */}
                    <Row>
                      {/* # Positions */}
                      <Col className="mr-auto" lg="5" md="5" xs="6">
                        <h6>
                          {pageFirstLoading ?
                            <Skeleton /> :
                            measures.positions.amount.data
                          }
                          <br />
                          <small>{getString(langId, compId, "label_positions")}</small>
                          <br />
                          <i id={"positions_hint"} className="nc-icon nc-alert-circle-i" />
                        </h6>
                        <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"positions_hint"}>
                          {getString(langId, compId, "label_positions_hint")}
                        </UncontrolledTooltip>
                      </Col>
                      {/* Result */}
                      <Col className="ml-auto" lg="5" md="5" xs="6">
                        <h6>
                          {pageFirstLoading ?
                            <Skeleton /> :
                            this.props.managers.measure.handleKpiPresentation("nominal_percentage", measures.positions.result.percentage.data, currency, true)
                          }
                          <br />
                          <small>{getString(langId, compId, "label_result")}</small>
                          <br />
                          <i id={"result_hint"} className="nc-icon nc-alert-circle-i" />
                          <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"result_hint"}>
                            {getString(langId, compId, "label_result_hint")}
                          </UncontrolledTooltip>
                        </h6>
                      </Col>
                    </Row>
                    <Row>
                      {/* Volume */}
                      <Col className="ml-auto mr-auto" lg="5" md="5" xs="6">
                        <h6>
                          {pageFirstLoading ?
                            <Skeleton /> :
                            this.props.managers.measure.handleKpiPresentation("nominal_currency", measures.positions.amountInvested.currency.data, currency)
                          }
                          <br />
                          <small>{getString(langId, compId, "label_volume")}</small>
                          <br />
                          <i id={"volume_hint"} className="nc-icon nc-alert-circle-i" />
                          <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"volume_hint"}>
                            {getString(langId, compId, "label_volume_hint")}
                          </UncontrolledTooltip>
                        </h6>
                      </Col>
                    </Row>
                    {subscription.name != "basic" &&
                      <div>
                        <Row>
                          {/* Suggestions */}
                          <Col className="mr-auto" lg="5" md="5" xs="6">
                            <h6>
                              {pageFirstLoading ?
                                <Skeleton /> :
                                insights.suggestions.amount.data
                              }
                              <br />
                              <small>{getString(langId, compId, "label_suggestions")}</small>
                              <br />
                              <i id={"suggestions_hint"} className="nc-icon nc-alert-circle-i" />
                            </h6>
                            <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"suggestions_hint"}>
                              {getString(langId, compId, "label_suggestions_hint")}
                            </UncontrolledTooltip>
                          </Col>
                        </Row>
                        {/* <br />
                        <hr />
                        <Row className="centered">
                          <Col md="5" sm="5" xs="6" className="ml-auto mr-auto">
                            <label>
                              {getString(langId, compId, "label_favSetupName")}
                              {" "}
                              <i id={"favSetup_hint_"} className="nc-icon nc-alert-circle-i" />
                            </label>
                            <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target={"favSetup_hint_"}>
                              {getString(langId, compId, "favSetup_hint")}
                            </UncontrolledTooltip>
                          </Col>
                          <Col md="4" sm="4" xs="5" className="ml-auto mr-auto text-right">
                            <label>Bo: PV 72</label>
                          </Col>
                        </Row> */}
                      </div>
                    }
                  </div>
                </CardFooter>
              </Card>
            </Col>
            <Col md="8">
              {/* Personal Data */}
              <Card>
                <CardHeader>
                  <h5 className="title">{getString(langId, compId, "title_personalData")}</h5>
                </CardHeader>
                <CardBody>
                  <Form>
                    <Row>
                      {/* Email */}
                      <Col md="4">
                        <FormGroup>
                          <Row>
                            <Col md="4" xs="4">
                              <label>{getString(langId, compId, "input_email")}</label>
                            </Col>
                          </Row>
                          <Input
                            type="email"
                            name="email"
                            value={personalData.data.email}
                            disabled
                          />
                        </FormGroup>
                      </Col>
                      {/* First Name */}
                      <Col md="4">
                        <FormGroup className={`has-label ${personalData.states.first_name}`}>
                          <label>{getString(langId, compId, "input_firstName")}</label>
                          <Input
                            placeholder={getString(langId, compId, "input_firstName")}
                            type="text"
                            name="first_name"
                            value={personalData.data.first_name}
                            onChange={e => this.onChange(e, "personalData", e.target.name)}
                          />
                        </FormGroup>
                      </Col>
                      {/* Last Name */}
                      <Col md="4">
                        <FormGroup className={`has-label ${personalData.states.last_name}`}>
                          <label>{getString(langId, compId, "input_lastName")}</label>
                          <Input
                            placeholder={getString(langId, compId, "input_lastName")}
                            type="text"
                            name="last_name"
                            value={personalData.data.last_name}
                            onChange={e => this.onChange(e, "personalData", e.target.name)}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                    </Row>
                    <Row>
                      {/* Nationality */}
                      <Col md="4">
                        <FormGroup>
                          <label>{getString(langId, compId, "input_nationality")}</label>
                          <Input
                            value={getString(langId, "countries", String(personalData.data.nationality).toLowerCase())}
                            placeholder={getString(langId, compId, "input_nationality")}
                            type="text"
                            disabled
                          />
                        </FormGroup>
                      </Col>
                      {/* Birthday */}
                      <Col md="4">
                        <FormGroup className={`has-label ${personalData.states.birthday}`}>
                          <label>{getString(langId, compId, "input_birthday")}
                            {" "}
                            <i id="input_birthday_hint" className="nc-icon nc-alert-circle-i" />
                          </label>
                          <UncontrolledTooltip delay={{ show: 200 }} placement="top" target="input_birthday_hint">
                            <label>{getString(langId, compId, "input_birthday_hint")}</label>
                          </UncontrolledTooltip>
                          <ReactDatetime
                            inputProps={{
                              className: "form-control",
                              placeholder: this.props.getString(langId, compId, "input_select")
                            }}
                            value={personalData.data.birthday}
                            onChange={value => this.onSelectChange("personalData", "birthday", value)}
                            isValidDate={this.isDateValid}
                            timeFormat={false}
                            viewMode="years"
                            closeOnSelect
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
                <CardFooter>
                  <Row className="centered">
                    <Col lg="2" md="3" sm="4" xs="6">
                      <Button
                        block
                        type="submit"
                        className="btn-round"
                        color="success"
                        name="btnSavePersonalData"
                        disabled={personalData.isValidated ? false : true}
                        onClick={e => this.saveClick(e, "personalData", personalData)}
                      >
                        {personalData.isLoading ?
                          <Spinner animation="border" size="sm" /> :
                          getString(langId, compId, "btn_save")
                        }
                      </Button>
                    </Col>
                  </Row>
                </CardFooter>
              </Card>
              {/* Prefs */}
              <Card>
                <CardHeader>
                  <h5 className="title">{getString(langId, compId, "title_prefs")}</h5>
                </CardHeader>
                <CardBody>
                  <Form>
                    <Row>
                      {/* Language */}
                      <Col md="4">
                        <FormGroup>
                          <label>{getString(langId, compId, "input_language")}</label>
                          <Select
                            className="react-select primary"
                            classNamePrefix="react-select"
                            name="pref_langId"
                            value={prefs.data.pref_langId}
                            onChange={value => this.onSelectChange("prefs", "pref_langId", value)}
                            options={languages}
                            placeholder={getString(langId, compId, "input_select")}
                          />
                        </FormGroup>
                      </Col>
                      {/* Currency */}
                      <Col md="3">
                        <FormGroup>
                          <label>
                            {getString(langId, compId, "input_currency")}
                            {" "}
                            <i id="input_currency_hint" className="nc-icon nc-alert-circle-i" />
                          </label>
                          <UncontrolledTooltip delay={{ show: 200 }} placement="top" target="input_currency_hint">
                            {getString(langId, compId, "input_currency_hint")}
                          </UncontrolledTooltip>
                          <Select
                            className="react-select primary"
                            classNamePrefix="react-select"
                            name="pref_currency"
                            value={prefs.data.pref_currency}
                            onChange={value => this.onSelectChange("prefs", "pref_currency", value)}
                            options={currencies}
                            placeholder={getString(langId, compId, "input_select")}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
                <CardFooter>
                  <Row className="centered">
                    <Col lg="2" md="3" sm="4" xs="6">
                      <Button
                        block
                        type="submit"
                        className="btn-round"
                        color="success"
                        name="btnSaveprefs"
                        disabled={prefs.isValidated ? false : true}
                        onClick={e => this.saveClick(e, "prefs", prefs)}
                      >
                        {prefs.isLoading ?
                          <Spinner animation="border" size="sm" /> :
                          getString(langId, compId, "btn_save")
                        }
                      </Button>
                    </Col>
                  </Row>
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }
}

export default UserProfile;

UserProfile.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setAuthStatus: PropTypes.func.isRequired
}