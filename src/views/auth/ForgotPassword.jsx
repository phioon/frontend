import React from "react";

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
  Spinner
} from "reactstrap";

import PropTypes from "prop-types";

// CORE
import { project } from "../../core/projectData";
import LabelAlert from "../../components/LabelAlert";
// --------------------

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase()

    this.state = {
      isLoading: false,

      email: "",

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
      email: "",
      emailState: ""
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

  onChange = (event, stateName, type) => {
    if (this.state.labelAlertState !== null)
      this.setState({
        alertState: null,
        alertMsg: ""
      })

    this.setState({ [stateName]: event.target.value })

    switch (type) {
      case "email":
        if (this.verifyEmail(event.target.value)) {
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

    let { getString, prefs } = this.props;

    let user = { email: this.state.email }

    let result = await this.props.managers.auth.userRequestPasswordReset(user)

    console.log({ result })

    if (result.status === 200 || result.response.status === 404) {
      this.setState({
        isLoading: false,
        alertState: undefined,
        alertMsg: getString(prefs.locale, this.compId, "label_emailSent")
      })
    }
    else {
      let msg = await this.props.getHttpTranslation(result, this.compId, "user")
      this.setState({
        isLoading: false,
        alertState: "has-danger",
        alertMsg: msg.text
      })
    }

    this.clearInputFields()
  }

  render() {
    let { getString, prefs } = this.props;

    let { isLoading, email, emailState, alertState, alertMsg } = this.state;

    return (
      <div className="login-page">
        <Container>
          <Col className="ml-auto mr-auto" lg="4" md="6">
            <Form action="" className="form" method="">
              <Card className="card-lock text-center">
                <CardHeader>
                  <h5 className="header text-center">{getString(prefs.locale, this.compId, "card_header")}</h5>
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
                      name="email"
                      value={email}
                      onChange={e => this.onChange(e, e.target.name, "email")}
                    />
                  </InputGroup>
                </CardBody>
                <CardFooter>
                  <Button
                    block
                    type="submit"
                    className="btn-simple btn-round"
                    color="primary"
                    name="btnLogin"
                    disabled={
                      this.state.emailState === "has-success" ?
                        false : true
                    }
                    onClick={e => this.submitClick(e)}
                  >
                    {isLoading ?
                      <Spinner size="sm" /> :
                      getString(prefs.locale, this.compId, "btn_recover")
                    }
                  </Button>
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
      </div>
    );
  }
}

export default ForgotPassword;

ForgotPassword.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
}