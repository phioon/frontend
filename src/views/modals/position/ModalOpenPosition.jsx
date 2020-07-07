import React from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
// javascript plugin used to create scrollbars on windows
import PerfectScrollbar from "perfect-scrollbar";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Col,
  FormGroup,
  Modal,
  Input,
  Row,
  Spinner,
  UncontrolledTooltip
} from "reactstrap";
// react plugin used to create DropdownMenu for selecting items
import Select from "react-select";
// react component used to create sweet alerts
import ReactBSAlert from "react-bootstrap-sweetalert";
// react plugin used to create datetimepicker
import ReactDatetime from "react-datetime";

import TimeManager from "../../../core/managers/TimeManager";
import LabelAlert from "../../../components/LabelAlert";
import CurrencyInput from "../../../components/CurrencyInput";
import {
  convertMaskedStringToFloat,
  convertFloatToCurrency,
  convertFloatToPercentage
} from "../../../core/utils";


class ModalOpenPosition extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isOpen: props.isOpen,
      isLoading: false,

      currency: props.currency,

      walletOptions: props.walletOptions,
      assetOptions: [],
      opCostIsPercentage: false,   // true = Porcentage
      activeNavId: "open",

      // Going to change position: {}?, remeber to check/update this.clearInputFields()
      position: {
        startedOn: null,
        startedOnState: "",
        wallet: null,
        walletState: "",
        asset: null,
        assetState: "",
        typeIsBuy: true,        // false = Sell
        typeState: "",
        amount: "",
        amountState: "",
        s_price: 0.00,
        s_priceState: "",
        s_cost: 0.00,
        s_opCost: 0.00,
        s_opCostPercent: 0.00,
        s_totalCost: 0.00,
      },

      alert: null,
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
        walletOptions: props.walletOptions,
        currency: props.currency
      }

    return null
  }

  clearInputFields = () => {
    this.setState({
      position: {
        startedOn: null,
        startedOnState: "",
        wallet: null,
        walletState: "",
        asset: null,
        assetState: "",
        typeIsBuy: true,        // false = Sell
        typeState: "",
        amount: "",
        amountState: "",
        s_price: 0.00,
        s_priceState: "",
        s_cost: 0.00,
        s_opCost: 0.00,
        s_opCostPercent: 0.00,
        s_totalCost: 0.00,
      },
    });
  };

  // function that verifies if number is a integer
  verifyIfInteger = (value) => {
    if (value % 1 == 0)
      return true;
    return false;
  };
  // function that verifies if a number is greater than another number
  verifyGreaterThan = (value, gt) => {
    if (value > gt) {
      return true;
    }
    return false;
  };
  // function to multiply two values, turning it into decimals
  multiply(n1, n2) {
    return Math.round((n1 * n2) * 100) / 100
  }
  // function to sum two values, turning it into decimals
  sum(n1, n2) {
    return Math.round((n1 + n2) * 100) / 100
  }

  onChange(event, stateName) {
    let amount = 0
    let price = 0
    let cost = 0
    let opCost = 0
    let opCostPercent = 0
    let totalCost = 0
    let currency = this.state.currency
    let newState = { position: this.state.position }

    if (this.state.alertState !== null) {
      newState.alertState = null
      newState.alertMsg = ""
    }

    newState.position[stateName] = event.target.value

    switch (stateName) {
      case "amount":
        amount = event.target.value
        let s_price = convertMaskedStringToFloat(newState.position.s_price, currency)
        let e_price = convertMaskedStringToFloat(newState.position.e_price, currency)
        let s_cost = this.multiply(amount, s_price)
        let e_cost = this.multiply(amount, e_price)

        let s_opCost = convertMaskedStringToFloat(newState.position.s_opCost, currency)
        let e_opCost = convertMaskedStringToFloat(newState.position.e_opCost, currency)
        let s_opCostPercent = convertMaskedStringToFloat(newState.position.s_opCostPercent, currency)
        let e_opCostPercent = convertMaskedStringToFloat(newState.position.e_opCostPercent, currency)

        let s_totalCost = 0
        let e_totalCost = 0

        if (this.state.opCostIsPercentage) {
          s_totalCost = this.multiply(s_cost, 1 + (s_opCostPercent / 100))
          e_totalCost = this.multiply(e_cost, 1 + (e_opCostPercent / 100))
          s_opCost = this.multiply(s_cost, (s_opCostPercent / 100))
          e_opCost = this.multiply(e_cost, (e_opCostPercent / 100))
        }
        else {
          s_totalCost = this.sum(s_cost, s_opCost)
          e_totalCost = this.sum(e_cost, e_opCost)
          s_opCostPercent = s_opCost / s_cost * 100
          e_opCostPercent = e_opCost / e_cost * 100
        }

        newState.position.s_opCost = convertFloatToCurrency(s_opCost, currency)
        newState.position.e_opCost = convertFloatToCurrency(e_opCost, currency)
        newState.position.s_opCostPercent = convertFloatToPercentage(s_opCostPercent, currency.decimal_symbol)
        newState.position.e_opCostPercent = convertFloatToPercentage(e_opCostPercent, currency.decimal_symbol)
        newState.position.s_cost = convertFloatToCurrency(s_cost, currency)
        newState.position.e_cost = convertFloatToCurrency(e_cost, currency)
        newState.position.s_totalCost = convertFloatToCurrency(s_totalCost, currency)
        newState.position.e_totalCost = convertFloatToCurrency(e_totalCost, currency)

        if (this.verifyGreaterThan(amount, 0) && this.verifyIfInteger(amount))
          newState.position[stateName + "State"] = "has-success"
        else
          newState.position[stateName + "State"] = "has-danger"
        break;

      case "s_price":
        amount = newState.position.amount
        price = convertMaskedStringToFloat(event.target.value, currency)
        cost = this.multiply(amount, price)

        opCost = convertMaskedStringToFloat(newState.position.s_opCost, currency)
        opCostPercent = convertMaskedStringToFloat(newState.position.s_opCostPercent, currency)

        if (this.state.opCostIsPercentage) {
          totalCost = this.multiply(cost, 1 + (opCostPercent / 100))
          opCost = this.multiply(cost, (opCostPercent / 100))
        }
        else {
          totalCost = this.sum(cost, opCost)
          opCostPercent = opCost / cost * 100
        }

        newState.position.s_opCost = convertFloatToCurrency(opCost, currency)
        newState.position.s_opCostPercent = convertFloatToPercentage(opCostPercent, currency.decimal_symbol)
        newState.position.s_cost = convertFloatToCurrency(cost, currency)
        newState.position.s_totalCost = convertFloatToCurrency(totalCost, currency)

        if (this.verifyGreaterThan(price, 0))
          newState.position[stateName + "State"] = "has-success"
        else
          newState.position[stateName + "State"] = "has-danger"
        break;

      case "s_opCost":
        cost = convertMaskedStringToFloat(newState.position.s_cost, currency)
        opCost = convertMaskedStringToFloat(event.target.value, currency)
        opCostPercent = opCost / cost * 100

        totalCost = this.sum(cost, opCost)

        newState.position.s_opCostPercent = convertFloatToPercentage(opCostPercent, currency.decimal_symbol)
        newState.position.s_totalCost = convertFloatToCurrency(totalCost, currency)

        if (this.verifyGreaterThan(opCost, 0))
          newState.position[stateName + "State"] = "has-success"
        else
          newState.position[stateName + "State"] = "has-danger"
        break;

      case "s_opCostPercent":
        cost = convertMaskedStringToFloat(newState.position.s_cost, currency)
        opCostPercent = convertMaskedStringToFloat(event.target.value, currency)
        opCost = this.multiply(cost, (opCostPercent / 100))

        totalCost = this.sum(cost, opCost)

        newState.position.s_opCost = convertFloatToCurrency(opCost, currency)
        newState.position.s_totalCost = convertFloatToCurrency(totalCost, currency)

        if (this.verifyGreaterThan(opCostPercent, 0))
          newState.position[stateName + "State"] = "has-success"
        else
          newState.position[stateName + "State"] = "has-danger"
        break;
      default:
        break;
    }

    newState.position.isValidated = this.isValidated(newState.position)

    this.setState(newState)
  }

  async handleSelect(model, se_short = null) {
    let newState = {}

    switch (model) {
      case "asset":
        newState.assetOptions = await this.props.managers.market.assetsForSelect(se_short)
      default:
        break;
    }
    this.setState(newState)
  }
  async onSelectChange(fieldName, value) {
    let newState = { position: this.state.position }

    newState.position[fieldName] = value

    switch (fieldName) {
      case "asset":
        newState.position[fieldName + "State"] = "has-success"
        break;
      case "startedOn":
        if (value._isAMomentObject)
          newState.position[fieldName + "State"] = "has-success"
        else
          newState.position[fieldName + "State"] = "has-danger"
        break;
      case "wallet":
        this.handleSelect("asset", value.se_short)
        let prevCurrency = this.state.currency
        let newCurrency = await this.props.managers.app.currencyRetrieve(value.currency)

        if (prevCurrency != newCurrency) {
          let price = convertMaskedStringToFloat(newState.position.s_price, prevCurrency)
          newState.position.s_price = convertFloatToCurrency(price, newCurrency)
          let cost = convertMaskedStringToFloat(newState.position.s_cost, prevCurrency)
          newState.position.s_cost = convertFloatToCurrency(cost, newCurrency)
          let opCost = convertMaskedStringToFloat(newState.position.s_opCost, prevCurrency)
          newState.position.s_opCost = convertFloatToCurrency(opCost, newCurrency)
          let totalCost = convertMaskedStringToFloat(newState.position.s_totalCost, prevCurrency)
          newState.position.s_totalCost = convertFloatToCurrency(totalCost, newCurrency)
        }

        newState.position[fieldName + "State"] = "has-success"
        newState.currency = newCurrency
        break;
      default:
        break;
    }

    newState.position.isValidated = this.isValidated(newState.position)

    this.setState(newState)
  }

  onChoiceChange(choiceName, value) {
    let newState = { position: this.state.position }

    if (newState.position[choiceName] != value)
      newState.position[choiceName] = value

    this.setState(newState)
  }

  async confirmClick(e) {
    e.preventDefault();
    this.setState({ isLoading: true })

    let position = {
      started_on: TimeManager.getDatetimeString(this.state.position.startedOn),
      wallet: this.state.position.wallet.id,
      asset_symbol: this.state.position.asset.value,
      asset_label: this.state.position.asset.label,
      type: this.state.position.typeIsBuy ? 1 : 2,
      amount: this.state.position.amount,
      s_unit_price: convertMaskedStringToFloat(this.state.position.s_price, this.state.currency),
      s_total_price: convertMaskedStringToFloat(this.state.position.s_cost, this.state.currency),
      s_operational_cost: convertMaskedStringToFloat(this.state.position.s_opCost, this.state.currency)
    };

    let result = await this.props.managers.app.positionCreate(position)

    if (result.status == 201) {
      this.objectCreated()
    }
    else {
      this.setState({
        isLoading: false,
        alertState: "has-danger",
        alertMsg: await this.props.getHttpTranslation(result, this.state.compId, "position")
      })
    }
  }

  objectCreated() {
    this.setState({
      isLoading: false,
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={this.props.getString(this.state.langId, this.state.compId, "alert_created_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="info"
        >
          {this.props.getString(this.state.langId, this.state.compId, "alert_created_text")}
        </ReactBSAlert>
      )
    });

    this.clearInputFields()
    this.props.runItIfSuccess()
  }

  changeInputFormat(e) {
    e.preventDefault()
    let params = e.target.id.split("_")
    let inputName = params[0]
    let newFormat = params[1]

    switch (inputName) {
      case "opCost":
        if (newFormat == "percentage")
          this.setState({ opCostIsPercentage: true })
        else
          this.setState({ opCostIsPercentage: false })
        break;
      default:
        break;
    }
  }

  isDateValid(date) {
    var today = new Date()
    return date.isBefore(today) ? true : false
  }
  isValidated(position) {
    if (position.walletState === "has-success" &&
      position.assetState === "has-success" &&
      position.amountState === "has-success" &&
      position.startedOnState === "has-success" &&
      position.s_priceState === "has-success")
      return true

    return false
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

      currency,

      assetOptions,
      walletOptions,
      opCostIsPercentage,

      position,

      alert,
      alertState,
      alertMsg,
    } = this.state;

    return (
      <Modal isOpen={isOpen} size="md" toggle={() => this.props.toggleModal(modalId)} ref="modal_openPosition">
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
            {/* Type */}
            <Row className="justify-content-center">
              <Col className="col-md-3">
                <div
                  className={classnames("card-choice", { active: position.typeIsBuy })}
                  // data-toggle="wizard-checkbox"
                  onClick={() => this.onChoiceChange("typeIsBuy", true)}
                >
                  <input
                    id="buy"
                    name="type"
                    type="radio"
                    defaultChecked={position.typeIsBuy}
                  />
                  <div className="icon mm">
                    <i className="nc-icon nc-spaceship mm" />
                  </div>
                  <label>{getString(langId, compId, "input_type_buy")}</label>
                </div>
              </Col>
              <Col className="col-md-3">
                <div
                  className={classnames("card-choice", { active: !position.typeIsBuy })}
                  // data-toggle="wizard-checkbox"
                  onClick={() => this.onChoiceChange("typeIsBuy", false)}
                >
                  <input
                    id="sell"
                    name="type"
                    type="radio"
                  />
                  <div className="icon mm">
                    <i className="nc-icon nc-spaceship fa-rotate-90 mm" />
                  </div>
                  <label>{getString(langId, compId, "input_type_sell")}</label>
                </div>
              </Col>
            </Row>
            <br />
            {/* Wallet */}
            <FormGroup className={`has-label ${position.walletState}`}>
              <label>{getString(langId, compId, "input_wallet")} *</label>
              <Select
                className="react-select"
                classNamePrefix="react-select"
                placeholder={getString(langId, compId, "input_select")}
                name="wallet"
                value={position.wallet}
                options={walletOptions}
                onChange={value => this.onSelectChange("wallet", value)}
              />
            </FormGroup>
            {/* Asset */}
            <FormGroup className={`has-label ${position.assetState}`}>
              <label>{getString(langId, compId, "input_asset")} *</label>
              <Select
                className="react-select"
                classNamePrefix="react-select"
                placeholder={getString(langId, compId, "input_select")}
                name="asset"
                value={position.asset}
                options={assetOptions}
                onChange={value => this.onSelectChange("asset", value)}
              />
            </FormGroup>
            {/* Amount */}
            <FormGroup className={`has-label ${position.amountState}`}>
              <label>{getString(langId, compId, "input_amount")} *</label>
              <Input
                type="number"
                name="amount"
                value={position.amount}
                onChange={e => this.onChange(e, e.target.name)}
              />
            </FormGroup>
            {/* Started On */}
            <Row className="justify-content-center">
              <Col xs="7" md="7">
                <FormGroup className={`has-label ${position.startedOnState}`}>
                  <label>{this.props.getString(langId, compId, "input_date")} *</label>
                  <ReactDatetime
                    inputProps={{
                      className: "form-control",
                      placeholder: this.props.getString(langId, compId, "input_select")
                    }}
                    value={position.startedOn}
                    onChange={value => this.onSelectChange("startedOn", value)}
                    isValidDate={this.isDateValid}
                    closeOnSelect
                  />
                </FormGroup>
              </Col>
            </Row >
            {/* Price */}
            <Row className="justify-content-center">
              <Col xs="7" md="7">
                <FormGroup className={`has-label ${position.s_priceState}`}>
                  <label>{this.props.getString(langId, compId, "input_price")} *</label>
                  <CurrencyInput
                    className="form-control text-right"
                    placeholder={currency.symbol}
                    type="text"
                    name="s_price"
                    value={position.s_price}
                    onChange={e => this.onChange(e, e.target.name)}
                    maskOptions={{
                      prefix: currency.symbol + " ",
                      thousandsSeparatorSymbol: currency.thousands_separator_symbol,
                      decimalSymbol: currency.decimal_symbol,
                      integerLimit: 11
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            {/* Cost */}
            <Row className="justify-content-center">
              <Col xs="7" md="7">
                <FormGroup>
                  <label>{this.props.getString(langId, compId, "input_cost")}</label>
                  <CurrencyInput
                    className="form-control text-right"
                    placeholder={currency.symbol}
                    type="text"
                    name="s_cost"
                    value={position.s_cost}
                    disabled
                    maskOptions={{
                      prefix: currency.symbol + " ",
                      thousandsSeparatorSymbol: currency.thousands_separator_symbol,
                      decimalSymbol: currency.decimal_symbol,
                      integerLimit: 18
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            {/* opCost */}
            <Row className="justify-content-center">
              <Col xs="1" md="1" />
              <Col xs="1" md="1" className="centered">
                <i className="nc-icon nc-simple-add" />
              </Col>
              <Col xs="7" md="7">
                <FormGroup>
                  <label>{this.props.getString(langId, compId, "input_opCost")}</label>
                  <CurrencyInput
                    className="form-control text-right"
                    placeholder={opCostIsPercentage ? "%" : currency.symbol}
                    type="text"
                    name={opCostIsPercentage ? "s_opCostPercent" : "s_opCost"}
                    value={opCostIsPercentage ? position.s_opCostPercent : position.s_opCost}
                    onChange={e => this.onChange(e, e.target.name)}
                    maskOptions={{
                      prefix: opCostIsPercentage ? "" : currency.symbol + " ",
                      suffix: opCostIsPercentage ? " %" : "",
                      thousandsSeparatorSymbol: currency.thousands_separator_symbol,
                      decimalSymbol: currency.decimal_symbol,
                      integerLimit: opCostIsPercentage ? 2 : 11
                    }}
                  />
                </FormGroup>
              </Col>
              {/* Operational Cost Format */}
              <Col xs="2" md="2" className="centered">
                <Button
                  className="btn-icon btn-link"
                  color="primary"
                  id="opCost_percentage"
                  value="%"
                  size="sm"
                  type="button"
                  onClick={e => this.changeInputFormat(e)}
                >
                  %
                    </Button>
                <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="opCost_percentage">
                  {this.props.getString(langId, compId, "opCost_percentage_hint")}
                </UncontrolledTooltip>
                <Button
                  className="btn-icon btn-link"
                  color="success"
                  id="opCost_currency"
                  name="opCost_currency"
                  size="sm"
                  type="button"
                  onClick={e => this.changeInputFormat(e)}
                >
                  $
                    </Button>
                <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="opCost_currency">
                  {this.props.getString(langId, compId, "opCost_currency_hint")}
                </UncontrolledTooltip>
              </Col>
            </Row>
            {/* TotalCost  */}
            <Row className="justify-content-center">
              <Col xs="1" md="1" className="centered">
                <h6>=</h6>
              </Col>
              <Col xs="7" md="7">
                <FormGroup>
                  <label>{this.props.getString(langId, compId, "input_totalCost")}</label>
                  <CurrencyInput
                    className="form-control text-right"
                    placeholder={currency.symbol}
                    type="text"
                    name="s_totalCost"
                    value={position.s_totalCost}
                    onChange={e => this.onChange(e, e.target.name)}
                    disabled
                    maskOptions={{
                      prefix: currency.symbol + " ",
                      thousandsSeparatorSymbol: currency.thousands_separator_symbol,
                      decimalSymbol: currency.decimal_symbol,
                      integerLimit: 18
                    }}
                  />
                </FormGroup>
              </Col>
              <Col xs="1" md="1" />
            </Row>
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
                  position.isValidated ?
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
      </Modal >
    )
  }
}

export default ModalOpenPosition;

ModalOpenPosition.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  getHttpTranslation: PropTypes.func.isRequired,
  modalId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
  runItIfSuccess: PropTypes.func.isRequired
}