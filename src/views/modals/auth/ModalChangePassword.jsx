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
    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isOpen: props.isOpen,

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
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    if (props.isOpen !== state.isOpen)
      return {
        isOpen: props.isOpen,
        alertState: "",
        alertMsg: ""
      }
    return null
  }

  clearInputFields = () => {
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
    let { compId, object } = this.state;

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
      let msg = await this.props.getHttpTranslation(result, compId, "user")
      this.setState({
        isLoading: false,
        alertState: "has-danger",
        alertMsg: msg.text
      })
    }

    this.clearInputFields()
  }

  passwordChanged() {
    this.setState({
      isLoading: false,
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={this.props.getString(this.state.langId, this.state.compId, "alert_passwordChanged_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="info"
        >
          {this.props.getString(this.state.langId, this.state.compId, "alert_passwordChanged_text")}
        </ReactBSAlert>
      )
    });
  }

  hideAlert() {
    this.setState({ alert: null });
    this.props.toggleModal(this.props.modalId)
  };

  render() {
    let { getString, modalId } = this.props;
    let {
      langId,
      compId,
      isOpen,
      isLoading,

      object,

      alert,
      alertState,
      alertMsg
    } = this.state;

    return (
      <Modal isOpen={isOpen} toggle={() => this.props.toggleModal(modalId)}>
        {alert}
        <Card>
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
              {getString(langId, compId, "title")}
            </h5>
            <hr />
            <label>
              <p>
                {getString(langId, compId, "label_intro_p1")}
                <br />
                {getString(langId, compId, "label_intro_p2")}
              </p>
              <p>
                {getString(langId, compId, "label_intro_p3")}
                <br />
                {getString(langId, compId, "label_intro_p4")}
              </p>
            </label>
          </CardHeader>
          <CardBody>
            {/* Old Password */}
            <FormGroup className={`has-label ${object.states.currentPasswordState}`}>
              <label>{getString(langId, compId, "input_currentPassword")}</label>
              <Input
                type="password"
                name="currentPassword"
                value={object.data.currentPassword}
                onChange={e => this.onChange(e, e.target.name)}
              />
            </FormGroup>
            {/* New Password */}
            <FormGroup className={`has-label ${object.states.newPasswordState}`}>
              <label>{getString(langId, compId, "input_newPassword")}</label>
              <Input
                type="password"
                name="newPassword"
                value={object.data.newPassword}
                onChange={e => this.onChange(e, e.target.name)}
              />
            </FormGroup>
            {/* Confirm Password */}
            <FormGroup className={`has-label ${object.states.confirmPasswordState}`}>
              <label>{getString(langId, compId, "input_confirmPassword")}</label>
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
                <Spinner animation="border" size="sm" /> :
                getString(langId, compId, "btn_confirm")
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
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  modalId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired
}