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
  UncontrolledTooltip
} from "reactstrap";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";
// react plugin used to create DropdownMenu for selecting items
import Select from "react-select";

import LabelAlert from "../../../components/LabelAlert";
import CurrencyInput from "../../../components/CurrencyInput";
import {
  convertMaskedStringToFloat,
  convertFloatToCurrency,
  verifyLength
} from "../../../core/utils";


class ModalCreateWallet extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      isOpen: props.isOpen,
      isLoading: false,

      stockExchangeOptions: [],
      currency: props.currency,

      // Going to change wallet: {}?, remeber to check/update this.clearInputFields()
      wallet: {
        data: {
          name: "",
          desc: "",
          stockExchange: "",
          balance: "",
        },
        states: {
          name: "",
          stockExchange: "",
          balance: ""
        },
        isValidated: undefined
      },

      alertState: null,
      alertMsg: "",
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.isOpen !== state.isOpen)
      return { isOpen: props.isOpen }

    return null
  }
  async componentDidMount() {
    this.prepareRequirements()
  }
  async prepareRequirements() {
    let stockExchangeOptions = await this.props.managers.market.stockExchangesForSelect()

    this.setState({ stockExchangeOptions })
  }

  fakeUnmount() {
    let { wallet } = this.state

    wallet = {
      data: {
        name: "",
        desc: "",
        stockExchange: "",
        balance: ""
      },
      states: {
        name: "",
        stockExchange: "",
        balance: ""
      },
      isValidated: undefined
    }

    this.setState({ wallet })
  }

  verifyWalletName(walletName) {
    if (!this.props.sWalletNames.includes(walletName))
      return true
    return false
  }

  onChange(event, stateName) {
    let newState = { wallet: this.state.wallet }

    if (this.state.alertState !== null) {
      newState.alertState = null
      newState.alertMsg = ""
    }

    newState.wallet.data[stateName] = event.target.value

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

  async onSelectChange(fieldName, value) {
    let newState = { wallet: this.state.wallet }

    newState.wallet.data[fieldName] = value

    switch (fieldName) {
      case "stockExchange":
        let prevCurrency = this.state.currency
        let newCurrency = await this.props.managers.app.currencyRetrieve(value.currency_code)

        if (prevCurrency != newCurrency) {
          let balance = convertMaskedStringToFloat(newState.wallet.data.balance, prevCurrency)
          newState.wallet.data.balance = convertFloatToCurrency(balance, newCurrency)
        }

        newState.currency = newCurrency
        newState.wallet.states[fieldName] = "has-success"
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

    let { wallet } = this.state

    let data = {
      name: wallet.data.name,
      desc: wallet.data.desc,
      se_short: wallet.data.stockExchange.se_short,
      balance: convertMaskedStringToFloat(wallet.data.balance, this.state.currency),
      currency: this.state.currency.code
    };

    let result = await this.props.managers.app.walletCreate(data)

    if (result.status == 201) {
      this.objectCreated()
    }
    else {
      let msg = await this.props.getHttpTranslation(result, this.compId, "wallet")
      this.setState({
        isLoading: false,
        alertState: "has-danger",
        alertMsg: msg.text
      })
    }
  }

  objectCreated() {
    let { prefs, getString } = this.props;

    this.setState({
      isLoading: false,
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={getString(prefs.locale, this.compId, "alert_created_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
        >
          {getString(prefs.locale, this.compId, "alert_created_text")}
        </ReactBSAlert>
      )
    });

    this.fakeUnmount()
    this.props.runItIfSuccess()
  }

  isValidated(obj) {
    for (var state of Object.values(obj.states))
      if (state != "has-success")
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
    let { prefs, getString, modalId } = this.props;
    let {
      isOpen,
      isLoading,

      currency,
      stockExchangeOptions,

      wallet,

      alert,
      alertState,
      alertMsg,
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
            {this.props.sWalletNames.length == 0 &&
              <label>
                <p>{getString(prefs.locale, this.compId, "label_intro_p1")}</p>
                <p>{getString(prefs.locale, this.compId, "label_intro_p2")}</p>
              </label>
            }
          </CardHeader>
          <CardBody>
            {/* Name */}
            <FormGroup className={`has-label ${wallet.states.name}`}>
              <label>{getString(prefs.locale, this.compId, "input_name")}</label>
              <Input
                type="text"
                name="name"
                value={wallet.data.name}
                onChange={e => this.onChange(e, e.target.name)}
              />
              {wallet.states.name === "has-danger" ? (
                <label className="error">
                  {getString(prefs.locale, this.compId, "error_name")}
                </label>
              ) : null}
            </FormGroup>
            {/* Description */}
            <FormGroup>
              <label>{getString(prefs.locale, this.compId, "input_description")}</label>
              <Input
                type="text"
                name="desc"
                value={wallet.data.desc}
                onChange={e => this.onChange(e, e.target.name)}
              />
            </FormGroup>
            {/* Stock Exchange */}
            <FormGroup className={`has-label ${wallet.states.stockExchange}`}>
              <label>{getString(prefs.locale, this.compId, "input_stockExchange")}
                {" "}
                <i id={"input_stockExchange_hint"} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_stockExchange_hint"}>
                {getString(prefs.locale, this.compId, "input_stockExchange_hint")}
              </UncontrolledTooltip>
              <Select
                className="react-select"
                classNamePrefix="react-select"
                name="stockExchange"
                placeholder={getString(prefs.locale, "generic", "input_select")}
                value={wallet.data.stockExchange}
                options={stockExchangeOptions}
                onChange={value => this.onSelectChange("stockExchange", value)}
              />
            </FormGroup>
            {/* Balance */}
            <FormGroup className={`has-label ${wallet.states.balance}`}>
              <label>{getString(prefs.locale, this.compId, "input_balance")}
                {" "}
                <i id={"input_balance_hint"} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_balance_hint"}>
                {getString(prefs.locale, this.compId, "input_balance_hint")}
              </UncontrolledTooltip>
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
              className="btn-simple btn-round"
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

export default ModalCreateWallet;

ModalCreateWallet.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  getHttpTranslation: PropTypes.func.isRequired,

  sWalletNames: PropTypes.array.isRequired,

  modalId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
  runItIfSuccess: PropTypes.func.isRequired
}