import React from "react";
import { InputGroup } from "reactstrap";

class LabelAlert extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      alertState: props.alertState,
      alertMsg: props.alertMsg
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.alertState !== state.alertState ||
      props.alertMsg !== state.alertMsg)
      return {
        alertState: props.alertState,
        alertMsg: props.alertMsg
      }
    return null
  }

  render() {
    let { alertState, alertMsg } = this.state

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