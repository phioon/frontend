import React from "react";
import { Redirect } from "react-router-dom";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Container,
  Col,
  Form,
  Spinner,
} from "reactstrap";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";
import { RingLoader } from "react-spinners";

import PropTypes from "prop-types";

// CORE
import { project } from "../../core/projectData";
import LabelAlert from "../../components/LabelAlert";
// --------------------

class ConfirmEmail extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase()

    this.state = {
      pageFirstLoading: true,
      redirectToLogin: undefined,
      isEmailConfirmed: false,

      isLoading: false,

      alert: null,
      alertState: "",
      alertMsg: "",
    }
  }
  componentDidMount() {
    document.body.classList.toggle("login-page");
    this.prepareRequirements()
  }
  componentWillUnmount() {
    document.body.classList.toggle("login-page");
  }
  async prepareRequirements() {
    let { pageFirstLoading, redirectToLogin, alertState, alertMsg } = this.state
    let uidb64 = undefined
    let token = undefined

    if (this.props.match.params) {
      uidb64 = this.props.match.params.uidb64
      token = this.props.match.params.token

      if (uidb64 && token) {
        // Both params were given by URL
        let result = await this.props.managers.auth.checkToken(uidb64, token)

        if (result.status == 200) {
          let object = {
            uid: uidb64,
            token: token
          }

          result = await this.props.managers.auth.userConfirmEmailWithToken(object)

          if (result.status == 200)
            this.emailConfirmed()
          else {
            // Something went wrong trying to update UserCustom
            let msg = await this.props.getHttpTranslation(result, this.compId, "user")
            alertState = "has-danger"
            alertMsg = msg.text
          }
        }
        else {
          // Token is invalid
          let msg = await this.props.getHttpTranslation(result, this.compId, "user")
          alertState = "has-danger"
          alertMsg = msg.text
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
      redirectToLogin,

      uidb64,
      token,

      alertState,
      alertMsg
    })
  }

  emailConfirmed() {
    let { prefs, getString } = this.props;

    this.setState({
      isLoading: false,
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={getString(prefs.locale, this.compId, "alert_emailConfirmed_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="success"
        >
          {getString(prefs.locale, this.compId, "alert_emailConfirmed_text")}
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

  submitClick(e) {
    e.preventDefault()
    this.setState({ redirectToLogin: true })
  }

  render() {
    let { getString, prefs } = this.props;

    let {
      pageFirstLoading,
      isLoading,
      redirectToLogin,

      alert,
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
                  <h5 className="header text-center">{getString(prefs.locale, this.compId, "card_header")}</h5>
                </CardHeader>
                <CardBody>
                  {pageFirstLoading ?
                    // First Loading
                    <div className="centered">
                      <RingLoader color="#3a5966" />
                    </div> :
                    <LabelAlert alertState={alertState} alertMsg={alertMsg} />
                  }
                </CardBody>
                <CardFooter>
                  <Button
                    block
                    type="submit"
                    className="btn-simple btn-round"
                    color="primary"
                    name="btnLogin"
                    onClick={e => this.submitClick(e)}
                  >
                    {isLoading ?
                      <Spinner size="sm" /> :
                      getString(prefs.locale, this.compId, "btn_login")
                    }
                  </Button>
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

export default ConfirmEmail;

ConfirmEmail.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired
}