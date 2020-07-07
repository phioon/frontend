import React from "react";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";

class SweetAlert extends React.Component {
  state = {
    alert: null
  };
  // to stop the warning of calling setState of unmounted component
  componentWillUnmount() {
    var id = window.setTimeout(null, 0);
    while (id--) {
      window.clearTimeout(id);
    }
  }
  basicAlert = msg => {
    this.setState({
      alert: (
        <ReactBSAlert
          style={{ display: "block", marginTop: "-100px" }}
          title={msg}
          onConfirm={() => this.hideAlert()}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="info"
        />
      )
    });
  };
  titleAndTextAlert = (title, msg) => {
    this.setState({
      alert: (
        <ReactBSAlert
          style={{ display: "block", marginTop: "-100px" }}
          title={title}
          onConfirm={() => this.hideAlert()}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="info"
        >
          {msg}
        </ReactBSAlert>
      )
    });
  };
  successAlert = (title, msg) => {
    this.setState({
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={title}
          onConfirm={() => this.hideAlert()}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="info"
        >
          {msg}
        </ReactBSAlert>
      )
    });
  };
  htmlAlert = (title, msg) => {
    this.setState({
      alert: (
        <ReactBSAlert
          style={{ display: "block", marginTop: "-100px" }}
          title={title}
          onConfirm={() => this.hideAlert()}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="info"
        >
          You can use <b>bold</b> text,{" "}
          <a href="https://mytradeadviser.com/">links</a> and other HTML tags
        </ReactBSAlert>
      )
    });
  };
  warningWithConfirmMessage = (title, msg, confirmBtnText, cancelBtnText) => {
    this.setState({
      alert: (
        <ReactBSAlert
          warning
          style={{ display: "block", marginTop: "-100px" }}
          title={title}
          onConfirm={() => this.successDelete()}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="info"
          cancelBtnBsStyle="danger"
          confirmBtnText={confirmBtnText}
          cancelBtnText={cancelBtnText}
          showCancel
        >
          {msg}
        </ReactBSAlert>
      )
    });
  };
  warningWithConfirmAndCancelMessage = (
    title,
    msg,
    confirmBtnText,
    cancelBtnText
  ) => {
    this.setState({
      alert: (
        <ReactBSAlert
          warning
          style={{ display: "block", marginTop: "-100px" }}
          title={title}
          onConfirm={() => this.successDelete()}
          onCancel={() => this.cancelDetele()}
          confirmBtnBsStyle="info"
          cancelBtnBsStyle="danger"
          confirmBtnText={confirmBtnText}
          cancelBtnText={cancelBtnText}
          showCancel
        >
          {msg}
        </ReactBSAlert>
      )
    });
  };
  autoCloseAlert = (mtitle, msg) => {
    this.setState({
      alert: (
        <ReactBSAlert
          style={{ display: "block", marginTop: "-100px" }}
          title="Auto close alert!"
          onConfirm={() => this.hideAlert()}
          showConfirm={false}
        >
          {msg}
        </ReactBSAlert>
      )
    });
    setTimeout(this.hideAlert, 2000);
  };
  inputAlert = (title, msg) => {
    this.setState({
      alert: (
        <ReactBSAlert
          input
          showCancel
          style={{ display: "block", marginTop: "-100px" }}
          title={title}
          onConfirm={e => this.inputConfirmAlert(e)}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="info"
          cancelBtnBsStyle="danger"
        />
      )
    });
  };
  inputConfirmAlert = e => {
    this.setState({ alert: e });
    setTimeout(this.inputConfirmAlertNext, 200);
  };
  inputConfirmAlertNext = () => {
    const inputValue = this.state.alert;
    this.setState({
      alert: (
        <ReactBSAlert
          style={{ display: "block", marginTop: "-100px" }}
          onConfirm={() => this.hideAlert()}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="info"
          title={
            <p>
              You entered: <b>{inputValue}</b>
            </p>
          }
        />
      )
    });
  };
  successDelete = (title, msg) => {
    this.setState({
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={title}
          onConfirm={() => this.hideAlert()}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="info"
        >
          {msg}
        </ReactBSAlert>
      )
    });
  };
  cancelDetele = (title, msg) => {
    this.setState({
      alert: (
        <ReactBSAlert
          danger
          style={{ display: "block", marginTop: "-100px" }}
          title={title}
          onConfirm={() => this.hideAlert()}
          onCancel={() => this.hideAlert()}
          confirmBtnBsStyle="info"
        >
          {msg}
        </ReactBSAlert>
      )
    });
  };
  hideAlert = () => {
    this.setState({
      alert: null
    });
  };

  render() {
    return (
      <>
        <div className="content">{this.state.alert}</div>
      </>
    );
  }
}

export default SweetAlert;
