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
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      userEmail: props.userEmail,
      redirectToLogin: false
    }
  }

  render() {
    let { isOpen, prefs, getString, modalId } = this.props;
    let { redirectToLogin } = this.state;

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
            {getString(prefs.locale, this.compId, "title")}
          </h5>
        </div>
        <div className="card-stats modal-body">
          {/* Confirm Email */}
          <div className="instruction">
            <Row>
              <Col md="8">
                <strong>
                  {getString(prefs.locale, this.compId, "stepTitle1")}
                </strong>
                <p className="description">
                  {getString(prefs.locale, this.compId, "stepDesc1")}
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
                  {getString(prefs.locale, this.compId, "stepTitle2")}
                </strong>
                <p className="description">
                  {getString(prefs.locale, this.compId, "stepDesc2")}
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
                  {getString(prefs.locale, this.compId, "stepTitle3")}
                </strong>
                <p className="description">
                  {getString(prefs.locale, this.compId, "stepDesc3")}
                </p>
              </Col>
              <Col md="4">
                <div className="icon-big centered">
                  <i className="nc-icon nc-user-run text-warning" />
                </div>
              </Col>
            </Row>
          </div>
          <p className="mt-3">
            {getString(prefs.locale, this.compId, "footer_p1")}
            {" "}
            <a href={`mailto:${getString(prefs.locale, "phioon", "email_support")}`}>
              {getString(prefs.locale, "phioon", "email_support")}.
            </a>
            {" "}
            {getString(prefs.locale, this.compId, "footer_p2")}
          </p>
        </div>
        <Row className="mt-3" />
        <div className="modal-footer justify-content-center">
          <Button
            className="btn-round"
            color="primary"
            data-dismiss="modal"
            type="button"
            onClick={() => this.setState({ redirectToLogin: true })}
          >
            {getString(prefs.locale, this.compId, "btn_goToLogin")}
          </Button>
        </div>
      </Modal>
    )
  }
}

export default ModalUserCreated;

ModalUserCreated.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  modalId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired
}