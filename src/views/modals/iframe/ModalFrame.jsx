import React from "react";
import PropTypes from "prop-types";

import { Modal } from "reactstrap";

class ModalFrame extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let { modalId, isOpen, src } = this.props;

    return (
      <Modal isOpen={isOpen} size="md" toggle={() => this.props.toggleModal(modalId)}>
        <iframe
          height="280"
          src={src}
          frameBorder="0"
          allow="encrypted-media"
          allowFullScreen
          title="Estratégias"
        />
      </Modal>
    )
  }
}

export default ModalFrame;

ModalFrame.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
  src: PropTypes.string.isRequired
}