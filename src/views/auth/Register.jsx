import React from "react";
import PropTypes from "prop-types";

import { Redirect } from "react-router-dom";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Col,
  Container,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Label,
  Row,
  Spinner
} from "reactstrap";
import Select from "react-select";

import ModalUserCreated from "../../views/modals/auth/ModalUserCreated";

// CORE
import { project } from "../../core/projectData";
import LabelAlert from "../../components/LabelAlert";
import {
  orderBy,

  compare,
  verifyEmail,
  verifyLength,
  verifyOnlyLetters,
  verifyUsernameStr
} from "../../core/utils";
// --------------------


class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isLoading: false,
      redirectToForgotPassword: undefined,
      // Any change in user object must be reflected at this.clearInputFields()
      user: {
        data: {
          fullname: "",
          email: "",
          username: "",
          password: "",
          nationality: null,
          cbTerms: false
        },
        states: {
          fullname: "",
          email: "",
          username: "",
          password: "",
          nationality: "",
          cbTerms: ""
        },
        isValidated: undefined
      },

      nationalities: [],

      btnForgotPassword_isHidden: true,
      modal_userCreated_isOpen: false,
      alertState: null,
      alertMsg: ""
    };

    this.toggleModal = this.toggleModal.bind(this)
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }
  componentDidMount() {
    document.body.classList.toggle("register-page");
    this.getCountries()
  }
  componentWillUnmount() {
    document.body.classList.toggle("register-page");
  }

  async getCountries() {
    let { getString } = this.props
    let { langId } = this.state
    let nList = [{
      value: 0,
      label: String(" " + this.props.getString(this.state.langId, this.state.compId, "input_nationality")),
      isDisabled: true
    }]
    let cList = await this.props.managers.app.countryList()

    if (cList.data) {
      cList.data.forEach(obj => {
        nList.push({ value: obj.code, label: getString(langId, "countries", obj.code.toLowerCase()) })
      })
      nList = orderBy(nList, ["label"])
      this.setState({ nationalities: nList })
    }
  }

  clearInputFields = () => {
    let user = {
      data: {
        fullname: "",
        email: "",
        username: "",
        password: "",
        nationality: null,
        cbTerms: false
      },
      states: {
        fullname: "",
        email: "",
        username: "",
        password: "",
        nationality: "",
        cbTerms: ""
      },
      isValidated: undefined
    }

    this.setState({ user });
  };

  // function that hide modalNotice
  toggleModalNotice = () => {
    this.setState({
      modalNotice: !this.state.modalNotice
    });
  };
  toggleBtnCreateAccount = value => {
    this.setState({
      btnCreateAccount: value
    });
  }

  onSelectChange(fieldName, value) {
    let newState = { user: this.state.user }

    newState.user.data[fieldName] = value

    switch (fieldName) {
      case "nationality":
        newState.user.states[fieldName] = "has-success"
        break;
      default:
        break;
    }

    newState.user.isValidated = this.isValidated(newState.user)

    this.setState(newState)
  }
  onChange = (fieldName, value, fieldNameEqualTo) => {
    let newState = { user: this.state.user };

    if (this.state.labelAlertState !== null)
      this.setState({
        alertState: null,
        alertMsg: ""
      })

    newState.user.data[fieldName] = value

    switch (fieldName) {
      case "fullname":
        if (verifyLength(value, 3) && verifyOnlyLetters(value)) {
          newState.user.states[fieldName] = "has-success"
        } else {
          newState.user.states[fieldName] = "has-danger"
        }
        break;
      case "email":
        if (verifyEmail(value)) {
          newState.user.states[fieldName] = "has-success"
        } else {
          newState.user.states[fieldName] = "has-danger"
        }
        break;
      case "username":
        newState.user.data.username_msgId = ""
        newState.user.data[fieldName] = value.toLowerCase()     // Keep it lowercase

        if (verifyLength(value, 3) && verifyUsernameStr(value)) {
          newState.user.states[fieldName] = "has-success"
        } else {
          newState.user.data.username_msgId = "error_username_minReq"
          newState.user.states[fieldName] = "has-danger"
        }
        break;
      case "password":
        if (verifyLength(value, 8)) {
          newState.user.states[fieldName] = "has-success"
        } else {
          newState.user.states[fieldName] = "has-danger"
        }
        break;
      case "confirmPassword":
        if (newState.user.states[fieldNameEqualTo] === "has-success") {
          if (compare(value, newState.user.data[fieldNameEqualTo])) {
            newState.user.states[fieldName] = "has-success"
            newState.user.states[fieldNameEqualTo] = "has-success"
          } else {
            newState.user.states[fieldName] = "has-danger"
          }
        }
        break;
      case "cbTerms":
        if (value) {
          newState.user.states[fieldName] = "has-success"
        } else {
          newState.user.states[fieldName] = "has-danger"
        }
        break;
      default:
        break;
    }

    newState.user.isValidated = this.isValidated(newState.user)

    this.setState(newState)
  };

  async registerClick(user) {
    this.setState({ isLoading: true })

    let names = String(user.data.fullname).split(" ")
    let firstname = names[0]
    names.shift()
    let lastname = names.join(" ")

    let data = {
      first_name: firstname,
      last_name: lastname,
      username: user.data.username,
      email: user.data.email,
      password: user.data.password,
      nationality: user.data.nationality.value,
      langId: this.state.langId
    };

    let result = await this.props.managers.auth.userRegister(data)

    if (result.status == 200) {
      this.setState({ isLoading: false });
      this.toggleModal("userCreated")
      this.clearInputFields();
    }
    else {
      let msg = await this.props.getHttpTranslation(result, this.state.compId, "user")

      if (msg.id == "user_usernameAlreadyExists")
        user.states.username = "has-danger"

      this.setState({
        user,
        isLoading: false,
        alertState: "has-danger",
        btnForgotPassword_isHidden: msg.id == "user_emailAlreadyExists" ? false : true,
        alertMsg: msg.text
      })
    }
  };

  isValidated(obj) {
    for (var state of Object.values(obj.states))
      if (state != "has-success")
        return false

    return true
  }

  toggleModal(modalId) {
    this.setState({ ["modal_" + modalId + "_isOpen"]: !this.state["modal_" + modalId + "_isOpen"] });
  };

  render() {
    let { getString } = this.props;
    let {
      // register form
      langId,
      compId,
      isLoading,
      redirectToForgotPassword,
      user,

      nationalities,

      btnForgotPassword_isHidden,
      modal_userCreated_isOpen,
      alertState,
      alertMsg
    } = this.state;

    return (
      <div className="register-page">
        <ModalUserCreated
          {...this.props}
          modalId="userCreated"
          isOpen={modal_userCreated_isOpen}
          toggleModal={this.toggleModal}
        />
        <Container>
          <Row>
            <Col className="ml-auto" lg="5" md="5">
              <div className="info-area info-horizontal mt-5">
                <div className="icon icon-primary">
                  <i className="nc-icon nc-watch-time" />
                </div>
                <div className="description">
                  <h5 className="info-title">{getString(langId, compId, "leftArea_infoTitle1")}</h5>
                  <p className="description">
                    {getString(langId, compId, "leftArea_infoDesc1")}
                  </p>
                </div>
              </div>
              <div className="info-area info-horizontal mt-5">
                <div className="icon icon-primary">
                  <i className="nc-icon nc-bell-55" />
                </div>
                <div className="description">
                  <h5 className="info-title">{getString(langId, compId, "leftArea_infoTitle2")}</h5>
                  <p className="description">
                    {getString(langId, compId, "leftArea_infoDesc2")}
                  </p>
                </div>
              </div>
              <div className="info-area info-horizontal mt-5">
                <div className="icon icon-primary">
                  <i className="nc-icon nc-bulb-63" />
                </div>
                <div className="description">
                  <h5 className="info-title">{getString(langId, compId, "leftArea_infoTitle3")}</h5>
                  <p className="description">
                    {getString(langId, compId, "leftArea_infoDesc3")}
                  </p>
                </div>
              </div>
            </Col>
            <Col className="mr-auto" lg="4" md="6">
              <Card className="card-signup text-center">
                <CardHeader>
                  <CardTitle tag="h4">
                    {getString(langId, compId, "card_header")}
                  </CardTitle>
                  {/* <div className="social">
                    <Button className="btn-icon btn-round" color="twitter">
                      <i className="fa fa-twitter" />
                    </Button>
                    <Button className="btn-icon btn-round" color="linkedin">
                      <i className="fa fa-linkedin" />
                    </Button>
                    <Button className="btn-icon btn-round" color="facebook">
                      <i className="fa fa-facebook-f" />
                    </Button>
                    <p className="card-description">{getString(langId, compId, "info_orBeCassical")}</p>
                  </div> */}
                </CardHeader>
                <CardBody>
                  <Form action="" className="form" method="">
                    {/* Full Name */}
                    <InputGroup className={`has-label ${user.states.fullname}`}>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="nc-icon nc-single-02" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder={getString(langId, compId, "input_fullName")}
                        type="text"
                        name="fullname"
                        value={user.data.fullname}
                        onChange={e => this.onChange("fullname", e.target.value)}
                      />
                    </InputGroup>
                    <Row className="mt-4" />
                    {/* Email */}
                    <InputGroup className={`has-label ${user.states.email}`}>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="nc-icon nc-email-85" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder={getString(langId, compId, "input_email")}
                        name="email"
                        type="email"
                        value={user.data.email}
                        onChange={e => this.onChange("email", e.target.value)}
                      />
                    </InputGroup>
                    {/* Username */}
                    <InputGroup className={`has-label ${user.states.username}`}>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="nc-icon nc-badge" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder={getString(langId, compId, "input_username")}
                        name="username"
                        type="username"
                        value={user.data.username}
                        onChange={e => this.onChange("username", e.target.value)}
                      />
                    </InputGroup>
                    <label>
                      {user.states.username === "has-danger" &&
                        getString(langId, compId, user.data.username_msgId)
                      }
                    </label>
                    {/* Password */}
                    <InputGroup className={`has-label ${user.states.password}`}>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="nc-icon nc-key-25" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder={getString(langId, compId, "input_password")}
                        id="password"
                        name="password"
                        type="password"
                        value={user.data.password}
                        autoComplete="off"
                        onChange={e => this.onChange("password", e.target.value)}
                      />
                      {user.states.password === "has-danger" ? (
                        <label className="error">
                          {getString(langId, compId, "error_passwordLength")}
                        </label>
                      ) : null}
                    </InputGroup>
                    <Row className="mt-4" />
                    {/* Nationality */}
                    <Col md="100%" className="text-left">
                      <Select
                        className="react-select primary"
                        classNamePrefix="react-select"
                        name="nationality"
                        value={user.data.nationality}
                        onChange={value => this.onSelectChange("nationality", value)}
                        options={nationalities}
                        placeholder={getString(langId, compId, "input_nationality")}
                      />
                    </Col>
                    {/* Privacy Policy */}
                    <InputGroup className={`has-label ${user.states.cbTerms}`}>
                      <FormGroup check className="text-left">
                        <Label check>
                          <Input
                            type="checkbox"
                            name="cbTerms"
                            checked={user.data.cbTerms}
                            onChange={e => this.onChange("cbTerms", e.target.checked)} />
                          <span className="form-check-sign" />
                          {getString(langId, compId, "checkbox_iAgreeToThe") + " "}
                          <a href="#" onClick={e => e.preventDefault()}>
                            {getString(langId, compId, "checkbox_privacyPolicy")}
                          </a>
                        </Label>
                      </FormGroup>
                      {user.states.cbTerms === "has-danger" ? (
                        <label className="error">
                          {getString(langId, compId, "error_acceptPrivacyPolicy")}
                        </label>
                      ) : null}
                    </InputGroup>
                  </Form>
                </CardBody>
                <CardFooter>
                  <Button
                    type="submit"
                    className="btn-round"
                    color="primary"
                    disabled={user.isValidated ? false : true}
                    onClick={() => this.registerClick(user)}
                  >
                    {isLoading ?
                      <Spinner size="sm" /> :
                      getString(langId, compId, "btn_createAccount")}
                  </Button>
                  <LabelAlert alertState={alertState} alertMsg={alertMsg} />
                  <br />
                  {redirectToForgotPassword ? <Redirect to="/auth/forgotpassword" /> : null}
                  {btnForgotPassword_isHidden ?
                    null :
                    <Button 
                      className="btn-link btn-neutral" 
                      color="default" 
                      onClick={() => this.setState({redirectToForgotPassword:true})}>
                      {getString(langId, compId, "btn_forgotPassword")}?
                    </Button>
                  }
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </Container>
        <div
          className="full-page-background"
          style={{
            backgroundImage: `url(${project.img.bg.app_light.src})`
          }}
        />
      </div>
    );
  }
}

export default Register;

Register.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired
}