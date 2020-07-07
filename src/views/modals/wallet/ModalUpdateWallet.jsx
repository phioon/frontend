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
  Spinner,
} from "reactstrap";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";

import LabelAlert from "../../../components/LabelAlert";
import CurrencyInput from "../../../components/CurrencyInput";
import { convertMaskedStringToFloat } from "../../../core/utils";


class ModalUpdateWallet extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isOpen: props.isOpen,
      isLoading: false,

      sWalletNames: props.sWalletNames,
      currency: props.currency,

      wallet: props.wallet,

      alertState: null,
      alertMsg: "",
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    if (props.isOpen !== state.isOpen)
      return {
        isOpen: props.isOpen,
        wallet: props.wallet,
        sWalletNames: props.sWalletNames,
        currency: props.currency
      }

    return null
  }

  verifyWalletName(walletName) {
    if (!this.state.sWalletNames.includes(walletName) || walletName == this.state.currName)
      return true
    return false
  }
  verifyBalance(walletBalance) {
    if (this.verifyLength(walletBalance, 1))
      if (this.state.wallet.balanceCurr !== convertMaskedStringToFloat(walletBalance, this.state.currency))
        return true
    return false
  }
  // function that verifies if a string has a given length or not
  verifyLength = (value, length) => {
    if (value.length >= length) {
      return true;
    }
    return false;
  };

  onChange(event, stateName) {
    let newState = { wallet: this.state.wallet }

    if (this.state.alertState !== null) {
      newState.alertState = null
      newState.alertMsg = ""
    }

    newState.wallet[stateName] = event.target.value
    newState.wallet.hasChanged = true

    switch (stateName) {
      case "name":
        if (this.state.wallet.nameCurr === event.target.value)
          newState.wallet[stateName + "State"] = ""
        else if (this.verifyWalletName(event.target.value))
          newState.wallet[stateName + "State"] = "has-success"
        else
          newState.wallet[stateName + "State"] = "has-danger"
        break;
      case "balance":
        if (this.state.wallet.balanceCurr === convertMaskedStringToFloat(event.target.value, this.state.currency))
          newState.wallet[stateName + "State"] = ""
        else if (this.verifyBalance(event.target.value))
          newState.wallet[stateName + "State"] = "has-success"
        else
          newState.wallet[stateName + "State"] = "has-danger"
        break;
      case "desc":
        newState.wallet[stateName + "State"] = "has-success"
      default:
        break;
    }

    this.setState(newState)
  }

  async confirmClick(e) {
    e.preventDefault();
    this.setState({ isLoading: true })

    let wallet = {
      id: this.state.wallet.id,
      name: this.state.wallet.name,
      desc: this.state.wallet.desc,
      balance: convertMaskedStringToFloat(this.state.wallet.balance, this.state.currency),
    };

    let result = await this.props.managers.app.walletUpdate(wallet)

    if (result.status == 200) {
      this.objectUpdated()
    }
    else {
      this.setState({
        isLoading: false,
        alertState: "has-danger",
        alertMsg: await this.props.getHttpTranslation(result, this.state.compId, "wallet")
      })
    }
  }

  objectUpdated() {
    this.setState({
      isLoading: false,
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={this.props.getString(this.state.langId, this.state.compId, "alert_updated_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="info"
        >
          {this.props.getString(this.state.langId, this.state.compId, "alert_updated_text")}
        </ReactBSAlert>
      )
    });

    this.props.runItIfSuccess()
  }

  hideAlert() {
    this.setState({
      alert: null
    });
    this.props.toggleModal(this.props.modalId)
  };

  render() {
    let { getString, modalId } = this.props;
    let {
      langId, compId, isOpen, isLoading,

      wallet,

      currency,

      alert,
      alertState,
      alertMsg,
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
          </CardHeader>
          <CardBody>
            {/* Name */}
            <FormGroup className={`has-label ${wallet.nameState}`}>
              <label>{getString(langId, compId, "input_name")} *</label>
              <Input
                type="text"
                name="name"
                value={wallet.name}
                onChange={e => this.onChange(e, e.target.name)}
              />
              {wallet.nameState === "has-danger" ? (
                <label className="error">
                  {getString(langId, compId, "error_name")}
                </label>
              ) : null}
            </FormGroup>
            {/* Description */}
            <FormGroup className={`has-label ${wallet.descState}`}>
              <label>{getString(langId, compId, "input_description")}</label>
              <Input
                type="text"
                name="desc"
                value={wallet.desc}
                onChange={e => this.onChange(e, e.target.name)}
              />
            </FormGroup>
            {/* Stock Exchange */}
            <FormGroup>
              <label>{getString(langId, compId, "input_stockExchange")}</label>
              <Input
                type="text"
                name="stockExchange"
                value={wallet.stockExchange}
                disabled
              />
            </FormGroup>
            {/* Balance */}
            <FormGroup className={`has-label ${wallet.balanceState}`}>
              <label>{getString(langId, compId, "input_balance")}</label>
              <CurrencyInput
                className="form-control text-right"
                placeholder={currency.symbol}
                type="text"
                name="balance"
                value={wallet.balance}
                onChange={e => this.onChange(e, e.target.name)}
                maskOptions={{
                  prefix: currency.symbol + " ",
                  thousandsSeparatorSymbol: currency.thousands_separator_symbol,
                  decimalSymbol: currency.decimal_symbol,
                  integerLimit: 11
                }}
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
              disabled={
                !isLoading &&
                  wallet.hasChanged &&
                  (wallet.nameState === "has-success" ||
                    wallet.descState === "has-success" ||
                    wallet.balanceState === "has-success") ?
                  false : true
              }
              onClick={e => this.confirmClick(e)}
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

export default ModalUpdateWallet;

ModalUpdateWallet.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  getHttpTranslation: PropTypes.func.isRequired,

  wallet: PropTypes.object.isRequired,
  sWalletNames: PropTypes.array.isRequired,

  modalId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
  runItIfSuccess: PropTypes.func.isRequired
}