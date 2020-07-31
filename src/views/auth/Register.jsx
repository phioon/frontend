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
  verifyOnlyLetters
} from "../../core/utils";
// --------------------


class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isLoading: false,

      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      nationality: null,
      cbTerms: false,

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
    this.setState({
      firstname: "",
      firstnameState: "",
      lastname: "",
      lastnameState: "",
      email: "",
      emailState: "",
      password: "",
      passwordState: "",
      confirmPasswordState: "",
      nationality: null,
      cbTerms: false,
      cbTermsState: ""
    });
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

  onChange = (event, stateName, type, stateNameEqualTo) => {
    if (this.state.labelAlertState !== null)
      this.setState({
        alertState: null,
        alertMsg: ""
      })

    if (type !== "checkbox") {
      this.setState({ [stateName]: event.target.value })
    } else {
      this.setState({ [stateName]: event.target.checked })
    }

    switch (type) {
      case "firstname":
        if (verifyLength(event.target.value, 3) && verifyOnlyLetters(event.target.value)) {
          this.setState({ [stateName + "State"]: "has-success" });
        } else {
          this.setState({ [stateName + "State"]: "has-danger" });
        }
        break;
      case "lastname":
        if (verifyLength(event.target.value, 3) && verifyOnlyLetters(event.target.value)) {
          this.setState({ [stateName + "State"]: "has-success" });
        } else {
          this.setState({ [stateName + "State"]: "has-danger" });
        }
        break;
      case "email":
        if (verifyEmail(event.target.value)) {
          this.setState({ [stateName + "State"]: "has-success" });
        } else {
          this.setState({ [stateName + "State"]: "has-danger" });
        }
        break;
      case "password":
        if (verifyLength(event.target.value, 8)) {
          this.setState({ [stateName + "State"]: "has-success" });
        } else {
          this.setState({ [stateName + "State"]: "has-danger" });
        }
        break;
      case "equalTo":
        if (this.state[stateNameEqualTo + "State"] === "has-success") {
          if (compare(event.target.value, this.state[stateNameEqualTo])) {
            this.setState({ [stateName + "State"]: "has-success" });
            this.setState({ [stateNameEqualTo + "State"]: "has-success" });
            this.setState({ [stateName + "Value"]: event.target.value });
          } else {
            this.setState({ [stateName + "State"]: "has-danger" });
          }
        }
        break;
      case "checkbox":
        if (event.target.checked) {
          this.setState({ [stateName + "State"]: "has-success" });
        } else {
          this.setState({ [stateName + "State"]: "has-danger" });
        }
        break;
      default:
        break;
    }
  };

  async registerClick(e) {
    e.preventDefault();
    this.setState({ isLoading: true })

    if (this.state.emailState === "") {
      this.setState({ emailState: "has-danger" });
    }
    if (
      this.state.passwordState === "" ||
      this.state.confirmPasswordState === ""
    ) {
      this.setState({ passwordState: "has-danger" });
      this.setState({ confirmPasswordState: "has-danger" });
    }

    let user = {
      username: this.state.email,
      email: this.state.email,
      first_name: this.state.firstname,
      last_name: this.state.lastname,
      password: this.state.confirmPassword,
      nationality: this.state.nationality.value,
      langId: this.state.langId
    };

    let result = await this.props.managers.auth.userRegister(user)

    if (result.status == 200) {
      this.setState({ isLoading: false });
      this.toggleModal("userCreated")
      this.clearInputFields();
    }
    else {
      let msg = await this.props.getHttpTranslation(result, this.state.compId, "user")
      this.setState({
        isLoading: false,
        alertState: "has-danger",
        forgotPassword_isHidden: msg.id == "user_alreadyExists" ? false : true,
        alertMsg: msg.text
      })
    }
  };

  toggleModal(modalId) {
    this.setState({ ["modal_" + modalId + "_isOpen"]: !this.state["modal_" + modalId + "_isOpen"] });
  };

  render() {
    let { getString } = this.props;

    // taking all the states
    let {
      // register form
      langId,
      compId,
      isLoading,

      firstname,
      firstnameState,
      lastname,
      lastnameState,
      email,
      emailState,
      password,
      passwordState,
      confirmPassword,
      confirmPasswordState,
      nationality,
      cbTerms,
      cbTermsState,

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
                    {/* First Name */}
                    <InputGroup className={`has-label ${firstnameState}`}>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="nc-icon nc-single-02" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder={getString(langId, compId, "input_firstName")}
                        type="text"
                        name="firstname"
                        value={firstname}
                        onChange={e => this.onChange(e, e.target.name, "firstname")}
                      />
                    </InputGroup>
                    {/* Last Name */}
                    <InputGroup className={`has-label ${lastnameState}`}>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="nc-icon nc-circle-10" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder={getString(langId, compId, "input_lastName")}
                        type="text"
                        name="lastname"
                        value={lastname}
                        onChange={e => this.onChange(e, e.target.name, "lastname")}
                      />
                    </InputGroup>
                    <Row className="mt-4" />
                    {/* Email */}
                    <InputGroup className={`has-label ${emailState}`}>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="nc-icon nc-email-85" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder={getString(langId, compId, "input_email")}
                        name="email"
                        type="email"
                        value={email}
                        onChange={e => this.onChange(e, e.target.name, "email")}
                      />
                      {/* {emailState === "has-danger" ? (
                        <label className="error">
                          {getString(langId, compId, "error_enterValidEmail")}
                        </label>
                      ) : null} */}
                    </InputGroup>
                    <Row className="mt-4" />
                    {/* Password */}
                    <InputGroup className={`has-label ${passwordState}`}>
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
                        value={password}
                        autoComplete="off"
                        onChange={e =>
                          this.onChange(e, e.target.name, "password")
                        }
                      />
                      {passwordState === "has-danger" ? (
                        <label className="error">
                          {getString(langId, compId, "error_passwordLength")}
                        </label>
                      ) : null}
                    </InputGroup>
                    {/* Confirm Password */}
                    <InputGroup className={`has-label ${confirmPasswordState}`}>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="nc-icon nc-key-25" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder={getString(
                          langId,
                          compId,
                          "input_confirmPassword"
                        )}
                        equalto="#password"
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        autoComplete="off"
                        onChange={e =>
                          this.onChange(e, e.target.name, "equalTo", "password")
                        }
                      />
                      {confirmPasswordState === "has-danger" ? (
                        <label className="error">
                          {getString(langId, compId, "error_passwordMatch")}
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
                        value={nationality}
                        onChange={value =>
                          this.setState({ nationality: value })
                        }
                        options={nationalities}
                        placeholder={getString(langId, compId, "input_nationality")}
                      />
                    </Col>
                    {/* Privacy Policy */}
                    <InputGroup className={`has-label ${cbTermsState}`}>
                      <FormGroup check className="text-left">
                        <Label check>
                          <Input
                            type="checkbox"
                            name="cbTerms"
                            checked={cbTerms}
                            onChange={e => this.onChange(e, e.target.name, "checkbox")} />
                          <span className="form-check-sign" />
                          {getString(langId, compId, "checkbox_iAgreeToThe") + " "}
                          <a href="#dosomething" onClick={e => e.preventDefault()}>
                            {getString(langId, compId, "checkbox_privacyPolicy")}
                          </a>
                        </Label>
                      </FormGroup>
                      {/* {cbTermsState === "has-danger" ? (
                        <label className="error">
                          {getString(langId, compId, "error_acceptPrivacyPolicy")}
                        </label>
                      ) : <br />} */}
                    </InputGroup>
                  </Form>
                </CardBody>
                <CardFooter>
                  <Button
                    type="submit"
                    className="btn-round"
                    color="primary"
                    disabled={
                      compare(password, confirmPassword) &&
                        this.state.cbTermsState === "has-success" &&
                        this.state.nationality !== null &&
                        this.state.confirmPasswordState === "has-success" &&
                        this.state.passwordState === "has-success" &&
                        this.state.emailState === "has-success" &&
                        this.state.lastnameState === "has-success" &&
                        this.state.firstnameState === "has-success" ?
                        false : true
                    }
                    onClick={e => this.registerClick(e)}
                  >
                    {isLoading ?
                      <Spinner animation="border" size="sm" /> :
                      getString(langId, compId, "btn_createAccount")}
                  </Button>
                  <LabelAlert alertState={alertState} alertMsg={alertMsg} />
                  <br />
                  {btnForgotPassword_isHidden ?
                    null :
                    <Button className="btn-link btn-neutral" color="default" href="forgotpassword">
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