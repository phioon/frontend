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
import {
  areObjsEqual,
  convertMaskedStringToFloat,
  deepCloneObj,
  verifyLength
} from "../../../core/utils";


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

      initial_wallet: props.wallet,
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
        currency: props.currency,
        sWalletNames: props.sWalletNames,
        initial_wallet: deepCloneObj(props.wallet),
        wallet: props.wallet,
      }

    return null
  }

  verifyWalletName(walletName) {
    let isValidated = false
    if (verifyLength(walletName, 1)) {
      isValidated = true
      if (walletName == this.state.initial_wallet.data.name)
        isValidated = true
      else if (this.state.sWalletNames.includes(walletName))
        isValidated = false
    }

    return isValidated
  }

  onChange(event, stateName) {
    let newState = { wallet: this.state.wallet }

    if (this.state.alertState !== null) {
      newState.alertState = null
      newState.alertMsg = ""
    }

    newState.wallet.data[stateName] = event.target.value
    newState.wallet.patch[stateName] = event.target.value

    switch (stateName) {
      case "name":
        if (this.verifyWalletName(event.target.value))
          newState.wallet.states[stateName] = "has-success"
        else
          newState.wallet.states[stateName] = "has-danger"
        break;
      case "balance":
        if (verifyLength(event.target.value, 1))
          newState.wallet.states[stateName] = "has-success"
        else
          newState.wallet.states[stateName] = "has-danger"
        break;
      default:
        break;
    }

    newState.wallet.isValidated = this.isValidated(newState.wallet)

    this.setState(newState)
  }

  async confirmClick(e) {
    e.preventDefault();
    this.setState({ isLoading: true })

    let wallet = { id: this.state.wallet.data.id }
    let patch = this.state.wallet.patch

    for (var [k, v] of Object.entries(patch))
      switch (k) {
        case "name":
          wallet.name = v
          break;
        case "desc":
          wallet.desc = v
          break;
        case "balance":
          wallet.balance = convertMaskedStringToFloat(v, this.state.currency)
          break;
      }

    let result = await this.props.managers.app.walletUpdate(wallet)

    if (result.status == 200) {
      this.objectUpdated()
    }
    else {
      let msg = await this.props.getHttpTranslation(result, this.state.compId, "wallet")
      this.setState({
        isLoading: false,
        alertState: "has-danger",
        alertMsg: msg.text
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

  isValidated(obj) {
    let initial_obj = this.state.initial_wallet

    if (areObjsEqual(initial_obj.data, obj.data))
      return false

    if (Object.values(obj.states).includes("has-danger"))
      return false

    return true
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
            <FormGroup className={`has-label ${wallet.states.name}`}>
              <label>{getString(langId, compId, "input_name")} *</label>
              <Input
                type="text"
                name="name"
                value={wallet.data.name}
                onChange={e => this.onChange(e, e.target.name)}
              />
              {wallet.states.name === "has-danger" ? (
                <label className="error">
                  {getString(langId, compId, "error_name")}
                </label>
              ) : null}
            </FormGroup>
            {/* Description */}
            <FormGroup className={`has-label ${wallet.states.desc}`}>
              <label>{getString(langId, compId, "input_description")}</label>
              <Input
                type="text"
                name="desc"
                value={wallet.data.desc}
                onChange={e => this.onChange(e, e.target.name)}
              />
            </FormGroup>
            {/* Stock Exchange */}
            <FormGroup>
              <label>{getString(langId, compId, "input_stockExchange")}</label>
              <Input
                type="text"
                name="stockExchange"
                value={wallet.data.stockExchange}
                disabled
              />
            </FormGroup>
            {/* Balance */}
            <FormGroup className={`has-label ${wallet.states.balance}`}>
              <label>{getString(langId, compId, "input_balance")}</label>
              <CurrencyInput
                className="form-control text-right"
                placeholder={currency.symbol}
                type="text"
                name="balance"
                value={wallet.data.balance}
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
                !isLoading && wallet.isValidated ?
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