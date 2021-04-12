import React from "react";
import PropTypes from "prop-types";
import { trim } from "jquery";
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
import { localeList } from "../../core/locales";
import {
  areObjsEqual,
  deepCloneObj,
  verifyLength,
  verifyOnlyLetters,
  verifyURL,
  verifyUsernameStr,
  getInitials,
  getFirstAndLastName
} from "../../core/utils";
import SortableLinks from "../../components/sortables/SortableLinks";

class MyAccount extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase()

    this.state = {
      isCheckingUsername: false,

      modal_changePassword_isOpen: false,
      modal_link_isOpen: false,

      personalData: {
        data: {
          email: "",
          username: "",
          first_name: "",
          last_name: "",
          initials: "",
          nationality: "",
          birthday: "",
          about_me: "",
        },
        states: {},

        isLoading: false,
        isValidated: undefined
      },
      preferences: {
        data: {
          locale: "",
          currency: ""
        },
        states: {},

        isLoading: false,
        isValidated: undefined
      },
      links: {
        data: {
          links: []
        },
        items: [],

        isLoading: false,
        isValidated: undefined
      },

      selected: {
        action: undefined,
        link: undefined,
        index: undefined,
      },

      currencies: [],
      languages: []
    }

    this.onLinkCommit = this.onLinkCommit.bind(this);
    this.onLinkChange = this.onLinkChange.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }
  componentDidMount() {
    this.props.setNavbarTitleId("title_" + this.compId)
    this.prepareRequirements()
  }
  async prepareRequirements() {
    await this.prepareUserData()
  }
  async prepareUserData() {
    let { getString, prefs: prefsFromProps } = this.props;
    let { personalData, preferences, links } = this.state;

    let user = this.props.user
    user.initials = this.returnUserInitals(user)

    for (var [k, v] of Object.entries(user)) {
      if (Object.keys(personalData.data).includes(k))
        personalData.data[k] = v
      else if (Object.keys(preferences.data).includes(k))
        preferences.data[k] = v
      else if (Object.keys(links.data).includes(k)) {
        links.data[k] = v
        links.items = this.prepareLinkItems(v)
      }
    }

    // Currencies
    let currencies = await this.props.managers.app.currenciesForSelect()
    for (var c of currencies)
      if (prefsFromProps.currency == c.value)
        preferences.data.currency = c

    // Languages
    let langList = localeList()
    let languages = []
    for (var id of langList) {
      let option = {
        value: id,
        label: getString(prefsFromProps.locale, "languages", id)
      }
      languages.push(option)

      if (prefsFromProps.locale == id)
        preferences.data.locale = option
    }

    personalData.initial = deepCloneObj(personalData.data)
    preferences.initial = deepCloneObj(preferences.data)

    this.setState({
      personalData,
      prefs: preferences,
      links: links,
      currencies, languages,
    })
  }
  prepareLinkItems(linkList) {
    let items = []

    for (var link of linkList) {
      let link_obj = {
        data: { name: link.name, url: link.url },
        states: { name: "has-success", url: "has-success" },
        isValidated: true
      }
      link_obj.initial = deepCloneObj(link_obj.data)

      items.push(link_obj)
    }

    return items
  }
  prepareLinkData(linkItems) {
    let data = []

    for (var link of linkItems) {
      if (link.isValidated)
        data.push({
          name: link.data.name,
          url: link.data.url
        })
    }
    return data
  }

  returnUserInitals(user) {
    let name = getFirstAndLastName(`${user.first_name} ${user.last_name}`)

    let userInitials = getInitials(name)

    return userInitials
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

        if (verifyLength(value, 3, 32)) {
          if (verifyUsernameStr(value)) {
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
        }
        else {
          // Username is too short or too long
          newState[type].data.username_msgId = "error_username_length"
          newState[type].states[fieldName] = "has-danger"
        }
        break;
      case "first_name":
        if (verifyLength(value, 3) && verifyOnlyLetters(value)) {
          newState[type].states[fieldName] = "has-success";
          newState[type].data.initials = getInitials(`${value} ${newState[type].data.last_name}`)
        }
        else
          newState[type].states[fieldName] = "has-danger";
        break;
      case "last_name":
        if (verifyLength(value, 3) && verifyOnlyLetters(value)) {
          newState[type].states[fieldName] = "has-success";
          newState[type].data.initials = getInitials(`${newState[type].data.first_name} ${value}`)
        }
        else
          newState[type].states[fieldName] = "has-danger";
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
      case "currency":
        newState[type].states[fieldName] = "has-success"
        break;
      case "locale":
        newState[type].states[fieldName] = "has-success"
        break;
    }

    newState[type].isValidated = this.isValidated(newState[type])

    this.setState(newState)
  }
  onLinkChange(itemIndex, fieldName, value) {
    let newState = { links: this.state.links };

    if (this.state.labelAlertState !== null) {
      newState.alertState = null
      newState.alertMsg = ""
    }

    newState.links.items[itemIndex].data[fieldName] = value

    switch (fieldName) {
      case "name":
        if (verifyLength(value, 1))
          newState.links.items[itemIndex].states[fieldName] = "has-success"
        else
          newState.links.items[itemIndex].states[fieldName] = "has-danger"
        break;
      case "url":
        if (verifyURL(value))
          newState.links.items[itemIndex].states[fieldName] = "has-success"
        else
          newState.links.items[itemIndex].states[fieldName] = "has-danger"
        break;
    }

    newState.links.items[itemIndex].isValidated = this.isLinkValidated(newState.links.items[itemIndex])
    newState.links.isValidated = this.areLinksValidated(newState.links.items)

    // Prepare links for database...
    newState.links.data.links = this.prepareLinkData(newState.links.items)

    this.setState(newState)
  }
  onLinkCommit(action, item) {
    let { links } = this.state;

    switch (action) {
      case "add":
        links.items.push(item)
        break;
      case "delete":
        // item here means 'index'.
        links.items.splice(item, 1)
        break;
      case "sort":
        // item here means 'items' (plural). It's triggered every time the items are reordered.
        links.items = item
        break;
    }

    links.isValidated = this.areLinksValidated(links.items)

    // Prepare links for database....
    links.data.links = this.prepareLinkData(links.items)

    this.setState({ links })
  }

  isValidated(obj) {
    if (areObjsEqual(obj.data, obj.initial))
      return false

    if (Object.values(obj.states).includes("has-danger"))
      return false

    return true
  }
  isLinkValidated(obj) {
    for (var state of Object.values(obj.states))
      if (state != "has-success")
        return false

    return true
  }
  areLinksValidated(objs) {
    for (var link of objs)
      if (!link.isValidated)
        return false

    return true
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

  onClick(action, context, obj) {
    switch (action) {
      case "addLink":
        this.addLinkClick()
        break;
      case "save":
        this.saveClick(context, obj)
        break;
    }
  }
  addLinkClick() {
    let link = {
      data: { name: "", url: "https://" },
      initial: { name: "", url: "https://" },
      states: { name: "", url: "" },
      isValidated: undefined
    }

    this.onLinkCommit("add", link)
  }
  async saveClick(context, obj) {
    obj.isLoading = true
    this.setState({ [context]: obj })

    let obj_data = deepCloneObj(obj.data)

    for (let [k, v] of Object.entries(obj_data)) {
      switch (k) {
        case "birthday":
          if (v)
            obj_data[k] = TimeManager.getDateString(v)
          else
            obj_data[k] = v
          break;
        case "first_name":
          obj_data[k] = trim(v)
          break;
        case "last_name":
          obj_data[k] = trim(v)
          break;
        case "links":
          obj_data[k] = v
          break;
        default:
          if (typeof v === "object") {
            // Data from Selects {value: "", label: ""} must be readable for the API. So, just considers the field 'value'
            obj_data[k] = v ? v.value : v
          }
          else {
            obj_data[k] = v
          }
          break;
      }
    }

    await this.props.managers.auth.userUpdate(obj_data)

    obj.isLoading = false
    obj.isValidated = undefined
    obj.states = {}
    obj.initial = deepCloneObj(obj.data)

    this.setState({ [context]: obj })
  }

  isDateValid(date) {
    var today = new Date()
    return date.isBefore(today) ? true : false
  }
  hideAlert() {
    this.setState({
      alert: null
    });
  };
  toggleModal(modalId) {
    this.setState({ [`modal_${modalId}_isOpen`]: !this.state[`modal_${modalId}_isOpen`] });
  };

  render() {
    let { getString, prefs } = this.props;
    let {
      isCheckingUsername,

      modal_changePassword_isOpen,

      personalData,
      preferences,
      links,

      currencies,
      languages,

      alert
    } = this.state;

    return (
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
                <h5 className="title">{getString(prefs.locale, this.compId, "title_personalData")}</h5>
              </CardHeader>
              <CardBody>
                <Row className="justify-content-center">
                  {/* Email */}
                  <Col md="8" sm="8" xs="8">
                    <FormGroup>
                      <label>{getString(prefs.locale, this.compId, "input_email")}</label>
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
                      className="btn-round"
                      size="sm"
                      color="default"
                      outline
                      onClick={() => this.toggleModal("changePassword")}
                    >
                      {getString(prefs.locale, this.compId, "btn_changePassword")}
                    </Button>
                  </Col>
                </Row>
                <Row className="justify-content-center">
                  {/* Username */}
                  <Col md="8" sm="8" xs="8">
                    <FormGroup className={`has-label ${personalData.states.username}`}>
                      <label>{getString(prefs.locale, this.compId, "input_username")}</label>
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
                        getString(prefs.locale, this.compId, personalData.data.username_msgId)
                      }
                    </label>
                  </Col>
                </Row>
                <Row>
                  {/* First Name */}
                  <Col md="6">
                    <FormGroup className={`has-label ${personalData.states.first_name}`}>
                      <label>{getString(prefs.locale, this.compId, "input_firstName")}</label>
                      <Input
                        placeholder={getString(prefs.locale, this.compId, "input_firstName")}
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
                      <label>{getString(prefs.locale, this.compId, "input_lastName")}</label>
                      <Input
                        placeholder={getString(prefs.locale, this.compId, "input_lastName")}
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
                      <label>{getString(prefs.locale, this.compId, "input_nationality")}</label>
                      <Input
                        value={getString(prefs.locale, "countries", String(personalData.data.nationality).toLowerCase())}
                        placeholder={getString(prefs.locale, this.compId, "input_nationality")}
                        type="text"
                        disabled
                      />
                    </FormGroup>
                  </Col>
                  {/* Birthday */}
                  <Col md="6">
                    <FormGroup className={`has-label ${personalData.states.birthday}`}>
                      <label>{getString(prefs.locale, this.compId, "input_birthday")}
                        {" "}
                        <i id="input_birthday_hint" className="nc-icon nc-alert-circle-i" />
                      </label>
                      <UncontrolledTooltip placement="top-end" target="input_birthday_hint">
                        <label>{getString(prefs.locale, this.compId, "input_birthday_hint")}</label>
                      </UncontrolledTooltip>
                      <ReactDatetime
                        inputProps={{
                          className: "form-control",
                          placeholder: this.props.getString(prefs.locale, "generic", "input_select")
                        }}
                        locale={getString(prefs.locale, "locales", prefs.locale)}
                        value={personalData.data.birthday && TimeManager.getMoment(personalData.data.birthday, true)}
                        onChange={value => this.onSelectChange("personalData", "birthday", value)}
                        isValidDate={this.isDateValid}
                        timeFormat={false}
                        viewMode="years"
                        closeOnSelect
                      />
                    </FormGroup>
                  </Col>
                </Row>
                {/* About Me */}
                <FormGroup>
                  <label>{getString(prefs.langId, this.compId, "input_aboutMe")}</label>
                  <Input
                    className="textarea"
                    type="textarea"
                    name="about_me"
                    value={personalData.data.about_me}
                    onChange={e => this.onChange("personalData", e.target.name, e.target.value)}
                  />
                </FormGroup>
              </CardBody>
              <CardFooter>
                <Row className="centered">
                  <Col lg="4" md="6" xs="6">
                    <Button
                      block
                      type="submit"
                      className="btn-simple btn-round"
                      color="success"
                      name="btnSavePersonalData"
                      disabled={personalData.isValidated ? false : true}
                      onClick={() => this.onClick("save", "personalData", personalData)}
                    >
                      {personalData.isLoading ?
                        <Spinner size="sm" /> :
                        getString(prefs.locale, this.compId, "btn_save")
                      }
                    </Button>
                  </Col>
                </Row>
              </CardFooter>
            </Card>
            {/* Links */}
            <Card>
              <CardHeader>
                <Row>
                  <Col>
                    <h5 className="title">{getString(prefs.locale, this.compId, "title_links")}</h5>
                  </Col>
                  <Col className="text-right">
                    <Button className="btn-icon btn-round"
                      size="sm"
                      color="success"
                      outline
                      onClick={() => this.onClick("addLink")}
                    >
                      <i className="nc-icon nc-simple-add" />
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <SortableLinks
                  prefs={prefs}
                  getString={getString}
                  items={links.items}
                  onChangeItem={this.onLinkChange}
                  onLinkCommit={this.onLinkCommit} />
              </CardBody>
              <CardFooter>
                <Row className="centered">
                  <Col lg="4" md="6" xs="6">
                    <Button
                      block
                      type="submit"
                      className="btn-simple btn-round"
                      color="success"
                      name="btnSaveLinks"
                      disabled={links.isValidated ? false : true}
                      onClick={() => this.onClick("save", "links", links)}
                    >
                      {links.isLoading ?
                        <Spinner size="sm" /> :
                        getString(prefs.locale, this.compId, "btn_save")
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
                <h5 className="title">{getString(prefs.locale, this.compId, "title_prefs")}</h5>
              </CardHeader>
              <CardBody>
                {/* Language */}
                <FormGroup>
                  <label>{getString(prefs.locale, this.compId, "input_language")}</label>
                  <Select
                    className="react-select primary"
                    classNamePrefix="react-select"
                    name="locale"
                    value={preferences.data.locale}
                    onChange={value => this.onSelectChange("prefs", "locale", value)}
                    options={languages}
                    placeholder={getString(prefs.locale, "generic", "input_select")}
                  />
                </FormGroup>
                {/* Currency */}
                <FormGroup>
                  <label>
                    {getString(prefs.locale, this.compId, "input_currency")}
                    {" "}
                    <i id="input_currency_hint" className="nc-icon nc-alert-circle-i" />
                  </label>
                  <UncontrolledTooltip placement="top-end" target="input_currency_hint">
                    {getString(prefs.locale, this.compId, "input_currency_hint")}
                  </UncontrolledTooltip>
                  <Select
                    className="react-select primary"
                    classNamePrefix="react-select"
                    name="currency"
                    value={preferences.data.currency}
                    onChange={value => this.onSelectChange("prefs", "currency", value)}
                    options={currencies}
                    placeholder={getString(prefs.locale, "generic", "input_select")}
                  />
                </FormGroup>
              </CardBody>
              <CardFooter>
                <Row className="centered">
                  <Col lg="8" md="8" xs="6">
                    <Button
                      block
                      type="submit"
                      className="btn-simple btn-round"
                      color="success"
                      name="btnSaveprefs"
                      disabled={preferences.isValidated ? false : true}
                      onClick={() => this.onClick("save", "prefs", preferences)}
                    >
                      {preferences.isLoading ?
                        <Spinner size="sm" /> :
                        getString(prefs.locale, this.compId, "btn_save")
                      }
                    </Button>
                  </Col>
                </Row>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default MyAccount;

MyAccount.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setAuthStatus: PropTypes.func.isRequired
}