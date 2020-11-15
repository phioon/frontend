import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  FormGroup,
  Modal,
  Input,
  Spinner
} from "reactstrap";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";
import LabelAlert from "../../../components/LabelAlert";
import { verifyLength, compare } from "../../../core/utils";

class ModalChangePassword extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      isLoading: false,

      object: {
        data: {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        },
        states: {
          currentPasswordState: "",
          newPasswordState: "",
          confirmPasswordState: "",
        },
        isValidated: undefined
      },

      alert: null,
      alertState: "",
      alertMsg: ""
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen)
      this.clearInputFields(true)
  }

  clearInputFields(clearAlerts) {
    if (clearAlerts)
      this.setState({ alertState: "", alertMsg: "" })

    this.setState({
      object: {
        data: {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        },
        states: {
          currentPasswordState: "",
          newPasswordState: "",
          confirmPasswordState: "",
        },
        isValidated: undefined
      }
    })
  }

  onChange = (event, stateName, stateNameEqualTo) => {
    let newState = { object: this.state.object }

    if (this.state.labelAlertState !== null) {
      newState.alertState = null
      newState.alertMsg = ""
    }

    newState.object.data[stateName] = event.target.value

    switch (stateName) {
      case "currentPassword":
        if (verifyLength(event.target.value, 1))
          newState.object.states[stateName + "State"] = "has-success"
        else
          newState.object.states[stateName + "State"] = "has-danger"
        break;
      case "newPassword":
        if (verifyLength(event.target.value, 8))
          newState.object.states[stateName + "State"] = "has-success"
        else
          newState.object.states[stateName + "State"] = "has-danger"
        break;
      case "confirmPassword":
        if (newState.object.states[stateNameEqualTo + "State"] === "has-success") {
          if (compare(event.target.value, newState.object.data[stateNameEqualTo])) {
            newState.object.states[stateName + "State"] = "has-success"
            newState.object.states[stateNameEqualTo + "State"] = "has-success"
          }
          else
            newState.object.states[stateName + "State"] = "has-danger"
        }
        break;
    }

    newState.object.isValidated = this.isValidated(newState.object)

    this.setState(newState)
  };

  isValidated(obj) {
    for (var state of Object.values(obj.states))
      if (state != "has-success")
        return false
    return true
  }

  async submitClick(e) {
    e.preventDefault()
    let { object } = this.state;

    this.setState({ isLoading: true })

    object = {
      old_password: object.data.currentPassword,
      new_password1: object.data.newPassword,
      new_password2: object.data.confirmPassword
    }

    let result = await this.props.managers.auth.userChangePassword(object)

    if (result.status == 200)
      this.passwordChanged()
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

  passwordChanged() {
    let { prefs, getString } = this.props;

    this.setState({
      isLoading: false,
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={getString(prefs.locale, this.compId, "alert_passwordChanged_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
        >
          {getString(prefs.locale, this.compId, "alert_passwordChanged_text")}
        </ReactBSAlert>
      )
    });
  }

  hideAlert() {
    this.setState({ alert: null });
    this.props.toggleModal(this.props.modalId)
  };

  render() {
    let { prefs, getString, isOpen, modalId } = this.props;
    let {
      isLoading,

      object,

      alert,
      alertState,
      alertMsg
    } = this.state;

    return (
      <Modal isOpen={isOpen} toggle={() => this.props.toggleModal(modalId)}>
        {alert}
        <Card className="card-plain">
          <CardHeader className="modal-header">
            <button
              aria-hidden={true}
              className="close"
              data-dismiss="modal"
              type="button"
              onClick={() => this.props.toggleModal(modalId)}
            >
              <i className="nc-icon nc-simple-remove" />
            </button>
            <h5 className="modal-title" id={modalId}>
              {getString(prefs.locale, this.compId, "title")}
            </h5>
            <hr />
            <label>
              <p>
                {getString(prefs.locale, this.compId, "label_intro_p1")}
                <br />
                {getString(prefs.locale, this.compId, "label_intro_p2")}
              </p>
              <p>
                {getString(prefs.locale, this.compId, "label_intro_p3")}
                <br />
                {getString(prefs.locale, this.compId, "label_intro_p4")}
              </p>
            </label>
          </CardHeader>
          <CardBody>
            {/* Old Password */}
            <FormGroup className={`has-label ${object.states.currentPasswordState}`}>
              <label>{getString(prefs.locale, this.compId, "input_currentPassword")}</label>
              <Input
                type="password"
                name="currentPassword"
                value={object.data.currentPassword}
                onChange={e => this.onChange(e, e.target.name)}
              />
            </FormGroup>
            {/* New Password */}
            <FormGroup className={`has-label ${object.states.newPasswordState}`}>
              <label>{getString(prefs.locale, this.compId, "input_newPassword")}</label>
              <Input
                type="password"
                name="newPassword"
                value={object.data.newPassword}
                onChange={e => this.onChange(e, e.target.name)}
              />
            </FormGroup>
            {/* Confirm Password */}
            <FormGroup className={`has-label ${object.states.confirmPasswordState}`}>
              <label>{getString(prefs.locale, this.compId, "input_confirmPassword")}</label>
              <Input
                type="password"
                name="confirmPassword"
                value={object.data.confirmPassword}
                onChange={e => this.onChange(e, e.target.name, "newPassword")}
              />
            </FormGroup>
          </CardBody>
          <CardFooter className="text-center">
            <LabelAlert alertState={alertState} alertMsg={alertMsg} />
            <Button
              className="btn-round"
              color="success"
              data-dismiss="modal"
              type="submit"
              disabled={!isLoading && object.isValidated ? false : true}
              onClick={e => this.submitClick(e)}
            >
              {isLoading ?
                <Spinner size="sm" /> :
                getString(prefs.locale, this.compId, "btn_confirm")
              }
            </Button>
          </CardFooter>
        </Card>
      </Modal>
    )
  }
}

export default ModalChangePassword;

ModalChangePassword.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  modalId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired
}