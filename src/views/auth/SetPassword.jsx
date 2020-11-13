import React from "react";
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
  Spinner,
} from "reactstrap";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";
import { LoopCircleLoading } from 'react-loadingg';

import PropTypes from "prop-types";

// CORE
import { project } from "../../core/projectData";
import LabelAlert from "../../components/LabelAlert";
// --------------------

class SetPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      pageFirstLoading: true,
      isTokenExpired: true,
      redirectToLogin: false,

      isLoading: false,

      password: "",
      passwordState: "",
      confirmPassword: "",
      confirmPasswordState: "",

      alert: null,
      alertState: "",
      alertMsg: "",
      tokenAlertState: "",
      tokenAlertMsg: ""
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }
  componentDidMount() {
    document.body.classList.toggle("login-page");
    this.prepareRequirements()
  }
  componentWillUnmount() {
    document.body.classList.toggle("login-page");
  }
  async prepareRequirements() {
    let { compId, pageFirstLoading, isTokenExpired, redirectToLogin,
      alertState, alertMsg, tokenAlertState, tokenAlertMsg
    } = this.state
    let uidb64 = undefined
    let token = undefined

    if (this.props.match.params) {
      uidb64 = this.props.match.params.uidb64
      token = this.props.match.params.token

      if (uidb64 && token) {
        // Both params were given by URL
        let result = await this.props.managers.auth.checkToken(uidb64, token)

        if (result.status == 200)
          isTokenExpired = false
        else {
          let msg = await this.props.getHttpTranslation(result, compId, "user")
          tokenAlertState = "has-danger"
          tokenAlertMsg = msg.text
        }
      }
      else {
        // At least one of the params are missing
        redirectToLogin = true
      }
    }
    else {
      // At least one of the params are missing
      redirectToLogin = true
    }

    pageFirstLoading = false

    this.setState({
      pageFirstLoading,
      isTokenExpired,
      redirectToLogin,

      uidb64,
      token,

      tokenAlertState,
      tokenAlertMsg,
      alertState,
      alertMsg
    })
  }

  clearInputFields = () => {
    this.setState({
      password: "",
      passwordState: "",
      confirmPassword: "",
      confirmPasswordState: ""
    });
  };

  // function that verifies if a string has a given length or not
  verifyLength = (value, length) => {
    if (value.length >= length)
      return true;
    return false;
  };
  // function that verifies if two strings are equal
  compare = (string1, string2) => {
    if (string1 === string2)
      return true;
    return false;
  };

  onChange = (event, stateName, type, stateNameEqualTo) => {
    if (this.state.labelAlertState !== null)
      this.setState({
        alertState: null,
        alertMsg: ""
      })

    this.setState({ [stateName]: event.target.value })

    switch (type) {
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
    }
  };

  async submitClick(e) {
    e.preventDefault()
    let { compId, uidb64, token, password, confirmPassword } = this.state;

    this.setState({ isLoading: true })

    let object = {
      uid: uidb64,
      token: token,
      new_password1: password,
      new_password2: confirmPassword
    }

    let result = await this.props.managers.auth.userSetPasswordWithToken(object)

    if (result.status == 200)
      this.passwordReseted()
    else {
      let msg = await this.props.getHttpTranslation(result, compId, "user")
      this.setState({
        isLoading: false,
        alertState: "has-danger",
        alertMsg: msg.text
      })
    }

    this.clearInputFields()
  }

  passwordReseted() {
    this.setState({
      isLoading: false,
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={this.props.getString(this.state.langId, this.state.compId, "alert_passwordReseted_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
        >
          {this.props.getString(this.state.langId, this.state.compId, "alert_passwordReseted_text")}
        </ReactBSAlert>
      )
    });
  }

  hideAlert() {
    this.setState({
      alert: null,
      redirectToLogin: true
    });
  };

  render() {
    let getString = this.props.getString;

    let {
      langId,
      compId,
      pageFirstLoading,
      isLoading,
      isTokenExpired,
      redirectToLogin,

      password,
      passwordState,
      confirmPassword,
      confirmPasswordState,

      alert,
      tokenAlertState,
      tokenAlertMsg,
      alertState,
      alertMsg
    } = this.state;

    return (
      <div className="login-page">
        {alert}
        {redirectToLogin && <Redirect to="/auth/login" />}
        <Container>
          <Col className="ml-auto mr-auto" lg="4" md="6">
            <Form action="" className="form" method="">
              <Card className="card-lock text-center">
                <CardHeader>
                  <h5 className="header text-center">{getString(langId, compId, "card_header")}</h5>
                </CardHeader>
                {pageFirstLoading ?
                  // First Loading
                  <CardBody>
                    <br />
                    <LoopCircleLoading color='#4f4f4f' />
                    <br />
                    <br />
                  </CardBody> :
                  isTokenExpired ?
                    // Token is Expired
                    <CardBody>
                      <LabelAlert alertState={tokenAlertState} alertMsg={tokenAlertMsg} />
                    </CardBody> :
                    // Token is Valid
                    <CardBody>
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
                          placeholder={getString(langId, compId, "input_confirmPassword")}
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
                    </CardBody>
                }
                <CardFooter>
                  {
                    isTokenExpired ?
                      <Button
                        block
                        type="submit"
                        className="btn-round"
                        color="primary"
                        name="btnLogin"
                        onClick={() => this.setState({ redirectToLogin: true })}
                      >
                        {getString(langId, compId, "btn_login")}
                      </Button>
                      :
                      <Button
                        block
                        type="submit"
                        className="btn-round"
                        color="primary"
                        name="btnLogin"
                        disabled={
                          this.compare(password, confirmPassword) &&
                            passwordState === "has-success" &&
                            confirmPasswordState === "has-success" ?
                            false : true
                        }
                        onClick={e => this.submitClick(e)}
                      >
                        {isLoading ?
                          <Spinner size="sm" /> :
                          getString(langId, compId, "btn_recover")
                        }
                      </Button>
                  }
                  <br />
                  <LabelAlert alertState={alertState} alertMsg={alertMsg} />
                </CardFooter>
              </Card>
            </Form>
          </Col>
        </Container>
        <div
          className="full-page-background"
          style={{
            backgroundImage: `url(${project.img.bg.app_light.src})`
          }}
        />
      </div >
    );
  }
}

export default SetPassword;

SetPassword.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setAuthStatus: PropTypes.func.isRequired
}