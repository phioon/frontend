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
// react plugin used to create datetimepicker
import ReactDatetime from "react-datetime";
import Select from "react-select";

import ModalChangePassword from "../modals/auth/ModalChangePassword";

import TimeManager from "../../core/managers/TimeManager";
import { getLangList } from "../../core/lang";
import {
  areObjsEqual,
  deepCloneObj,
  verifyLength,
  verifyOnlyLetters,
  verifyUsernameStr,
  getInitials
} from "../../core/utils";

class UserProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isCheckingUsername: false,

      modal_changePassword_isOpen: false,

      personalData: {
        data: {
          email: "",
          username: "",
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
      prefs: {
        data: {
          pref_langId: "",
          pref_currency: ""
        },
        states: {},

        isLoading: false,
        isValidated: undefined
      },
      currencies: [],
      languages: []
    }

    this.toggleModal = this.toggleModal.bind(this)
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
    await this.prepareUserData()
  }
  async prepareUserData() {
    let { getString, prefs: prefsFromProps } = this.props;
    let { langId, personalData, prefs } = this.state;

    let user = await this.props.managers.auth.instantUser()
    user.initials = getInitials(`${user.first_name} ${user.last_name}`)

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

    personalData.initial = deepCloneObj(personalData.data)
    prefs.initial = deepCloneObj(prefs.data)

    this.setState({
      personalData,
      prefs,
      currencies, languages,
    })
  }

  onChange(type, fieldName, value) {
    let newState = { [type]: this.state[type] }

    if (this.state.alertState !== null) {
      newState.alertState = null
      newState.alertMsg = ""
    }

    newState[type].data[fieldName] = value

    switch (fieldName) {
      case "username":
        newState[type].data.username_msgId = ""
        newState[type].data[fieldName] = value.toLowerCase()     // Keep it lowercase

        if (verifyLength(value, 3) && verifyUsernameStr(value)) {
          if (newState[type].initial[fieldName] === value) {
            // Username is the same as before
            newState.personalData.states[fieldName] = ""
          }
          else {
            // Username is different as the initial one...
            this.checkUsernameAvailability(newState[type], fieldName, value)
            newState[type].states[fieldName] = "has-success"
          }
        }
        else {
          // Username is not complaint with the minimum requirements
          newState[type].data.username_msgId = "error_username_minReq"
          newState[type].states[fieldName] = "has-danger"
        }
        break;
      case "first_name":
        if (verifyLength(value, 3) && verifyOnlyLetters(value)) {
          newState[type].states[fieldName] = "has-success";

          newState[type].data.initials = getInitials(`${value} ${newState[type].data.last_name}`)
          //newState[type].data.initials = `${value[0]}${newState[type].data.last_name[0]}`
          //newState[type].data.initials = newState[type].data.initials
        }
        else
          newState[type].states[fieldName] = "has-danger";
        break;
      case "last_name":
        if (verifyLength(value, 3) && verifyOnlyLetters(value)) {
          newState[type].states[fieldName] = "has-success";

          newState[type].data.initials = getInitials(`${newState[type].data.first_name} ${value}`)
          //newState[type].data.initials = `${newState[type].data.first_name[0]}${value[0]}`
          //newState[type].data.initials = newState[type].data.initials
        }
        else
          newState[type].states[fieldName] = "has-danger";
        break;
      default:
        break;
    }

    newState[type].isValidated = this.isValidated(newState[type])

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
        newState[type].states[fieldName] = "has-success"
        break;
      case "pref_langId":
        newState[type].states[fieldName] = "has-success"
        break;
    }

    newState[type].isValidated = this.isValidated(newState[type])

    this.setState(newState)
  }
  async checkUsernameAvailability(personalData, fieldName, value) {
    this.setState({ isCheckingUsername: true })

    let newState = { personalData: personalData }
    let isAvailable = await this.props.managers.auth.isUsernameAvailable(value)

    if (isAvailable) {
      this.setState({ isUsernameAvailable: isAvailable })
      newState.personalData.states[fieldName] = "has-success"
    }
    else if (typeof isAvailable === "undefined") {
      newState.personalData.data.username_msgId = "error_username_couldNotCheck"
      newState.personalData.states[fieldName] = "has-danger"
    }
    else {
      newState.personalData.data.username_msgId = "error_username_taken"
      newState.personalData.states[fieldName] = "has-danger"
    }

    personalData.isValidated = this.isValidated(personalData)
    newState.isCheckingUsername = false
    this.setState(newState)
  }

  isValidated(obj) {
    if (areObjsEqual(obj.data, obj.initial))
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
    this.setState({ [type]: obj })

    let obj_data = deepCloneObj(obj.data)

    for (let [k, v] of Object.entries(obj_data)) {
      if (typeof v === "object") {
        // Data from Selects {value: "", label: ""} must be readable for the API. So, just considers the field 'value'
        obj_data[k] = v ? v.value : v
      }
    }

    await this.props.managers.auth.userUpdate(obj_data)

    obj.isLoading = false
    obj.isValidated = undefined
    obj.states = {}
    obj.initial = deepCloneObj(obj.data)

    this.setState({ [type]: obj })
  }

  hideAlert() {
    this.setState({
      alert: null
    });
  };
  toggleModal(modalId) {
    this.setState({ ["modal_" + modalId + "_isOpen"]: !this.state["modal_" + modalId + "_isOpen"] });
  };

  render() {
    let { getString } = this.props;
    let {
      langId,
      compId,
      isCheckingUsername,

      modal_changePassword_isOpen,

      personalData,
      prefs,

      currencies,
      languages,

      alert
    } = this.state;

    return (
      <>
        <div className="content">
          <ModalChangePassword
            {...this.props}
            modalId="changePassword"
            isOpen={modal_changePassword_isOpen}
            toggleModal={this.toggleModal}
          />
          {alert}
          <Row>
            <Col lg="8" md="7">
              {/* Personal Data */}
              <Card>
                <CardHeader>
                  <h5 className="title">{getString(langId, compId, "title_personalData")}</h5>
                </CardHeader>
                <CardBody>
                  <Form>
                    <Row className="justify-content-center">
                      {/* Email */}
                      <Col md="8" sm="8" xs="8">
                        <FormGroup>
                          <label>{getString(langId, compId, "input_email")}</label>
                          <Input
                            type="email"
                            name="email"
                            value={personalData.data.email}
                            disabled
                          />
                        </FormGroup>
                      </Col>
                      {/* Change Password */}
                      <Col md="4" sm="4" xs="4" className="centered">
                        <Button
                          className="btn-neutral"
                          onClick={() => this.toggleModal("changePassword")}
                        >
                          {getString(langId, compId, "btn_changePassword")}
                        </Button>
                      </Col>
                    </Row>
                    <Row className="justify-content-center">
                      {/* Username */}
                      <Col md="8" sm="8" xs="8">
                        <FormGroup className={`has-label ${personalData.states.username}`}>
                          <label>{getString(langId, compId, "input_username")}</label>
                          <Input
                            type="text"
                            name="username"
                            value={personalData.data.username}
                            onChange={e => this.onChange("personalData", e.target.name, e.target.value)}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4" sm="4" xs="4" className="align-center">
                        {isCheckingUsername && <Spinner color="info" size="sm" />}
                        <label className="text-danger">
                          {personalData.states.username === "has-danger" &&
                            getString(langId, compId, personalData.data.username_msgId)
                          }
                        </label>
                      </Col>
                    </Row>
                    <Row>
                      {/* First Name */}
                      <Col md="6">
                        <FormGroup className={`has-label ${personalData.states.first_name}`}>
                          <label>{getString(langId, compId, "input_firstName")}</label>
                          <Input
                            placeholder={getString(langId, compId, "input_firstName")}
                            type="text"
                            name="first_name"
                            value={personalData.data.first_name}
                            onChange={e => this.onChange("personalData", e.target.name, e.target.value)}
                          />
                        </FormGroup>
                      </Col>
                      {/* Last Name */}
                      <Col md="6">
                        <FormGroup className={`has-label ${personalData.states.last_name}`}>
                          <label>{getString(langId, compId, "input_lastName")}</label>
                          <Input
                            placeholder={getString(langId, compId, "input_lastName")}
                            type="text"
                            name="last_name"
                            value={personalData.data.last_name}
                            onChange={e => this.onChange("personalData", e.target.name, e.target.value)}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      {/* Nationality */}
                      <Col md="6">
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
                      <Col md="6">
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
                              placeholder: this.props.getString(langId, "generic", "input_select")
                            }}
                            locale={getString(langId, "locales", langId)}
                            value={personalData.data.birthday && TimeManager.getLocaleDateString(personalData.data.birthday, false)}
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
                    <Col lg="4" md="6" xs="6">
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
                          <Spinner size="sm" /> :
                          getString(langId, compId, "btn_save")
                        }
                      </Button>
                    </Col>
                  </Row>
                </CardFooter>
              </Card>
            </Col>
            <Col lg="4" md="5">
              {/* Prefs */}
              <Card>
                <CardHeader>
                  <h5 className="title">{getString(langId, compId, "title_prefs")}</h5>
                </CardHeader>
                <CardBody>
                  {/* Language */}
                  <FormGroup>
                    <label>{getString(langId, compId, "input_language")}</label>
                    <Select
                      className="react-select primary"
                      classNamePrefix="react-select"
                      name="pref_langId"
                      value={prefs.data.pref_langId}
                      onChange={value => this.onSelectChange("prefs", "pref_langId", value)}
                      options={languages}
                      placeholder={getString(langId, "generic", "input_select")}
                    />
                  </FormGroup>
                  {/* Currency */}
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
                      placeholder={getString(langId, "generic", "input_select")}
                    />
                  </FormGroup>
                </CardBody>
                <CardFooter>
                  <Row className="centered">
                    <Col lg="8" md="8" xs="6">
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
                          <Spinner size="sm" /> :
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