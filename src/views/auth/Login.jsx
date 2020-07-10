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
// --------------------

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isLoading: false,

      email: "",
      password: "",

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

  onChange = (event, stateName, type) => {
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
      case "email":
        if (this.verifyEmail(event.target.value)) {
          this.setState({ [stateName + "State"]: "has-success" });
        } else {
          this.setState({ [stateName + "State"]: "has-danger" });
        }
        break;
      case "password":
        if (this.verifyLength(event.target.value, 1)) {
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

    // When data is returned correctly from StorageManager, one of default properties is VERSION
    if (result.version) {
      this.props.setLangId(result.data.user.pref_langId)
      this.setState({ isLoading: false })
      this.props.setAuthStatus(true)
    }
    else {
      this.clearInputFields();
      let msg = await this.props.getHttpTranslation(result, this.state.compId, "user")
      this.setState({
        isLoading: false,
        alertState: "has-danger",
        alertMsg: msg
      })
    }
  }

  render() {
    let { getString } = this.props;
    let { langId, compId, isLoading, email, emailState, password, passwordState, alertState, alertMsg } = this.state;

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
                    <Button className="btn-link btn-neutral" color="default" href="forgotpassword">
                      {getString(langId, compId, "label_forgotPassword")}?
                    </Button>
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