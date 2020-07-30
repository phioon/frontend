import React from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
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
  convertFloatToPercentage,
  retrieveObjFromObjList,

  multiply,
  sum,
  verifyGreaterThan,
  verifyIfInteger
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

      position: {
        data: {
          typeIsBuy: true,
          wallet: null,
          asset: null,
          amount: "",

          startedOn: TimeManager.getMoment(undefined, true),
          s_price: 0.00,
          s_cost: 0.00,
          s_opCost: 0.00,
          s_opCostPercent: 0.00,
          s_totalCost: 0.00,
        },
        states: {
          startedOn: "has-success",
          wallet: "",
          asset: "",
          type: "has-success",
          amount: "",
          s_price: "",
        },
        isValidated: undefined
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
    let position = {
      data: {
        typeIsBuy: true,
        wallet: null,
        asset: null,
        amount: "",

        startedOn: TimeManager.getMoment(undefined, true),
        s_price: 0.00,
        s_cost: 0.00,
        s_opCost: 0.00,
        s_opCostPercent: 0.00,
        s_totalCost: 0.00,
      },
      states: {
        wallet: "has-success",
        asset: "",
        startedOn: "",
        amount: "",
        s_price: "",
      },
      isValidated: undefined
    }

    this.setState({ position });
  };

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

    newState.position.data[stateName] = event.target.value

    switch (stateName) {
      case "amount":
        amount = event.target.value
        let s_price = convertMaskedStringToFloat(newState.position.data.s_price, currency)
        let s_cost = multiply(amount, s_price)

        let s_opCost = convertMaskedStringToFloat(newState.position.data.s_opCost, currency)
        let s_opCostPercent = convertMaskedStringToFloat(newState.position.data.s_opCostPercent, currency)

        let s_totalCost = 0

        if (this.state.opCostIsPercentage) {
          s_totalCost = multiply(s_cost, 1 + (s_opCostPercent / 100))
          s_opCost = multiply(s_cost, (s_opCostPercent / 100))
        }
        else {
          s_totalCost = sum(s_cost, s_opCost)
          s_opCostPercent = s_opCost / s_cost * 100
        }

        newState.position.data.s_opCost = convertFloatToCurrency(s_opCost, currency)
        newState.position.data.s_opCostPercent = convertFloatToPercentage(s_opCostPercent, currency.decimal_symbol)
        newState.position.data.s_cost = convertFloatToCurrency(s_cost, currency)
        newState.position.data.s_totalCost = convertFloatToCurrency(s_totalCost, currency)

        if (verifyGreaterThan(amount, 0) && verifyIfInteger(amount))
          newState.position.states[stateName] = "has-success"
        else
          newState.position.states[stateName] = "has-danger"
        break;

      case "s_price":
        amount = newState.position.data.amount
        price = convertMaskedStringToFloat(event.target.value, currency)
        cost = multiply(amount, price)

        opCost = convertMaskedStringToFloat(newState.position.data.s_opCost, currency)
        opCostPercent = convertMaskedStringToFloat(newState.position.data.s_opCostPercent, currency)

        if (this.state.opCostIsPercentage) {
          totalCost = multiply(cost, 1 + (opCostPercent / 100))
          opCost = multiply(cost, (opCostPercent / 100))
        }
        else {
          totalCost = sum(cost, opCost)
          opCostPercent = opCost / cost * 100
        }

        newState.position.data.s_opCost = convertFloatToCurrency(opCost, currency)
        newState.position.data.s_opCostPercent = convertFloatToPercentage(opCostPercent, currency.decimal_symbol)
        newState.position.data.s_cost = convertFloatToCurrency(cost, currency)
        newState.position.data.s_totalCost = convertFloatToCurrency(totalCost, currency)

        if (verifyGreaterThan(price, 0))
          newState.position.states[stateName] = "has-success"
        else
          newState.position.states[stateName] = "has-danger"
        break;

      case "s_opCost":
        cost = convertMaskedStringToFloat(newState.position.data.s_cost, currency)
        opCost = convertMaskedStringToFloat(event.target.value, currency)
        opCostPercent = opCost / cost * 100

        totalCost = sum(cost, opCost)

        newState.position.data.s_opCostPercent = convertFloatToPercentage(opCostPercent, currency.decimal_symbol)
        newState.position.data.s_totalCost = convertFloatToCurrency(totalCost, currency)
        break;

      case "s_opCostPercent":
        cost = convertMaskedStringToFloat(newState.position.data.s_cost, currency)
        opCostPercent = convertMaskedStringToFloat(event.target.value, currency)
        opCost = multiply(cost, (opCostPercent / 100))

        totalCost = sum(cost, opCost)

        newState.position.data.s_opCost = convertFloatToCurrency(opCost, currency)
        newState.position.data.s_totalCost = convertFloatToCurrency(totalCost, currency)

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

    newState.position.data[fieldName] = value

    switch (fieldName) {
      case "asset":
        newState.position.states[fieldName] = "has-success"
        break;
      case "startedOn":
        if (value._isAMomentObject)
          newState.position.states[fieldName] = "has-success"
        else
          newState.position.states[fieldName] = "has-danger"
        break;
      case "wallet":
        this.handleSelect("asset", value.se_short)
        let prevCurrency = this.state.currency
        let newCurrency = await this.props.managers.app.currencyRetrieve(value.currency)

        if (prevCurrency != newCurrency) {
          let price = convertMaskedStringToFloat(newState.position.data.s_price, prevCurrency)
          newState.position.data.s_price = convertFloatToCurrency(price, newCurrency)
          let cost = convertMaskedStringToFloat(newState.position.data.s_cost, prevCurrency)
          newState.position.data.s_cost = convertFloatToCurrency(cost, newCurrency)
          let opCost = convertMaskedStringToFloat(newState.position.data.s_opCost, prevCurrency)
          newState.position.data.s_opCost = convertFloatToCurrency(opCost, newCurrency)
          let totalCost = convertMaskedStringToFloat(newState.position.data.s_totalCost, prevCurrency)
          newState.position.data.s_totalCost = convertFloatToCurrency(totalCost, newCurrency)
        }

        newState.position.states[fieldName] = "has-success"
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

    if (newState.position.data[choiceName] != value) {
      newState.position.data[choiceName] = value
      this.setState(newState)
    }
  }

  async confirmClick(e) {
    e.preventDefault();
    this.setState({ isLoading: true })
    let { compId, position } = this.state

    let positionTypes = await this.props.managers.app.positionTypeData()
    let type = undefined

    if (position.data.typeIsBuy) {
      type = retrieveObjFromObjList(positionTypes, "name", "buy")
      type = type.id
    }
    else {
      type = retrieveObjFromObjList(positionTypes, "name", "sell")
      type = type.id
    }

    let data = {
      started_on: TimeManager.getDatetimeString(position.data.startedOn),
      wallet: position.data.wallet.id,
      asset_symbol: position.data.asset.value,
      asset_label: position.data.asset.label,
      type: type,
      amount: position.data.amount,
      s_unit_price: convertMaskedStringToFloat(position.data.s_price, this.state.currency),
      s_total_price: convertMaskedStringToFloat(position.data.s_cost, this.state.currency),
      s_operational_cost: convertMaskedStringToFloat(position.data.s_opCost, this.state.currency)
    };

    let result = await this.props.managers.app.positionCreate(data)

    if (result.status == 201) {
      this.objectCreated()
    }
    else {
      let msg = await this.props.getHttpTranslation(result, compId, "position")
      this.setState({
        isLoading: false,
        alertState: "has-danger",
        alertMsg: msg.text
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
            <hr />
          </CardHeader>
          <CardBody>
            {/* Type */}
            <Row className="justify-content-center">
              <Col className="col-md-3">
                <div
                  className={classnames("card-choice", { active: position.data.typeIsBuy })}
                  // data-toggle="wizard-checkbox"
                  onClick={() => this.onChoiceChange("typeIsBuy", true)}
                >
                  <input
                    id="buy"
                    name="type"
                    type="radio"
                    defaultChecked={position.data.typeIsBuy}
                  />
                  <div className="icon mm">
                    <i className="nc-icon nc-spaceship mm" />
                  </div>
                  <label>{getString(langId, compId, "input_type_buy")}</label>
                </div>
              </Col>
              <Col className="col-md-3">
                <div
                  className={classnames("card-choice", { active: !position.data.typeIsBuy })}
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
            <FormGroup className={`has-label ${position.states.wallet}`}>
              <label>{getString(langId, compId, "input_wallet")} *</label>
              <Select
                className="react-select"
                classNamePrefix="react-select"
                placeholder={getString(langId, compId, "input_select")}
                name="wallet"
                value={position.data.wallet}
                options={walletOptions}
                onChange={value => this.onSelectChange("wallet", value)}
              />
            </FormGroup>
            {/* Asset */}
            <FormGroup className={`has-label ${position.states.asset}`}>
              <label>{getString(langId, compId, "input_asset")} *</label>
              <Select
                className="react-select"
                classNamePrefix="react-select"
                placeholder={getString(langId, compId, "input_select")}
                name="asset"
                value={position.data.asset}
                options={assetOptions}
                onChange={value => this.onSelectChange("asset", value)}
                noOptionsMessage={() => getString(langId, compId, "input_asset_noOptions")}
              />
            </FormGroup>
            {/* Amount */}
            <FormGroup className={`has-label ${position.states.amount}`}>
              <label>{getString(langId, compId, "input_amount")} *</label>
              <Input
                type="number"
                name="amount"
                value={position.data.amount}
                onChange={e => this.onChange(e, e.target.name)}
              />
            </FormGroup>
            {/* Started On */}
            <Row className="justify-content-center">
              <Col xs="7" md="7">
                <FormGroup className={`has-label ${position.states.startedOn}`}>
                  <label>
                    {this.props.getString(langId, compId, "input_date")}
                    {" "}
                    <i id={"input_date_hint"} className="nc-icon nc-alert-circle-i" />
                  </label>
                  <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_date_hint"}>
                    {getString(langId, compId, "input_date_hint")}
                  </UncontrolledTooltip>
                  <ReactDatetime
                    inputProps={{
                      className: "form-control",
                      placeholder: this.props.getString(langId, compId, "input_select")
                    }}
                    dateFormat={true}
                    timeFormat={true}
                    value={position.data.startedOn}
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
                <FormGroup className={`has-label ${position.states.s_price}`}>
                  <label>{this.props.getString(langId, compId, "input_price")}
                    {" "}
                    <i id={"input_price_hint"} className="nc-icon nc-alert-circle-i" />
                  </label>
                  <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_price_hint"}>
                    {getString(langId, compId, "input_price_hint")}
                  </UncontrolledTooltip>
                  <CurrencyInput
                    className="form-control text-right"
                    placeholder={currency.symbol}
                    type="text"
                    name="s_price"
                    value={position.data.s_price}
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
                  <label>{this.props.getString(langId, compId, "input_cost")}
                    {" "}
                    <i id={"input_cost_hint"} className="nc-icon nc-alert-circle-i" />
                  </label>
                  <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_cost_hint"}>
                    {getString(langId, compId, "input_cost_hint")}
                  </UncontrolledTooltip>
                  <CurrencyInput
                    className="form-control text-right"
                    placeholder={currency.symbol}
                    type="text"
                    name="s_cost"
                    value={position.data.s_cost}
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
                  <label>{this.props.getString(langId, compId, "input_opCost")}
                    {" "}
                    <i id={"input_opCost_hint"} className="nc-icon nc-alert-circle-i" />
                  </label>
                  <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_opCost_hint"}>
                    {getString(langId, compId, "input_opCost_hint")}
                  </UncontrolledTooltip>
                  <CurrencyInput
                    className="form-control text-right"
                    placeholder={opCostIsPercentage ? "%" : currency.symbol}
                    type="text"
                    name={opCostIsPercentage ? "s_opCostPercent" : "s_opCost"}
                    value={opCostIsPercentage ? position.data.s_opCostPercent : position.data.s_opCost}
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
                  <label>{this.props.getString(langId, compId, "input_totalCost")}
                    {" "}
                    <i id={"input_totalCost_hint"} className="nc-icon nc-alert-circle-i" />
                  </label>
                  <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_totalCost_hint"}>
                    {getString(langId, compId, "input_totalCost_hint")}
                  </UncontrolledTooltip>
                  <CurrencyInput
                    className="form-control text-right"
                    placeholder={currency.symbol}
                    type="text"
                    name="s_totalCost"
                    value={position.data.s_totalCost}
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