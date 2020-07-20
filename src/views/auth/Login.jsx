import React from "react";
import PropTypes from "prop-types";
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
import { verifyEmail, verifyLength } from "../../core/utils";
import { getString } from "../../core/lang";
// -------------------

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isLoading: false,
      resendEmail_isLoading: false,

      email: "",
      password: "",

      btnSendConfirmation_isHidden: true,
      alertState: null,
      alertMsg: ""
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
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
        if (verifyEmail(event.target.value)) {
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
      let msg = await this.props.getHttpTranslation(result, this.state.compId, "user")

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
    let { langId, compId } = this.state
    this.setState({ resendEmail_isLoading: true })

    let user = {
      email: this.state.email,
    }

    let result = await this.props.managers.auth.userRequestConfirmEmail(user)

    if (result.status == 200) {
      this.setState({
        resendEmail_isLoading: false,
        alertState: undefined,
        alertMsg: getString(langId, compId, "label_emailSent")
      })
    }
    else {
      let msg = await this.props.getHttpTranslation(result, this.state.compId, "user")

      this.setState({
        resendEmail_isLoading: false,
        alertState: "has-danger",
        alertMsg: msg.text
      })
    }
  }

  render() {
    let { getString } = this.props;
    let { langId,
      compId,
      isLoading,
      resendEmail_isLoading,

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
                    <h3 className="header text-center">{getString(langId, compId, "card_header")}</h3>
                  </CardHeader>
                  <CardBody>
                    <InputGroup className={`has-label ${emailState}`}>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="nc-icon nc-single-02" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder={getString(langId, compId, "input_email")}
                        type="email"
                        name="email"
                        value={email}
                        onChange={e => this.onChange(e, e.target.name, "email")}
                      />
                    </InputGroup>
                    <InputGroup className={`has-label ${passwordState}`}>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="nc-icon nc-key-25" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        placeholder={getString(langId, compId, "input_password")}
                        type="password"
                        autoComplete="off"
                        name="password"
                        value={password}
                        onChange={e => this.onChange(e, e.target.name, "password")}
                      />
                    </InputGroup>
                    <br />
                  </CardBody>
                  <CardFooter>
                    <Button
                      block
                      type="submit"
                      className="btn-round"
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
                        <Spinner animation="border" size="sm" /> :
                        getString(langId, compId, "btn_login")
                      }
                    </Button>
                    <br />
                    <LabelAlert alertState={alertState} alertMsg={alertMsg} />
                    <br />
                    {
                      btnSendConfirmation_isHidden ?
                        <Button className="btn-link btn-neutral" color="default" href="forgotpassword">
                          {getString(langId, compId, "btn_forgotPassword")}?
                        </Button> :
                        <Button
                          className="btn-link btn-neutral"
                          color="default"
                          onClick={e => this.resendEmailClick(e)}>
                          {resendEmail_isLoading ?
                            <Spinner animation="border" size="sm" /> :
                            getString(langId, compId, "btn_resendEmail")
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
            backgroundImage: `url(${project.img.bg.app_ligth.src})`
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