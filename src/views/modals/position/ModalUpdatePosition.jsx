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
  Nav,
  NavItem,
  NavLink,
  TabPane,
  Input,
  Row,
  Spinner,
  UncontrolledTooltip,
  TabContent
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
  areObjsEqual,
  convertMaskedStringToFloat,
  convertFloatToCurrency,
  convertFloatToPercentage,
  deepCloneObj,
  retrieveObjFromObjList,

  multiply,
  sum,
  verifyGreaterThan,
  verifyIfInteger
} from "../../../core/utils";


class ModalUpdatePosition extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isOpen: props.isOpen,
      isLoading: false,

      walletOptions: props.walletOptions,
      assetOptions: [],
      opCostIsPercentage: true,   // true = Porcentage
      activeNavId: "start",

      initial_position: props.position,
      position: props.position,

      currency: props.currency,

      alertState: null,
      alertMsg: "",
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    if (props.isOpen !== state.isOpen) {
      return {
        isOpen: props.isOpen,
        currency: props.currency,
        walletOptions: props.walletOptions,
        assetOptions: props.assetOptions,
        initial_position: deepCloneObj(props.position),
        position: props.position,
      }
    }

    return null
  }

  async handleSelect(model, se_short = null) {
    let newState = {}

    switch (model) {
      case "asset":
        newState.assetOptions = await this.props.managers.market.assetsForSelect(se_short);
        break;
      default:
        break;
    }

    this.setState(newState)
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

    newState.position.data[stateName] = event.target.value

    switch (stateName) {
      case "amount":
        newState.position.patch[stateName] = event.target.value

        amount = event.target.value
        let s_price = convertMaskedStringToFloat(newState.position.data.s_price, currency)
        let e_price = convertMaskedStringToFloat(newState.position.data.e_price, currency)
        let s_cost = multiply(amount, s_price)
        let e_cost = multiply(amount, e_price)

        let s_opCost = convertMaskedStringToFloat(newState.position.data.s_opCost, currency)
        let e_opCost = convertMaskedStringToFloat(newState.position.data.e_opCost, currency)
        let s_opCostPercent = convertMaskedStringToFloat(newState.position.data.s_opCostPercent, currency)
        let e_opCostPercent = convertMaskedStringToFloat(newState.position.data.e_opCostPercent, currency)

        let s_totalCost = 0
        let e_totalCost = 0

        if (this.state.opCostIsPercentage) {
          s_totalCost = multiply(s_cost, 1 + (s_opCostPercent / 100))
          e_totalCost = multiply(e_cost, 1 + (e_opCostPercent / 100))
          s_opCost = multiply(s_cost, (s_opCostPercent / 100))
          e_opCost = multiply(e_cost, (e_opCostPercent / 100))
        }
        else {
          s_totalCost = sum(s_cost, s_opCost)
          e_totalCost = sum(e_cost, e_opCost)
          s_opCostPercent = s_opCost / s_cost * 100
          e_opCostPercent = e_opCost / e_cost * 100
        }

        newState.position.data.s_opCost = convertFloatToCurrency(s_opCost, currency)
        newState.position.data.e_opCost = convertFloatToCurrency(e_opCost, currency)
        newState.position.data.s_opCostPercent = convertFloatToPercentage(s_opCostPercent, currency.decimal_symbol)
        newState.position.data.e_opCostPercent = convertFloatToPercentage(e_opCostPercent, currency.decimal_symbol)
        newState.position.data.s_cost = convertFloatToCurrency(s_cost, currency)
        newState.position.data.e_cost = convertFloatToCurrency(e_cost, currency)
        newState.position.data.s_totalCost = convertFloatToCurrency(s_totalCost, currency)
        newState.position.data.e_totalCost = convertFloatToCurrency(e_totalCost, currency)

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

      case "e_price":
        amount = newState.position.data.amount
        price = convertMaskedStringToFloat(event.target.value, currency)
        cost = multiply(amount, price)

        opCost = convertMaskedStringToFloat(newState.position.data.e_opCost, currency)
        opCostPercent = convertMaskedStringToFloat(newState.position.data.e_opCostPercent, currency)

        if (this.state.opCostIsPercentage) {
          totalCost = multiply(cost, 1 + (opCostPercent / 100))
          opCost = multiply(cost, (opCostPercent / 100))
        }
        else {
          totalCost = sum(cost, opCost)
          opCostPercent = opCost / cost * 100
        }

        newState.position.data.e_opCost = convertFloatToCurrency(opCost, currency)
        newState.position.data.e_opCostPercent = convertFloatToPercentage(opCostPercent, currency.decimal_symbol)
        newState.position.data.e_cost = convertFloatToCurrency(cost, currency)
        newState.position.data.e_totalCost = convertFloatToCurrency(totalCost, currency)

        if (verifyGreaterThan(price, 0))
          newState.position.states[stateName] = "has-success"
        else
          newState.position.states[stateName] = "has-danger"

        if (!newState.position.data.endedOn && (price > 0 || opCost > 0)) {
          newState.alertState = ""
          newState.alertMsg = this.props.getString(this.state.langId, this.state.compId,
            newState.position.data.typeIsBuy ? "alert_saleDateMissing" : "alert_purchaseDateMissing")
        }
        break;

      case "s_opCost":
        cost = convertMaskedStringToFloat(newState.position.data.s_cost, currency)
        opCost = convertMaskedStringToFloat(event.target.value, currency)
        opCostPercent = opCost / cost * 100

        totalCost = sum(cost, opCost)

        newState.position.data.s_opCostPercent = convertFloatToPercentage(opCostPercent, currency.decimal_symbol)
        newState.position.data.s_totalCost = convertFloatToCurrency(totalCost, currency)

        break;

      case "e_opCost":
        cost = convertMaskedStringToFloat(newState.position.data.e_cost, currency)
        opCost = convertMaskedStringToFloat(event.target.value, currency)
        opCostPercent = opCost / cost * 100

        totalCost = sum(cost, opCost)

        newState.position.data.e_opCostPercent = convertFloatToPercentage(opCostPercent, currency.decimal_symbol)
        newState.position.data.e_totalCost = convertFloatToCurrency(totalCost, currency)

        if (!newState.position.data.endedOn && (convertMaskedStringToFloat(newState.position.data.e_price, currency) > 0 || opCost > 0)) {
          newState.alertState = ""
          newState.alertMsg = this.props.getString(this.state.langId, this.state.compId,
            newState.position.data.typeIsBuy ? "alert_saleDateMissing" : "alert_purchaseDateMissing")
        }
        break;

      case "s_opCostPercent":
        cost = convertMaskedStringToFloat(newState.position.data.s_cost, currency)
        opCostPercent = convertMaskedStringToFloat(event.target.value, currency)
        opCost = multiply(cost, (opCostPercent / 100))

        totalCost = sum(cost, opCost)

        newState.position.data.s_opCost = convertFloatToCurrency(opCost, currency)
        newState.position.patch.s_opCost = convertFloatToCurrency(opCost, currency)

        newState.position.data.s_totalCost = convertFloatToCurrency(totalCost, currency)
        newState.position.patch.s_totalCost = convertFloatToCurrency(totalCost, currency)

        break;

      case "e_opCostPercent":
        cost = convertMaskedStringToFloat(newState.position.data.e_cost, currency)
        opCostPercent = convertMaskedStringToFloat(event.target.value, currency)
        opCost = multiply(cost, (opCostPercent / 100))

        totalCost = sum(cost, opCost)

        newState.position.data.e_opCost = convertFloatToCurrency(opCost, currency)
        newState.position.patch.e_opCost = convertFloatToCurrency(opCost, currency)

        newState.position.data.e_totalCost = convertFloatToCurrency(totalCost, currency)
        newState.position.patch.e_totalCost = convertFloatToCurrency(totalCost, currency)

        if (!newState.position.data.endedOn && (convertMaskedStringToFloat(newState.position.data.e_price, currency) > 0 || opCost > 0)) {
          newState.alertState = ""
          newState.alertMsg = this.props.getString(this.state.langId, this.state.compId,
            newState.position.data.typeIsBuy ? "alert_saleDateMissing" : "alert_purchaseDateMissing")
        }
        break;
      default:
        break;
    }

    newState.position.isValidated = this.isValidated(newState.position)

    this.setState(newState)
  }
  async onSelectChange(fieldName, value) {
    let newState = { position: this.state.position }
    let currency = this.state.currency

    if (this.state.alertState !== null) {
      newState.alertState = null
      newState.alertMsg = ""
    }

    newState.position.data[fieldName] = value
    newState.position.patch[fieldName] = value

    switch (fieldName) {
      case "asset":
        newState.position.states[fieldName] = "has-success"
        break;
      case "startedOn":
        if (value._isAMomentObject) {
          newState.position.states[fieldName] = "has-success"

          if (newState.position.data.endedOn && newState.position.data.endedOn._isAMomentObject)
            if (value.isSameOrBefore(newState.position.data.endedOn))
              newState.position.states[fieldName] = "has-success"
            else
              newState.position.states[fieldName] = "has-danger"
        }
        else
          newState.position.states[fieldName] = "has-danger"
        break;
      case "endedOn":
        if (!value) {
          newState.position.data[fieldName] = null
          newState.position.states[fieldName] = ""
        }
        else if (value._isAMomentObject) {
          newState.position.states[fieldName] = "has-success"

          if (newState.position.data.startedOn._isAMomentObject)
            if (value.isSameOrAfter(newState.position.data.startedOn))
              newState.position.states[fieldName] = "has-success"
            else
              newState.position.states[fieldName] = "has-danger"
        }
        else
          newState.position.states[fieldName] = "has-danger"

        if (!value && (
          convertMaskedStringToFloat(newState.position.data.e_price, currency) > 0 ||
          convertMaskedStringToFloat(newState.position.data.e_opCost, currency) > 0)) {

          newState.alertState = ""
          newState.alertMsg = this.props.getString(this.state.langId, this.state.compId,
            newState.position.data.typeIsBuy ? "alert_saleDateMissing" : "alert_purchaseDateMissing")
        }

        break;
      case "wallet":
        this.handleSelect("asset", value.se_short)
        let prevCurrency = this.state.currency
        let newCurrency = await this.props.managers.app.currencyRetrieve(value.currency)

        if (prevCurrency != newCurrency) {
          let price = 0, cost = 0, opCost = 0, totalCost = 0;
          // Start
          price = convertMaskedStringToFloat(newState.position.data.s_price, prevCurrency)
          newState.position.data.s_price = convertFloatToCurrency(price, newCurrency)
          cost = convertMaskedStringToFloat(newState.position.data.s_cost, prevCurrency)
          newState.position.data.s_cost = convertFloatToCurrency(cost, newCurrency)
          opCost = convertMaskedStringToFloat(newState.position.data.s_opCost, prevCurrency)
          newState.position.data.s_opCost = convertFloatToCurrency(opCost, newCurrency)
          totalCost = convertMaskedStringToFloat(newState.position.data.s_totalCost, prevCurrency)
          newState.position.data.s_totalCost = convertFloatToCurrency(totalCost, newCurrency)
          // End
          price = convertMaskedStringToFloat(newState.position.data.e_price, prevCurrency)
          newState.position.data.e_price = convertFloatToCurrency(price, newCurrency)
          cost = convertMaskedStringToFloat(newState.position.data.e_cost, prevCurrency)
          newState.position.data.e_cost = convertFloatToCurrency(cost, newCurrency)
          opCost = convertMaskedStringToFloat(newState.position.data.e_opCost, prevCurrency)
          newState.position.data.e_opCost = convertFloatToCurrency(opCost, newCurrency)
          totalCost = convertMaskedStringToFloat(newState.position.data.e_totalCost, prevCurrency)
          newState.position.data.e_totalCost = convertFloatToCurrency(totalCost, newCurrency)
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
      newState.position.patch[choiceName] = value
    }

    newState.position.isValidated = this.isValidated(newState.position)

    this.setState(newState)
  }

  toggleNavLink(navId, value) {
    this.setState({ [navId]: value })
  }

  async confirmClick(e) {
    e.preventDefault();
    this.setState({ isLoading: true })

    let position = { id: this.state.position.data.id }
    let patch = this.state.position.patch
    let currency = this.state.currency

    for (var [k, v] of Object.entries(patch))
      switch (k) {
        case "typeIsBuy":
          let positionTypes = await this.props.managers.app.positionTypeData()
          let type = undefined

          if (patch.typeIsBuy)
            type = retrieveObjFromObjList(positionTypes, "name", "buy")
          else
            type = retrieveObjFromObjList(positionTypes, "name", "sell")

          position.type = type.id
          break;
        case "wallet":
          position.wallet = v.id
          break;
        case "asset":
          position.asset_symbol = v.value
          position.asset_label = v.label
          break;
        case "amount":
          position[k] = v
          break;
        case "startedOn":
          position.started_on = TimeManager.getDatetimeString(v)
          break;
        case "endedOn":
          position.ended_on = TimeManager.getDatetimeString(v)
          break;
        case "e_price":
          position.e_unit_price = convertMaskedStringToFloat(v, currency)
          break;
        default:
          break;
      }


    // The following attributes are taken separatedly because changing one may affect others.
    position.s_unit_price = convertMaskedStringToFloat(this.state.position.data.s_price, currency)
    position.s_total_price = convertMaskedStringToFloat(this.state.position.data.s_cost, currency)
    position.s_operational_cost = convertMaskedStringToFloat(this.state.position.data.s_opCost, currency)

    position.e_unit_price = convertMaskedStringToFloat(this.state.position.data.e_price, currency)
    position.e_total_price = convertMaskedStringToFloat(this.state.position.data.e_cost, currency)
    position.e_operational_cost = convertMaskedStringToFloat(this.state.position.data.e_opCost, currency)

    let result = await this.props.managers.app.positionUpdate(position)

    if (result.status == 200) {
      this.objectUpdated(this.state.position)
      // Send signal to sync dRaw for this asset.
    }
    else {
      let msg = await this.props.getHttpTranslation(result, this.state.compId, "position")
      this.setState({
        isLoading: false,
        alertState: "has-danger",
        alertMsg: msg.text
      })
    }
  }

  objectUpdated(position) {
    this.setState({
      isLoading: false,
      alert: (
        <ReactBSAlert
          success
          style={{ display: "block", marginTop: "-100px" }}
          title={this.props.getString(this.state.langId, this.state.compId, "alert_updated_title")}
          onConfirm={() => this.hideAlert()}
          confirmBtnBsStyle="primary"
        >
          {this.props.getString(this.state.langId, this.state.compId, "alert_updated_text")}
        </ReactBSAlert>
      )
    });

    // Send MarketManager a signal to sync this asset.
    this.props.managers.market.dRawList(false, position.data.asset.value, position.data.started_on, position.data.ended_on)

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

  isDateValid(fieldName, date) {
    let today = new Date()
    let result = null

    switch (fieldName) {
      case "startedOn":
        result = date.isBefore(today) ? true : false
        break;
      case "endedOn":
        let startedOn = this.state.position.data.startedOn
        result = date.isBefore(today) && date.isSameOrAfter(startedOn) ? true : false
        break;
      default:
        break;
    }
    return result
  }

  hideAlert() {
    this.setState({
      alert: null
    });
    this.props.toggleModal(this.props.modalId)
  };

  StartData() {
    let { getString } = this.props;
    let { langId, compId, position, opCostIsPercentage, currency } = this.state;

    return (
      <TabPane tabId="start">
        {/* Started On */}
        <Row className="justify-content-center">
          <Col xs="7" md="7">
            <FormGroup className={`has-label ${position.states.startedOn}`}>
              <label>
                {position.data.typeIsBuy ?
                  getString(langId, compId, "input_purchaseDate") :
                  getString(langId, compId, "input_saleDate")
                }
              </label>
              <ReactDatetime
                inputProps={{
                  className: "form-control",
                  placeholder: getString(langId, "generic", "input_select")
                }}
                locale={getString(langId, "locales", langId)}
                value={position.data.startedOn}
                onChange={value => this.onSelectChange("startedOn", value)}
                isValidDate={value => this.isDateValid("startedOn", value)}
                closeOnSelect
              />
            </FormGroup>
          </Col>
        </Row >
        {/* Price */}
        <Row className="justify-content-center">
          <Col xs="7" md="7">
            <FormGroup className={`has-label ${position.states.s_price}`}>
              <label>{getString(langId, compId, "input_price")}
                {" "}
                <i id={"input_s_price_hint"} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_s_price_hint"}>
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
              <label>{getString(langId, compId, "input_cost")}
                {" "}
                <i id={"input_s_cost_hint"} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_s_cost_hint"}>
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
              <label>{getString(langId, compId, "input_opCost")}
                {" "}
                <i id={"input_s_opCost_hint"} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_s_opCost_hint"}>
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
              {getString(langId, compId, "opCost_percentage_hint")}
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
              {getString(langId, compId, "opCost_currency_hint")}
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
              <label>{getString(langId, compId, "input_totalCost")}
                {" "}
                <i id={"input_s_totalCost_hint"} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_s_totalCost_hint"}>
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
      </TabPane>
    )
  }
  EndData() {
    let { getString } = this.props;
    let { langId, compId, position, opCostIsPercentage, currency } = this.state;

    return (
      <TabPane tabId="end">
        {/* Ended On */}
        <Row className="justify-content-center">
          <Col xs="7" md="7">
            <FormGroup className={`has-label ${position.states.endedOn}`}>
              <label>
                {position.data.typeIsBuy ?
                  getString(langId, compId, "input_saleDate") :
                  getString(langId, compId, "input_purchaseDate")
                }
              </label>
              <ReactDatetime
                inputProps={{
                  className: "form-control",
                  placeholder: getString(langId, "generic", "input_select")
                }}
                locale={getString(langId, "locales", langId)}
                value={position.data.endedOn}
                onChange={value => this.onSelectChange("endedOn", value)}
                isValidDate={value => this.isDateValid("endedOn", value)}
                closeOnSelect
              />
            </FormGroup>
          </Col>
        </Row >
        {/* Price */}
        <Row className="justify-content-center">
          <Col xs="7" md="7">
            <FormGroup className={`has-label ${position.states.e_price}`}>
              <label>{getString(langId, compId, "input_price")}
                {" "}
                <i id={"input_e_price_hint"} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_e_price_hint"}>
                {getString(langId, compId, "input_price_hint")}
              </UncontrolledTooltip>
              <CurrencyInput
                className="form-control text-right"
                placeholder={currency.symbol}
                type="text"
                name="e_price"
                value={position.data.e_price}
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
              <label>{getString(langId, compId, "input_cost")}
                {" "}
                <i id={"input_e_cost_hint"} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_e_cost_hint"}>
                {getString(langId, compId, "input_cost_hint")}
              </UncontrolledTooltip>
              <CurrencyInput
                className="form-control text-right"
                placeholder={currency.symbol}
                type="text"
                name="e_cost"
                value={position.data.e_cost}
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
              <label>{getString(langId, compId, "input_opCost")}
                {" "}
                <i id={"input_e_opCost_hint"} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_e_opCost_hint"}>
                {getString(langId, compId, "input_opCost_hint")}
              </UncontrolledTooltip>
              <CurrencyInput
                className="form-control text-right"
                placeholder={opCostIsPercentage ? "%" : currency.symbol}
                type="text"
                name={opCostIsPercentage ? "e_opCostPercent" : "e_opCost"}
                value={opCostIsPercentage ? position.data.e_opCostPercent : position.data.e_opCost}
                onChange={e => this.onChange(e, e.target.name)}
                maskOptions={{
                  prefix: opCostIsPercentage ? "" : currency.symbol + " ",
                  suffix: opCostIsPercentage ? " %" : "",
                  thousandsSeparatorSymbol: currency.thousande_separator_symbol,
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
              {getString(langId, compId, "opCost_percentage_hint")}
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
              {getString(langId, compId, "opCost_currency_hint")}
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
              <label>{getString(langId, compId, "input_totalCost")}
                {" "}
                <i id={"input_e_totalCost_hint"} className="nc-icon nc-alert-circle-i" />
              </label>
              <UncontrolledTooltip delay={{ show: 200 }} placement="top" target={"input_e_totalCost_hint"}>
                {getString(langId, compId, "input_totalCost_hint")}
              </UncontrolledTooltip>
              <CurrencyInput
                className="form-control text-right"
                placeholder={currency.symbol}
                type="text"
                name="e_totalCost"
                value={position.data.e_totalCost}
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
      </TabPane>
    )
  }

  isValidated(obj) {
    let initial_obj = this.state.initial_position

    if (areObjsEqual(initial_obj.data, obj.data))
      return false

    if (Object.values(obj.states).includes("has-danger"))
      return false

    return true
  }

  render() {
    let { getString, modalId } = this.props;
    let {
      langId, compId, isOpen, isLoading,

      assetOptions,
      walletOptions,
      activeNavId,

      position,

      alert,
      alertState,
      alertMsg,
    } = this.state;

    return (
      <Modal isOpen={isOpen} size="md" toggle={() => this.props.toggleModal(modalId)}>
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
              {getString(langId, compId, "title")}
            </h5>
            <hr />
            <label>
              <p>{getString(langId, compId, "label_intro_p1")}</p>
              <p>{getString(langId, compId, "label_intro_p2")}</p>
            </label>
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
              <label>{getString(langId, compId, "input_wallet")}</label>
              <Select
                className="react-select"
                classNamePrefix="react-select"
                placeholder={getString(langId, "generic", "input_select")}
                name="wallet"
                value={position.data.wallet}
                options={walletOptions}
                onChange={value => this.onSelectChange("wallet", value)}
              />
            </FormGroup>
            {/* Asset */}
            <FormGroup className={`has-label ${position.states.asset}`}>
              <label>{getString(langId, compId, "input_asset")}</label>
              <Select
                className="react-select"
                classNamePrefix="react-select"
                placeholder={getString(langId, "generic", "input_select")}
                name="asset"
                value={position.data.asset}
                options={assetOptions}
                onChange={value => this.onSelectChange("asset", value)}
              />
            </FormGroup>
            {/* Amount */}
            <FormGroup className={`has-label ${position.states.amount}`}>
              <label>{getString(langId, compId, "input_amount")}</label>
              <Input
                type="number"
                name="amount"
                value={position.data.amount}
                onChange={e => this.onChange(e, e.target.name)}
              />
            </FormGroup>
            <br />
            <div className="nav-tabs-navigation">
              <div className="nav-tabs-wrapper">
                <Nav tabs>
                  {/* START */}
                  <NavItem>
                    <NavLink
                      href="#"
                      className={activeNavId == "start" ? "active" : ""}
                      onClick={() => this.toggleNavLink("activeNavId", "start")}
                    >
                      {getString(langId, compId, "tab_openingInfo")}
                    </NavLink>
                  </NavItem>
                  {/* END */}
                  <NavItem>
                    <NavLink
                      href="#"
                      className={activeNavId == "end" ? "active" : ""}
                      onClick={() => this.toggleNavLink("activeNavId", "end")}
                    >
                      {getString(langId, compId, "tab_closingInfo")}
                    </NavLink>
                  </NavItem>
                </Nav>
              </div>
            </div>
            <br />
            <TabContent activeTab={activeNavId}>
              {this.StartData()}
              {this.EndData()}
            </TabContent>
          </CardBody>
          <CardFooter className="text-center">
            <LabelAlert alertState={alertState} alertMsg={alertMsg} />
            <Button
              className="btn-round"
              color="success"
              data-dismiss="modal"
              type="submit"
              disabled={
                !isLoading && position.isValidated ?
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

export default ModalUpdatePosition;

ModalUpdatePosition.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  getHttpTranslation: PropTypes.func.isRequired,

  position: PropTypes.object.isRequired,

  modalId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired,
  runItIfSuccess: PropTypes.func.isRequired
}