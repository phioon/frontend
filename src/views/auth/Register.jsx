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
  Modal,
  Row,
  Spinner
} from "reactstrap";
import Select from "react-select";

// CORE
import { project } from "../../core/projectData";
import LabelAlert from "../../components/LabelAlert";
import { orderByAsc } from "../../core/utils";
// --------------------


class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isLoading: false,

      modalNotice: false,
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      nationality: null,
      cbTerms: false,

      nationalities: [],

      alertState: null,
      alertMsg: ""
    };
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
      nList = orderByAsc(nList, "label")
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

  // function that returns true if value is email, false otherwise
  verifyEmail = value => {
    var emailRex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (emailRex.test(value)) {
      return true;
    }
    return false;
  };
  // function that verifies if a string has a given length or not
  verifyLength = (value, length) => {
    if (value.length >= length) {
      return true;
    }
    return false;
  };
  // function that verifies if a string has only letters
  verifyOnlyLetters = (value) => {
    return /^[a-zA-Z- ]+$/.test(value);
  }
  // function that verifies if two strings are equal
  compare = (string1, string2) => {
    if (string1 === string2) {
      return true;
    }
    return false;
  };
  // function that verifies if value contains only numbers
  verifyNumber = value => {
    var numberRex = new RegExp("^[0-9]+$");
    if (numberRex.test(value)) {
      return true;
    }
    return false;
  };

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
        if (this.verifyLength(event.target.value, 3) && this.verifyOnlyLetters(event.target.value)) {
          this.setState({ [stateName + "State"]: "has-success" });
        } else {
          this.setState({ [stateName + "State"]: "has-danger" });
        }
        break;
      case "lastname":
        if (this.verifyLength(event.target.value, 3) && this.verifyOnlyLetters(event.target.value)) {
          this.setState({ [stateName + "State"]: "has-success" });
        } else {
          this.setState({ [stateName + "State"]: "has-danger" });
        }
        break;
      case "email":
        if (this.verifyEmail(event.target.value)) {
          this.setState({ [stateName + "State"]: "has-success" });
        } else {
          this.setState({ [stateName + "State"]: "has-danger" });
        }
        break;
      case "password":
        if (this.verifyLength(event.target.value, 8)) {
          this.setState({ [stateName + "State"]: "has-success" });
        } else {
          this.setState({ [stateName + "State"]: "has-danger" });
        }
        break;
      case "equalTo":
        if (this.state[stateNameEqualTo + "State"] === "has-success") {
          if (this.compare(event.target.value, this.state[stateNameEqualTo])) {
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
      this.setState({ modalNotice: true, isLoading: false });
      this.clearInputFields();
    }
    else {
      this.setState({ isLoading: false })
      this.handleAlerts(result)
    }
  };
  handleAlerts = err => {
    if (err.response) {

      // Request made and server responded
      if ((err.response.status >= 500 && err.response.status <= 503) ||
        err.response.status == 404) {
        this.setState({
          alertState: 'has-danger',
          alertMsg: this.props.getString(this.state.langId, this.state.compId, 'alert_404or50X')
        })
      } else {
        if (this.props.getString(this.state.langId, this.state.compId, ["alert_" + Object.keys(err.response.data)[0]])) {
          this.setState({
            alertState: 'has-danger',
            alertMsg: this.props.getString(this.state.langId, this.state.compId, ["alert_" + Object.keys(err.response.data)[0]])
          })
        } else {
          this.setState({
            alertState: 'has-danger',
            alertMsg: this.props.getString(this.state.langId, this.state.compId, "alert_tryAgain")
          })
        }
      }
    } else if (err.request) {
      // The request was made but no response was received
      this.setState({
        alertState: 'has-danger',
        alertMsg: this.props.getString(this.state.langId, this.state.compId, "alert_404or50X")
      })
    } else {
      // Something happened in setting up the request that triggered an Error
      this.setState({
        alertState: 'has-danger',
        alertMsg: this.props.getString(this.state.langId, this.state.compId, "alert_couldNotSendRequest")
      })
    }
  }

  render() {
    let { getString } = this.props;

    // taking all the states
    let {
      // register form
      langId,
      compId,
      isLoading,

      modalNotice,
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

      alertState,
      alertMsg
    } = this.state;

    return (
      <div className="register-page">
        <Modal isOpen={modalNotice} toggle={this.toggleModalNotice}>
          <div className="modal-header">
            <button
              aria-hidden={true}
              className="close"
              data-dismiss="modal"
              type="button"
              onClick={this.toggleModalNotice}
            >
              <i className="nc-icon nc-simple-remove" />
            </button>
            <h5 className="modal-title" id="myModalLabel">
              {getString(langId, compId, "modal_title")}
            </h5>
          </div>
          <div className="modal-body">
            <div className="instruction">
              <Row>
                <Col md="8">
                  <strong>
                    {getString(langId, compId, "modal_stepTitle1")}
                  </strong>
                  <p className="description">
                    {getString(langId, compId, "modal_stepDesc1")}
                  </p>
                </Col>
                <Col md="4">
                  <div className="picture">
                    <img
                      alt="..."
                      className="rounded img-raised"
                      src={"static/app/assets/img/gerrit-vermeulen.jpg"}
                    />
                  </div>
                </Col>
              </Row>
            </div>
            <div className="instruction">
              <Row>
                <Col md="8">
                  <strong>
                    {getString(langId, compId, "modal_stepTitle2")}
                  </strong>
                  <p className="description">
                    {getString(langId, compId, "modal_stepDesc2")}
                  </p>
                </Col>
                <Col md="4">
                  <div className="picture">
                    <img
                      alt="..."
                      className="rounded img-raised"
                      src={"static/app/assets/img/david-marcu.jpg"}
                    />
                  </div>
                </Col>
              </Row>
            </div>
            <div className="instruction">
              <Row>
                <Col md="8">
                  <strong>
                    {getString(langId, compId, "modal_stepTitle3")}
                  </strong>
                  <p className="description">
                    {getString(langId, compId, "modal_stepDesc3")}
                  </p>
                </Col>
                <Col md="4">
                  <div className="picture">
                    <img
                      alt="..."
                      className="rounded img-raised"
                      src={"static/app/assets/img/joshua-earles.jpg"}
                    />
                  </div>
                </Col>
              </Row>
            </div>
            <p className="mt-3">{getString(langId, compId, "modal_footer")}</p>
          </div>
          <div className="modal-footer justify-content-center">
            <Button
              className="btn-round"
              color="info"
              data-dismiss="modal"
              type="button"
              onClick={this.toggleModalNotice}
            >
              {getString(langId, compId, "modal_btnOk")}
            </Button>
          </div>
        </Modal>
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
                  <div className="social">
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
                  </div>
                </CardHeader>
                <CardBody>
                  <Form action="" className="form" method="">
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
                      {emailState === "has-danger" ? (
                        <label className="error">
                          {getString(langId, compId, "error_enterValidEmail")}
                        </label>
                      ) : null}
                    </InputGroup>
                    <Row className="mt-4" />
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
                      {cbTermsState === "has-danger" ? (
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
                    disabled={
                      this.compare(password, confirmPassword) &&
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
                  <br />
                  <LabelAlert alertState={alertState} alertMsg={alertMsg} />
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </Container>
        <div
          className="full-page-background"
          style={{
            backgroundImage: `url(${project.img.bg.app_ligth.src})`
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