import React from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
// reactstrap components
import {
  Button,
  Col,
  Modal,
  Row
} from "reactstrap";

class ModalUserCreated extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isOpen: props.isOpen,

      userEmail: props.userEmail,
      redirectToLogin: false
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    if (props.isOpen !== state.isOpen)
      return { isOpen: props.isOpen }
    return null
  }

  render() {
    let { getString, modalId } = this.props;
    let { langId, compId, isOpen, redirectToLogin } = this.state;

    return (
      <Modal isOpen={isOpen} size="md" toggle={() => this.props.toggleModal(modalId)} ref="modal_userCreated">
        {redirectToLogin ? <Redirect to="/auth/login" /> : null}
        <div className="modal-header">
          <button
            aria-hidden={true}
            className="close"
            data-dismiss="modal"
            type="button"
            onClick={() => this.props.toggleModal(modalId)}
          >
            <i className="nc-icon nc-simple-remove" />
          </button>
          <h5 className="modal-title">
            {getString(langId, compId, "title")}
          </h5>
        </div>
        <div className="card-stats modal-body">
          {/* Confirm Email */}
          <div className="instruction">
            <Row>
              <Col md="8">
                <strong>
                  {getString(langId, compId, "stepTitle1")}
                </strong>
                <p className="description">
                  {getString(langId, compId, "stepDesc1")}
                </p>
              </Col>
              <Col md="4">
                <div className="icon-big centered">
                  <i className="nc-icon nc-email-85 text-success" />
                </div>
              </Col>
            </Row>
          </div>
          {/* Log in */}
          <div className="instruction">
            <Row>
              <Col md="8">
                <strong>
                  {getString(langId, compId, "stepTitle2")}
                </strong>
                <p className="description">
                  {getString(langId, compId, "stepDesc2")}
                </p>
              </Col>
              <Col md="4">
                <div className="icon-big centered">
                  <i className="nc-icon nc-lock-circle-open text-info" />
                </div>
              </Col>
            </Row>
          </div>
          {/* Enjoy it */}
          <div className="instruction">
            <Row>
              <Col md="8">
                <strong>
                  {getString(langId, compId, "stepTitle3")}
                </strong>
                <p className="description">
                  {getString(langId, compId, "stepDesc3")}
                </p>
              </Col>
              <Col md="4">
                <div className="icon-big centered">
                  <i className="nc-icon nc-user-run text-default" />
                </div>
              </Col>
            </Row>
          </div>
          <p className="mt-3">{getString(langId, compId, "footer")}</p>
        </div>
        <div className="modal-footer justify-content-center">
          <Button
            className="btn-round"
            color="primary"
            data-dismiss="modal"
            type="button"
            onClick={() => this.setState({ redirectToLogin: true })}
          >
            {getString(langId, compId, "btn_goToLogin")}
          </Button>
        </div>
      </Modal>
    )
  }
}

export default ModalUserCreated;

ModalUserCreated.propTypes = {
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  modalId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired
}