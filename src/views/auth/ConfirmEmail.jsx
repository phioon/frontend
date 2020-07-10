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
import { LoopCircleLoading } from 'react-loadingg';

import PropTypes from "prop-types";

// CORE
import { project } from "../../core/projectData";
import LabelAlert from "../../components/LabelAlert";
// --------------------

class ConfirmEmail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      pageFirstLoading: true,
      redirectToLogin: false,
      isEmailConfirmed: false,

      isLoading: false,

      alert: null,
      alertState: "",
      alertMsg: "",
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
    let { compId, pageFirstLoading, redirectToLogin, alertState, alertMsg } = this.state
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
            let msg = await this.props.getHttpTranslation(result, compId, "user")
            alertState = "has-danger"
            alertMsg = msg
          }
        }
        else {
          // Token is invalid
          let msg = await this.props.getHttpTranslation(result, compId, "user")
          alertState = "has-danger"
          alertMsg = msg
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
    this.setState({
      isLoading: false,
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={this.props.getString(this.state.langId, this.state.compId, "alert_emailConfirmed_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="success"
        >
          {this.props.getString(this.state.langId, this.state.compId, "alert_emailConfirmed_text")}
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
    let getString = this.props.getString;

    let {
      langId,
      compId,
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
        {redirectToLogin ? <Redirect to="/auth/login" /> : null}
        <Container>
          <Col className="ml-auto mr-auto" lg="4" md="6">
            <Form action="" className="form" method="">
              <Card className="card-lock text-center">
                <CardHeader>
                  <h5 className="header text-center">{getString(langId, compId, "card_header")}</h5>
                </CardHeader>
                <CardBody>
                  {pageFirstLoading ?
                    // First Loading
                    <>
                      <br />
                      <LoopCircleLoading color='#4f4f4f' />
                      <br />
                      <br />
                    </> :
                    <LabelAlert alertState={alertState} alertMsg={alertMsg} />
                  }
                </CardBody>
                <CardFooter>

                  <Button
                    block
                    type="submit"
                    className="btn-round"
                    color="primary"
                    name="btnLogin"
                    onClick={e => this.submitClick(e)}
                  >
                    {isLoading ?
                      <Spinner animation="border" size="sm" /> :
                      getString(langId, compId, "btn_login")
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
            backgroundImage: `url(${project.img.bg.app_ligth.src})`
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
  prefs: PropTypes.object.isRequired,
  setAuthStatus: PropTypes.func.isRequired
}