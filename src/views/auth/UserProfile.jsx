import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
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

import { areObjsEqual, deepCloneObj } from "../../core/utils";
import { getLangList } from "../../core/lang";

class UserProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      sendingEmail: false,

      initial_personalData: {},
      personalData: {
        data: {
          email: "",
          first_name: "",
          last_name: "",
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
    let { getString, prefs: prefsFromProps } = this.props;
    let { langId, personalData, prefs } = this.state;

    let user = await this.props.managers.auth.storedUser()
    user = user.user

    for (var [k, v] of Object.entries(user)) {
      if (Object.keys(personalData.data).includes(k))
        personalData.data[k] = v
      else if (Object.keys(prefs).includes(k))
        prefs.data[k] = v
    }

    // Currencies
    let currencies = await this.props.managers.app.currenciesForSelect()
    for (var c of currencies)
      if (prefsFromProps.currency == c.value)
        prefs.data.pref_currency = c

    // Languagues
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
      initial_personalData, personalData,
      initial_prefs, prefs,
      currencies, languages,
    })
  }

  // function that verifies if a string has a given length or not
  verifyLength = (value, length) => {
    if (value.length >= length) {
      return true;
    }
    return false;
  };
  // function that verifies if a string has only letters
  verifyOnlyLetters = (value) => {
    return /^[a-zA-Z]+$/.test(value);
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
        if (this.verifyLength(event.target.value, 3) && this.verifyOnlyLetters(event.target.value))
          newState[type].states[stateName] = "has-success";
        else
          newState[type].states[stateName] = "has-danger";
        break;
      case "last_name":
        if (this.verifyLength(event.target.value, 3) && this.verifyOnlyLetters(event.target.value))
          newState[type].states[stateName] = "has-success";
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

      personalData,
      prefs,

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
              <Card className="card-user">
                <div className="image">
                  <img
                    alt="..."
                    src={"/static/app/assets/img/bg/damir-bosnjak.jpg"}
                  />
                </div>
                <CardBody>
                  <div className="author">
                    <a href="" onClick={e => e.preventDefault()}>
                      <img
                        alt="..."
                        className="avatar border-gray"
                        src={"/static/app/assets/img/mike.jpg"}
                      />
                      <h5 className="title">{personalData.data.first_name}{" "}{personalData.data.last_name}</h5>
                    </a>
                    <p className="description">@chetfaker</p>
                  </div>
                  <p className="description text-center">
                    "I like the way you work it <br />
                    No diggity <br />I wanna bag it up"
                  </p>
                </CardBody>
                <CardFooter>
                  <hr />
                  <div className="button-container">
                    <Row>
                      <Col className="ml-auto" lg="3" md="6" xs="6">
                        <h5>
                          12 <br />
                          <small>Files</small>
                        </h5>
                      </Col>
                      <Col className="ml-auto mr-auto" lg="4" md="6" xs="6">
                        <h5>
                          2GB <br />
                          <small>Used</small>
                        </h5>
                      </Col>
                      <Col className="mr-auto" lg="3">
                        <h5>
                          24,6$ <br />
                          <small>Spent</small>
                        </h5>
                      </Col>
                    </Row>
                  </div>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle tag="h4">Team Members</CardTitle>
                </CardHeader>
                <CardBody>
                  <ul className="list-unstyled team-members">
                    <li>
                      <Row>
                        <Col md="2" xs="2">
                          <div className="avatar">
                            <img
                              alt="..."
                              className="img-circle img-no-padding img-responsive"
                              src={"/static/assets/img/faces/ayo-ogunseinde-2.jpg"}
                            />
                          </div>
                        </Col>
                        <Col md="7" xs="7">
                          DJ Khaled <br />
                          <span className="text-muted">
                            <small>Offline</small>
                          </span>
                        </Col>
                        <Col className="text-right" md="3" xs="3">
                          <Button
                            className="btn-round btn-icon"
                            color="success"
                            outline
                            size="sm"
                          >
                            <i className="fa fa-envelope" />
                          </Button>
                        </Col>
                      </Row>
                    </li>
                    <li>
                      <Row>
                        <Col md="2" xs="2">
                          <div className="avatar">
                            <img
                              alt="..."
                              className="img-circle img-no-padding img-responsive"
                              src={"/static/assets/img/faces/joe-gardner-2.jpg"}
                            />
                          </div>
                        </Col>
                        <Col md="7" xs="7">
                          Creative Tim
                          <br />
                          <span className="text-success">
                            <small>Available</small>
                          </span>
                        </Col>
                        <Col className="text-right" md="3" xs="3">
                          <Button
                            className="btn-round btn-icon"
                            color="success"
                            outline
                            size="sm"
                          >
                            <i className="fa fa-envelope" />
                          </Button>
                        </Col>
                      </Row>
                    </li>
                    <li>
                      <Row>
                        <Col md="2" xs="2">
                          <div className="avatar">
                            <img
                              alt="..."
                              className="img-circle img-no-padding img-responsive"
                              src={"/static/assets/img/faces/clem-onojeghuo-2.jpg"}
                            />
                          </div>
                        </Col>
                        <Col className="col-ms-7" xs="7">
                          Flume <br />
                          <span className="text-danger">
                            <small>Busy</small>
                          </span>
                        </Col>
                        <Col className="text-right" md="3" xs="3">
                          <Button
                            className="btn-round btn-icon"
                            color="success"
                            outline
                            size="sm"
                          >
                            <i className="fa fa-envelope" />
                          </Button>
                        </Col>
                      </Row>
                    </li>
                  </ul>
                </CardBody>
              </Card>
            </Col>
            {/* Edit Profile */}
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