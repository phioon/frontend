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
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Col,
  Row,
  Spinner
} from "reactstrap";

// CORE
import LabelAlert from "../../components/LabelAlert";
import { project } from "../../core/projectData";
import { verifyLength } from "../../core/utils";
// -------------------

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase(),

      this.state = {
        isLoading: false,
        resendEmail_isLoading: false,
        redirectToRegister: undefined,
        redirectToForgotPassword: undefined,

        email: "",
        password: "",

        btnSendConfirmation_isHidden: true,
        alertState: null,
        alertMsg: ""
      }
  }
  componentDidMount() {
    document.body.classList.toggle("login-page");
  }
  componentWillUnmount() {
    document.body.classList.toggle("login-page");
  }

  clearInputFields = () => {
    this.setState({
      password: "",
      passwordState: ""
    });
  };

  onChange = (event, stateName, type) => {
    if (this.state.labelAlertState !== null)
      this.setState({
        btnSendConfirmation_isHidden: true,
        alertState: null,
        alertMsg: ""
      })

    if (type !== "checkbox") {
      this.setState({ [stateName]: event.target.value })
    } else {
      this.setState({ [stateName]: event.target.checked })
    }

    switch (type) {
      case "email":
        if (verifyLength(event.target.value), 1) {
          this.setState({ [stateName + "State"]: "has-success" });
        } else {
          this.setState({ [stateName + "State"]: "has-danger" });
        }
        break;
      case "password":
        if (verifyLength(event.target.value, 1)) {
          this.setState({ [stateName + "State"]: "has-success" });
        } else {
          this.setState({ [stateName + "State"]: "has-danger" });
        }
        break;
      default:
        break;
    }
  };

  async submitClick(e) {
    e.preventDefault()
    this.setState({ isLoading: true })

    let user = {
      username: this.state.email,
      password: this.state.password
    }

    let result = await this.props.managers.auth.userLogin(user)

    // When data is returned correctly from StorageManager, one of default properties is USER
    if (!result.user) {
      this.clearInputFields();
      let msg = await this.props.getHttpTranslation(result, this.compId, "user")

      this.setState({
        isLoading: false,
        btnSendConfirmation_isHidden: msg.id == "user_emailNotConfirmed" ? false : true,
        alertState: "has-danger",
        alertMsg: msg.text
      })
    }
  }

  async resendEmailClick(e) {
    e.preventDefault()
    let { getString, prefs } = this.props;
    this.setState({ resendEmail_isLoading: true })

    let user = {
      email: this.state.email,
    }

    let result = await this.props.managers.auth.userRequestConfirmEmail(user)

    if ([200, 404].includes(result.status)) {
      this.setState({
        resendEmail_isLoading: false,
        alertState: undefined,
        alertMsg: getString(prefs.locale, this.compId, "label_emailSent")
      })
    }
    else {
      let msg = await this.props.getHttpTranslation(result, this.compId, "user")

      this.setState({
        resendEmail_isLoading: false,
        alertState: "has-danger",
        alertMsg: msg.text
      })
    }
  }

  render() {
    let { getString, prefs } = this.props;
    let {
      isLoading,
      resendEmail_isLoading,
      redirectToRegister,
      redirectToForgotPassword,

      email,
      emailState,
      password,
      passwordState,

      btnSendConfirmation_isHidden,
      alertState,
      alertMsg
    } = this.state;

    return (
      <div className="login-page">
        <Container>
          <Row>
            <Col className="ml-auto mr-auto" lg="4" md="6">
              <Form action="" className="form" method="">
                <Card className="card-login">
                  <CardHeader>
                    <h3 className="header text-center">{getString(prefs.locale, this.compId, "card_header")}</h3>
                  </CardHeader>
                  <CardBody>
                    <InputGroup className={`has-label ${emailState}`}>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="nc-icon nc-single-02" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder={getString(prefs.locale, this.compId, "input_email")}
                        type="email"
                        name="phioon_username"
                        value={email}
                        onChange={e => this.onChange(e, "email", "email")}
                      />
                    </InputGroup>
                    <InputGroup className={`has-label ${passwordState}`}>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="nc-icon nc-key-25" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder={getString(prefs.locale, this.compId, "input_password")}
                        type="password"
                        autoComplete="off"
                        name="password"
                        value={password}
                        onChange={e => this.onChange(e, "password", "password")}
                      />
                    </InputGroup>
                    <br />
                  </CardBody>
                  <CardFooter>
                    <Button
                      block
                      type="submit"
                      className="btn-simple btn-round"
                      color="primary"
                      name="btnLogin"
                      disabled={
                        this.state.emailState === "has-success" &&
                          this.state.passwordState === "has-success" ?
                          false : true
                      }
                      onClick={e => this.submitClick(e)}
                    >
                      {isLoading ?
                        <Spinner size="sm" /> :
                        getString(prefs.locale, this.compId, "btn_login")
                      }
                    </Button>
                    <br />
                    <LabelAlert alertState={alertState} alertMsg={alertMsg} />
                    <br />
                    {redirectToRegister && <Redirect to="/auth/register" />}
                    {redirectToForgotPassword && <Redirect to="/auth/forgotpassword" />}
                    {
                      btnSendConfirmation_isHidden ?
                        <>
                          <Button
                            className="btn-link btn-neutral"
                            color="default"
                            onClick={() => this.setState({ redirectToRegister: true })}>
                            {getString(prefs.locale, this.compId, "btn_signUp")}
                          </Button>
                          <br />
                          <Button
                            className="btn-link btn-neutral"
                            color="default"
                            onClick={() => this.setState({ redirectToForgotPassword: true })}>
                            {getString(prefs.locale, this.compId, "btn_forgotPassword")}?
                          </Button>
                        </> :
                        <Button
                          className="btn-link btn-neutral"
                          color="default"
                          onClick={e => this.resendEmailClick(e)}>
                          {resendEmail_isLoading ?
                            <Spinner size="sm" /> :
                            getString(prefs.locale, this.compId, "btn_resendEmail")
                          }
                        </Button>
                    }
                  </CardFooter>
                </Card>
              </Form>
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

export default Login;

Login.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setAuthStatus: PropTypes.func.isRequired
}