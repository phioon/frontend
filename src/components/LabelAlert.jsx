import React from "react";
import { InputGroup } from "reactstrap";

class LabelAlert extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let { alertState, alertMsg } = this.props;

    return (
      <>
        <InputGroup className={`has-label ${alertState}`}>
          <label className={alertState === "has-danger" ? "error" : ""}>
            {alertMsg}
          </label>
        </InputGroup>
      </>
    )
  }
}

export default LabelAlert;