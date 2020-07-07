import React from "react";
import PropTypes from "prop-types";
import Moment from "moment";
// reactstrap components
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Collapse,
  FormGroup,
  Row,
  Col,
  UncontrolledTooltip
} from "reactstrap";
// react plugin used to create datetimepicker
import ReactDatetime from "react-datetime";
// react plugin used to create charts
import { Line, Bar, Pie, Polar } from "react-chartjs-2";
import TagsInput from "react-tagsinput";
import List from "react-list-select";
import FixedButton from "../../components/FixedPlugin/FixedButton";
import FixedFilter from "../../components/FixedPlugin/FixedFilter";
import Skeleton from "react-loading-skeleton";

import LabelAlert from "../../components/LabelAlert";
import ChartManager from "../../core/managers/ChartManager"
import ModalOpenPosition from "../modals/position/ModalOpenPosition";
import { aggrObjList, convertFloatToCurrency, convertFloatToPercentage, orderByAsc } from "../../core/utils";


class OpenPositions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      filtersCollapsed: true,
      tagFilters: [],
      walletOptions: [],

      modal_filters_isOpen: false,
      modal_newPosition_isOpen: false,

      pageFirstLoading: true,
      areMeasuresLoading: true,

      alertMsg: "",
      alertState: "",

      dateFrom: null,
      dateFromState: "",
      dateTo: null,
      dateToState: "",

      dimensions: {
        assets: { data: [], items: [], selected: [], disabled: {} },
        positionDates: { data: [], items: [], selected: [], disabled: {} },
        positionMonths: { data: [], items: [], selected: [], disabled: {} },
        positions: { data: [], items: [], selected: [], disabled: {} },
        positionTypes: { data: [], items: [], selected: [], disabled: {} },
        wallets: { data: [], items: [], selected: [], disabled: {} },
      },
      measures: {
        positions: {
          result: { selectedKpiFormat: "percentage" },
          amountInvested: { selectedKpiFormat: "currency" },
          winners: { selectedKpiFormat: "percentage" },
          rawData: { selection: [], daily: [], monthly: [] }
        }
      },
      charts: {
        positions: {
          amountInvested: {
            selectedChart: "groupByAsset",
            groupByAsset: { data: { datasets: [{}] }, options: {}, hintId: "" },
            groupByCountry: { data: { datasets: [{}] }, options: {}, hintId: "" },
            groupBySector: { data: { datasets: [{}] }, options: {}, hintId: "" }
          },
          result: {
            selectedChart: "daily_overall",
            daily_overall: { data: { datasets: [{}] }, options: {}, hintId: "" },
            daily_groupByAsset: { data: { datasets: [{}] }, options: {}, hintId: "" },
            daily_groupByWallet: { data: { datasets: [{}] }, options: {}, hintId: "" },
          }
        }
      },

      currency: { code: "USD", symbol: "$", thousands_separator_symbol: ",", decimal_symbol: "." }
    }

    this.loadDimensionsAndMeasures = this.loadDimensionsAndMeasures.bind(this)
    this.onSelectionChange = this.onSelectionChange.bind(this)
    this.toggleModal = this.toggleModal.bind(this);
    this.createClick = this.createClick.bind(this);
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }
  componentDidMount() {
    this.props.setNavbarTitleId("title_" + this.state.compId)
    this.prepareData()
  }

  async prepareData() {
    let walletOptions = await this.props.managers.app.walletsForSelect()
    let currency = await this.props.managers.app.currencyRetrieve(this.props.prefs.currency)

    this.setState({ walletOptions, currency })

    await this.loadDimensionsAndMeasures()

    this.setState({ pageFirstLoading: false })
  }
  async loadDimensionsAndMeasures() {
    this.setState({ areMeasuresLoading: true })

    let dimensions = await this.prepareDimensions()
    let measures = await this.handleMeasures(dimensions)
    let charts = this.handleCharts(measures)

    this.setState({ dimensions, measures, charts, areMeasuresLoading: false })
  }

  async prepareDimensions() {
    let dimensions = {}
    let onlyOpen = true

    // NO AUTHENTICATION NEEDED
    // Position Types
    let positionTypes = await this.props.managers.app.positionTypeAsDimension(onlyOpen)
    positionTypes.label = this.props.getString(this.state.langId, "dimensions", "positionTypes")
    if (!positionTypes.error)
      dimensions.positionTypes = positionTypes

    // AUTHENTICATION NEEDED
    // Wallets
    let wallets = await this.props.managers.app.walletAsSelectDimension()
    wallets.label = this.props.getString(this.state.langId, "dimensions", "wallets")
    if (!wallets.error)
      dimensions.wallets = wallets

    // Positions
    let positions = await this.props.managers.app.positionAsSelectDimension(onlyOpen)
    positions.label = this.props.getString(this.state.langId, "dimensions", "positions")
    if (!positions.error)
      dimensions.positions = positions

    // Assets
    let assets = await this.props.managers.app.assetAsSelectDimension(onlyOpen)
    assets.label = this.props.getString(this.state.langId, "dimensions", "assets")
    if (!assets.error)
      dimensions.assets = assets

    // Date
    let positionDates = await this.props.managers.app.dateAsSelectDimension(onlyOpen)
    positionDates.label = this.props.getString(this.state.langId, "dimensions", "positionDates")
    if (!positionDates.error)
      dimensions.positionDates = positionDates

    // Month
    let positionMonths = await this.props.managers.app.monthAsSelectDimension(onlyOpen)
    positionMonths.label = this.props.getString(this.state.langId, "dimensions", "positionMonths")
    if (!positionMonths.error)
      dimensions.positionMonths = positionMonths

    return dimensions
  }

  async handleMeasures(dimensions) {
    this.setState({ areMeasuresLoading: true })

    let { measures } = this.state

    // POSITIONS
    let positionsData = dimensions.positions.data
    let positionsDisabled = [].concat.apply([], Object.values(dimensions.positions.disabled))
    let tSelection = []
    for (var x = 0; x < positionsData.length; x++)
      if (!positionsDisabled.includes(x))
        tSelection.push(positionsData[x])

    // console.log(tSelection)
    // Raw Data for Charts
    measures.positions.rawData.daily = await this.props.managers.measure.rawData(tSelection, "daily")
    measures.positions.rawData.selection = await this.props.managers.measure.rawData(tSelection, "none")
    // Amount Invested
    measures.positions.amountInvested.currency = await this.props.managers.measure.amountInvestedAsKpi(tSelection, "currency")
    measures.positions.amountInvested.percentage = await this.props.managers.measure.amountInvestedAsKpi(tSelection, "percentage")
    // Result
    measures.positions.result.currency = await this.props.managers.measure.resultAsKpi(tSelection, "currency")
    measures.positions.result.percentage = await this.props.managers.measure.resultAsKpi(tSelection, "percentage")
    // Winners
    measures.positions.winners.number = await this.props.managers.measure.winnersAsKpi(tSelection, "number")
    measures.positions.winners.percentage = await this.props.managers.measure.winnersAsKpi(tSelection, "percentage")

    // console.log(measures)

    this.setState({ areMeasuresLoading: false })
    return measures
  }

  handleCharts(measures) {
    let { langId, charts } = this.state

    // POSITIONS
    // Result
    charts.positions.result.daily_overall = ChartManager.line_tResult(
      measures.positions.rawData.daily,
      ["date"],
      "date",
      undefined,
      this.props.getString(langId, "charts", "chart_tooltip_profitability"),
      "default"
    )
    charts.positions.result.daily_overall.hintId = "tResult_overall_hint"

    charts.positions.result.monthly_overall = ChartManager.line_tResult(
      measures.positions.rawData.daily,
      ["month"],
      "month",
      undefined,
      this.props.getString(langId, "charts", "chart_tooltip_profitability"),
      "default"
    )
    charts.positions.result.monthly_overall.hintId = "tResult_overall_hint"

    charts.positions.result.daily_groupByAsset = ChartManager.line_tResult(
      measures.positions.rawData.daily,
      ["date", "asset_label"],
      "date",
      "asset_label",
      undefined,
      "default"
    )
    charts.positions.result.daily_groupByAsset.hintId = "tResult_groupByAsset_hint"

    charts.positions.result.daily_groupByWallet = ChartManager.line_tResult(
      measures.positions.rawData.daily,
      ["date", "wallet_name"],
      "date",
      "wallet_name",
      undefined,
      "default"
    )
    charts.positions.result.daily_groupByWallet.hintId = "tResult_groupByWallet_hint"

    // Amount Invested
    charts.positions.amountInvested.groupByAsset = ChartManager.polar_amountInvested(
      measures.positions.rawData.selection,
      ["asset_label"],
      "asset_label",
      "default"
    )
    charts.positions.amountInvested.groupByAsset.hintId = "amountInvested_groupByAsset_hint"

    charts.positions.amountInvested.groupByCountry = ChartManager.polar_amountInvested(
      measures.positions.rawData.selection,
      ["country_code"],
      "country_code",
      "default"
    )
    charts.positions.amountInvested.groupByCountry.hintId = "amountInvested_groupByCountry_hint"

    charts.positions.amountInvested.groupBySector.hintId = "amountInvested_groupBySector_hint"

    // console.log(charts)

    return charts
  }

  clearSelection(dimension) {
    if (dimension)
      this.onSelectionChangeList(dimension, [])
    else {
      let dimensions = ["assets", "positions", "positionMonths", "positionTypes", "wallets"]
      for (var dimension of dimensions)
        this.onSelectionChangeList(dimension, [])
    }
  }

  handleLinks(callers, dimensions, selection, tDimension) {
    // Prevent infinite loops
    if (callers.includes(tDimension))
      return dimensions

    console.log("callers: " + callers + " || tDimension: " + tDimension)
    console.log(dimensions)
    console.log(selection)

    let firstCaller = callers[0]
    let currCaller = callers[callers.length - 1]
    let linkedIds = []

    let tSelection = []
    let tDimensionData = dimensions[tDimension].data
    let tDisabled = dimensions[tDimension].disabled
    let tSelected = dimensions[tDimension].selected
    let refreshLinks = false

    if (!tDisabled[firstCaller])
      tDisabled[firstCaller] = []

    if (selection.length > 0)
      for (var i of selection)
        for (var id of i.links[tDimension])
          if (!linkedIds.includes(id))
            linkedIds.push(id)

    for (var tObj of tDimensionData) {
      // tSelection prepares selection for next loop (target dimension)
      if ((selection.length == 0 && firstCaller == currCaller) || linkedIds.includes(tObj.id)) {
        tSelection.push(tObj)

        // If item was disabled by a past selection and
        // became selected in this selection, remove it from Disabled array
        if (tDisabled[firstCaller].includes(tObj.id))
          tDisabled[firstCaller].splice(tDisabled[firstCaller].indexOf(tObj.id), 1)
      }
      else {
        if (!tDisabled[firstCaller].includes(tObj.id)) {
          tObj.isDisabled = true
          tDisabled[firstCaller].push(tObj.id)              // Add id into disabled array

          // If a dimension was changed by another firstCaller
          // and items were selected before it, unselect the item. 
          // (prevent item to not get updated after the state change)
          for (var i of tSelection)
            if (tObj.id == i.id) {
              tSelected.splice(tSelected.indexOf(tObj.id), 1)
              refreshLinks = true
            }
        }
      }
    }

    if (refreshLinks)
      dimensions = this.handleLinks([tDimension], dimensions, tSelection, currCaller)

    callers.push(tDimension)
    switch (tDimension) {
      case "assets":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positions")
        break;
      case "positionDates":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positions")
        break;
      case "positionMonths":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positions")
        break;
      case "positions":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "assets")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positionDates")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positionMonths")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positionTypes")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "wallets")
        break;
      case "positionTypes":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positions")
        break;
      case "wallets":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positions")
        break;
      default:
        break;
    }

    return dimensions
  }

  async onSelectionChangeList(dimension, iSelected) {
    let { dimensions } = this.state
    let selection = []

    dimensions[dimension].selected = iSelected

    // Push selected objects accordingly to its index 
    if (iSelected.length > 0)
      for (var i of iSelected)
        selection.push(dimensions[dimension].data[i])

    switch (dimension) {
      case "assets":
        dimensions = this.handleLinks([dimension], dimensions, selection, "positions")
        break;
      case "positionDates":
        dimensions = this.handleLinks([dimension], dimensions, selection, "positions")
        break;
      case "positionMonths":
        dimensions = this.handleLinks([dimension], dimensions, selection, "positions")
        break;
      case "positions":
        dimensions = this.handleLinks([], dimensions, selection, "assets")
        break;
      case "positionTypes":
        dimensions = this.handleLinks([dimension], dimensions, selection, "positions")
        break;
      case "wallets":
        dimensions = this.handleLinks([dimension], dimensions, selection, "positions")
        break;
      default:
        break;
    }

    // Recalculate measures
    let measures = await this.handleMeasures(dimensions)

    let charts = this.handleCharts(measures)

    // Send dimension to tagFilters handler
    let tagFilters = this.handleTagFilters(this.state.tagFilters, dimensions[dimension])

    this.setState({ dimensions, measures, charts, tagFilters })
  }
  async onSelectionChange(dimension, selection) {
    let { dimensions } = this.state

    dimensions[dimension].selected = selection ? selection : []
    selection = selection ? selection : []


    switch (dimension) {
      case "assets":
        dimensions = this.handleLinks([dimension], dimensions, selection, "positions")
        break;
      case "positionDates":
        dimensions = this.handleLinks([dimension], dimensions, selection, "positions")
        break;
      case "positionMonths":
        dimensions = this.handleLinks([dimension], dimensions, selection, "positions")
        break;
      case "positions":
        dimensions = this.handleLinks([], dimensions, selection, "assets")
        break;
      case "positionTypes":
        dimensions = this.handleLinks([dimension], dimensions, selection, "positions")
        break;
      case "wallets":
        dimensions = this.handleLinks([dimension], dimensions, selection, "positions")
        break;
      default:
        break;
    }

    // Recalculate measures
    let measures = await this.handleMeasures(dimensions)

    let charts = this.handleCharts(measures)

    // Send dimension to tagFilters handler
    let tagFilters = this.handleTagFilters(this.state.tagFilters, dimensions[dimension])

    this.setState({ dimensions, measures, charts, tagFilters })
  }

  // Functions used by onSelectChange()
  getSelectedPositions(dateFrom, dateTo) {
    let { dimensions } = this.state;
    let iSelected = []

    for (var x = 0; x < dimensions.positionDates.data.length; x++) {
      let pStartedOn = new Date(dimensions.positionDates.data[x].name)
      if (dateFrom.isBefore(pStartedOn) && dateTo.isAfter(pStartedOn))
        iSelected.push(x)
    }
    return iSelected
  }

  onSelectChange(fieldName, value) {
    let { langId, compId, dateFrom, dateTo } = this.state;
    let newState = {}
    let iSelected = []

    newState[fieldName] = value

    switch (fieldName) {
      case "dateFrom":
        if (value._isAMomentObject)
          newState[fieldName + "State"] = "has-success"
        else
          newState[fieldName + "State"] = "has-danger"

        dateFrom = value
        dateTo = dateTo ? dateTo : Moment()

        if (value._isAMomentObject)
          iSelected = this.getSelectedPositions(dateFrom, dateTo)

        if (iSelected.length > 0) {
          newState.alertState = ""
          newState.alertMsg = ""
        }
        else {
          newState.alertState = "has-danger"
          newState.alertMsg = this.props.getString(langId, compId, "alert_timeInterval_noPositions")
        }

        this.onSelectionChangeList("positionDates", iSelected)
        break;

      case "dateTo":
        if (value._isAMomentObject)
          newState[fieldName + "State"] = "has-success"
        else
          newState[fieldName + "State"] = "has-danger"

        dateFrom = dateFrom ? dateFrom : Moment("2001-01-01T00:00:00")
        dateTo = value

        if (value._isAMomentObject)
          iSelected = this.getSelectedPositions(dateFrom, dateTo)

        if (iSelected.length > 0) {
          newState.alertState = ""
          newState.alertMsg = ""
        }
        else {
          newState.alertState = "has-danger"
          newState.alertMsg = this.props.getString(langId, compId, "alert_timeInterval_noPositions")
        }
      case "wallet":
        console.log(value)
        break;
      default:
        break;
    }

    this.setState(newState)
  }
  isDateValid(fieldName, date) {
    let isValid = false
    var today = new Date()

    switch (fieldName) {
      case "dateFrom":
        let { dateTo } = this.state

        if (dateTo)
          isValid = date.isBefore(today) && date.isBefore(dateTo) ? true : false
        else
          isValid = date.isBefore(today) ? true : false
        break
      case "dateTo":
        let { dateFrom } = this.state

        if (dateFrom)
          isValid = date.isAfter(dateFrom) ? true : false
        else
          isValid = true
        break;
      default:
        break;
    }
    return isValid
  }

  renderTagFilters(props) {
    let { tag, key, disabled, onRemove, classNameRemove, getTagDisplayValue, ...other } = props
    return (
      <span key={key} {...other}>
        {getTagDisplayValue(tag)}
        {<a className={classNameRemove} onClick={(e) => onRemove(key)} />}
      </span>
    )
  }

  handleTagFilters(tagFilters, dimension) {
    // Means it was triggered by onSelectionChange
    if (dimension) {
      if (dimension.selected.length > 0 && !tagFilters.includes(dimension.label))
        tagFilters.push(dimension.label)
      else if (dimension.selected.length == 0 && tagFilters.includes(dimension.label))
        tagFilters.splice(tagFilters.indexOf(dimension.label), 1)
    }
    // Means it was triggered by InputTags
    else {
      for (var dimension of Object.values(this.state.dimensions))
        if (!tagFilters.includes(dimension.label))
          this.onSelectionChangeList(dimension.id, [])
    }

    return tagFilters
  }

  createClick() {
    this.toggleModal("newPosition")
  }
  toggleCollapseFilter(e, dimension) {
    e.preventDefault()
    this.setState({ [dimension + "Collapsed"]: !this.state[dimension + "Collapsed"] })
  }
  toggleModal(modalId) {
    this.setState({ ["modal_" + modalId + "_isOpen"]: !this.state["modal_" + modalId + "_isOpen"] });
  };

  changeChart(e, dimension) {
    e.preventDefault()
    let charts = this.state.charts
    let params = e.target.id.split("__")
    let cName = params[0]
    let toTarget = params[1]

    charts[dimension][cName].selectedChart = toTarget
    this.setState({ charts })
  }
  changeKpiFormat(e, dimension) {
    e.preventDefault()
    let measures = this.state.measures
    let params = e.target.id.split("__")
    let mName = params[0]
    let toTarget = params[1]

    measures[dimension][mName].selectedKpiFormat = toTarget
    this.setState({ measures })
  }

  handleMeasurePresentation(measure) {
    let format = measure.selectedKpiFormat
    let kpiValue = measure[format] && measure[format].data
    let strKpi = this.handleKpiPresentation(format, kpiValue)

    return strKpi
  }
  handleKpiPresentation(format, kpiValue, includePlusMinus = false) {
    let strKpi = ""
    let currency = this.state.currency

    if (includePlusMinus && kpiValue > 0)
      strKpi += "+"

    switch (format) {
      case "currency":
        strKpi += convertFloatToCurrency(kpiValue, currency)
        break;
      case "percentage":
        strKpi += convertFloatToPercentage(kpiValue, currency.decimal_symbol)
        break;
      default:
        strKpi += kpiValue
        break;
    }

    return strKpi
  }

  render() {
    let { getString } = this.props;
    let {
      langId,
      compId,
      filtersCollapsed,
      tagFilters,

      alertMsg,
      alertState,

      dateFrom,
      dateFromState,
      dateTo,
      dateToState,

      modal_filters_isOpen,
      modal_newPosition_isOpen,
      walletOptions,
      currency,

      pageFirstLoading,
      areMeasuresLoading,

      dimensions,
      measures,
      charts
    } = this.state;

    return (
      <div className="content">
        <ModalOpenPosition
          {...this.props}
          modalId="newPosition"
          isOpen={modal_newPosition_isOpen}
          walletOptions={walletOptions}
          currency={currency}
          toggleModal={this.toggleModal}
          runItIfSuccess={this.loadDimensionsAndMeasures}
        />
        {/* Filters */}
        <Row>
          <Col md="12">
            <Card id="openPosition_filters">
              <CardHeader>
                <Row>
                  <Col md="6">
                    <CardTitle tag="h4">{getString(langId, compId, "card_filters")}</CardTitle>
                    <TagsInput
                      renderTag={this.renderTagFilters}
                      disabled
                      value={tagFilters.length > 0 ? tagFilters : ["no filters applied"]}
                      onChange={tagFilters => this.handleTagFilters(tagFilters)}
                      tagProps={{ className: "react-tagsinput-tag" }}
                      inputProps={{ className: 'react-tagsinput-input', placeholder: '' }}
                    />
                  </Col>
                  <Col className="text-right">
                    <Button
                      className="btn-round btn-icon"
                      color="default"
                      size="sm"
                      onClick={e => this.toggleCollapseFilter(e, "filters")}
                    >
                      {
                        filtersCollapsed ?
                          <i className="nc-icon nc-minimal-down" /> :
                          <i className="nc-icon nc-simple-delete" />
                      }
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <Collapse isOpen={!filtersCollapsed}>
                <CardBody>
                  <Row className="justify-content-center">
                    {/* Time Interval */}
                    <Col className="col-md-3 ml-auto mr-auto">
                      <Card>
                        <CardHeader>
                          <CardTitle className="card-category">{getString(langId, "dimensions", "positionDates")}</CardTitle>
                        </CardHeader>
                        <CardBody>
                          <Col md="100%" className="text-left">
                            <FormGroup className={`has-label ${dateFromState}`}>
                              <label>{this.props.getString(langId, compId, "input_dateFrom")}:</label>
                              <ReactDatetime
                                inputProps={{
                                  className: "form-control",
                                  placeholder: this.props.getString(langId, compId, "input_select")
                                }}
                                value={dateFrom}
                                onChange={value => this.onSelectChange("dateFrom", value)}
                                isValidDate={value => this.isDateValid("dateFrom", value)}
                                closeOnSelect
                              />
                            </FormGroup>
                            <FormGroup className={`has-label ${dateToState}`}>
                              <label>{this.props.getString(langId, compId, "input_dateTo")}:</label>
                              <ReactDatetime
                                inputProps={{
                                  className: "form-control",
                                  placeholder: this.props.getString(langId, compId, "input_select")
                                }}
                                value={dateTo}
                                onChange={value => this.onSelectChange("dateTo", value)}
                                isValidDate={value => this.isDateValid("dateTo", value)}
                                closeOnSelect
                              />
                            </FormGroup>
                          </Col>
                          <LabelAlert alertState={alertState} alertMsg={alertMsg} />
                        </CardBody>
                      </Card>
                    </Col>
                    {/* Wallet */}
                    {/* <Col className="col-md-3 ml-auto mr-auto">
                      <Card>
                        <CardHeader>
                          <CardTitle className="card-category">{getString(langId, "dimensions", "wallets")}</CardTitle>
                        </CardHeader>
                        <CardBody>
                          <Col md="100%" className="text-left">
                            <List
                              className="react-select-list primary"
                              items={dimensions.wallets.items}
                              selected={dimensions.wallets.selected}
                              disabled={[].concat.apply([], Object.values(dimensions.wallets.disabled))}
                              multiple={true}
                              onChange={iSelected => this.onSelectionChangeList("wallets", iSelected)}
                            />
                          </Col>
                        </CardBody>
                      </Card>
                    </Col> */}
                    {/* Asset */}
                    <Col className="col-md-3 ml-auto mr-auto">
                      <Card>
                        <CardHeader>
                          <CardTitle className="card-category">{getString(langId, "dimensions", "assets")}</CardTitle>
                        </CardHeader>
                        <CardBody>
                          <Col md="100%" className="text-left">
                            <List
                              className="react-select-list primary"
                              items={dimensions.assets.items}
                              selected={dimensions.assets.selected}
                              disabled={[].concat.apply([], Object.values(dimensions.assets.disabled))}
                              multiple={true}
                              onChange={iSelected => this.onSelectionChangeList("assets", iSelected)}
                            />
                          </Col>
                        </CardBody>
                      </Card>
                    </Col>
                    {/* Type */}
                    <Col className="col-md-2 ml-auto mr-auto">
                      <Card>
                        <CardHeader>
                          <CardTitle className="card-category">{getString(langId, "dimensions", "positionTypes")}</CardTitle>
                        </CardHeader>
                        <CardBody>
                          <Col md="100%" className="text-left">
                            <List
                              className="react-select-list primary"
                              items={dimensions.positionTypes.items}
                              selected={dimensions.positionTypes.selected}
                              disabled={[].concat.apply([], Object.values(dimensions.positionTypes.disabled))}
                              multiple={true}
                              onChange={iSelected => this.onSelectionChangeList("positionTypes", iSelected)}
                            />
                          </Col>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </CardBody>
              </Collapse>
            </Card>
          </Col>
        </Row>
        {/* Cards 1 */}
        <Row>
          <Col lg="3" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="3" xs="4">
                    <div className="icon-big text-center">
                      <i className="nc-icon nc-globe text-warning" />
                    </div>
                  </Col>
                  <Col md="9" xs="8">
                    <div className="numbers">
                      <p className="card-category">
                        {pageFirstLoading ?
                          <Skeleton /> :
                          getString(langId, "measures",
                            measures.positions.amountInvested[measures.positions.amountInvested.selectedKpiFormat].labelId
                          )
                        }
                      </p>
                      <CardTitle tag="p">
                        {pageFirstLoading ?
                          <Skeleton /> :
                          this.handleMeasurePresentation(measures.positions.amountInvested)
                        }
                      </CardTitle>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col className="text-right">
                    {measures.positions.amountInvested.selectedKpiFormat == "percentage" &&
                      measures.positions.amountInvested.percentage.data > 100 ? (
                        <>
                          <i id="amountInvested_alert" className="nc-icon nc-alert-circle-i text-warning" />
                          <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="amountInvested_alert">
                            {getString(langId, "measures", "tAmountInvested_alert_walletBallance")}
                          </UncontrolledTooltip>
                        </>
                      ) : <br />}
                  </Col>
                </Row>
              </CardBody>
              <CardFooter>
                <hr />
                <Row>
                  <Col>
                    <div className="stats">
                      <i className="fa fa-wrench" />
                      {getString(langId, compId, "label_format")}:
                    </div>
                  </Col>
                  <Col className="text-right">
                    <Button
                      className="btn-icon btn-link"
                      color="primary"
                      id="amountInvested__percentage"
                      value="%"
                      size="sm"
                      type="button"
                      onClick={e => this.changeKpiFormat(e, "positions")}
                    >
                      %
                    </Button>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="amountInvested__percentage">
                      {measures.positions.amountInvested.percentage &&
                        getString(langId, "measures", measures.positions.amountInvested.percentage.hintId)
                      }
                    </UncontrolledTooltip>
                    <Button
                      className="btn-icon btn-link"
                      color="success"
                      id="amountInvested__currency"
                      size="sm"
                      type="button"
                      onClick={e => this.changeKpiFormat(e, "positions")}
                    >
                      $
                    </Button>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="amountInvested__currency">
                      {measures.positions.amountInvested.currency &&
                        getString(langId, "measures", measures.positions.amountInvested.currency.hintId)
                      }
                    </UncontrolledTooltip>
                  </Col>
                </Row>
              </CardFooter>
            </Card>
          </Col>
          <Col lg="3" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="3" xs="4">
                    <div className="icon-big text-center">
                      <i className="nc-icon nc-money-coins text-success" />
                    </div>
                  </Col>
                  <Col md="9" xs="8">
                    <div className="numbers">
                      <p className="card-category">
                        {pageFirstLoading ?
                          <Skeleton /> :
                          getString(langId, "measures",
                            measures.positions.result[measures.positions.result.selectedKpiFormat].labelId)
                        }
                      </p>
                      <CardTitle tag="p" className={
                        !pageFirstLoading &&
                          measures.positions.result[measures.positions.result.selectedKpiFormat].data < 0 ?
                          "text-danger" : "text-success"}>
                        {pageFirstLoading ?
                          <Skeleton /> :
                          this.handleMeasurePresentation(measures.positions.result)
                        }
                      </CardTitle>
                    </div>
                  </Col>
                </Row>
              </CardBody>
              <br />
              <CardFooter>
                <hr />
                <Row>
                  <Col>
                    <div className="stats">
                      <i className="fa fa-wrench" />
                      {getString(langId, compId, "label_format")}:
                    </div>
                  </Col>
                  <Col className="text-right">
                    <Button
                      className="btn-icon btn-link"
                      color="primary"
                      id="result__percentage"
                      value="%"
                      size="sm"
                      type="button"
                      onClick={e => this.changeKpiFormat(e, "positions")}
                    >
                      %
                    </Button>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="result__percentage">
                      {measures.positions.result.percentage &&
                        getString(langId, "measures", measures.positions.result.percentage.hintId)
                      }
                    </UncontrolledTooltip>
                    <Button
                      className="btn-icon btn-link"
                      color="success"
                      id="result__currency"
                      size="sm"
                      type="button"
                      onClick={e => this.changeKpiFormat(e, "positions")}
                    >
                      $
                    </Button>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="result__currency">
                      {measures.positions.result.currency &&
                        getString(langId, "measures", measures.positions.result.currency.hintId)
                      }
                    </UncontrolledTooltip>
                  </Col>
                </Row>
              </CardFooter>
            </Card>
          </Col>
          <Col lg="3" md="6" sm="6">
            <Card className="card-stats">
              <CardBody>
                <Row>
                  <Col md="3" xs="4">
                    <div className="icon-big text-center">
                      <i className="nc-icon nc-trophy text-warning" />
                    </div>
                  </Col>
                  <Col md="9" xs="8">
                    <div className="numbers">
                      <p className="card-category">
                        {pageFirstLoading ?
                          <Skeleton /> :
                          getString(langId, "measures",
                            measures.positions.winners[measures.positions.winners.selectedKpiFormat].labelId)
                        }
                      </p>
                      <CardTitle tag="p" className={
                        !pageFirstLoading &&
                          measures.positions.winners.percentage.data < 20 ?
                          "text-danger" : "text-success"}>
                        {pageFirstLoading ?
                          <Skeleton /> :
                          this.handleMeasurePresentation(measures.positions.winners)
                        }
                      </CardTitle>
                    </div>
                  </Col>
                </Row>
              </CardBody>
              <br />
              <CardFooter>
                <hr />
                <Row>
                  <Col>
                    <div className="stats">
                      <i className="fa fa-wrench" />
                      {getString(langId, compId, "label_format")}:
                    </div>
                  </Col>
                  <Col className="text-right">
                    <Button
                      className="btn-icon btn-link"
                      color="primary"
                      id="winners__percentage"
                      value="%"
                      size="sm"
                      type="button"
                      onClick={e => this.changeKpiFormat(e, "positions")}
                    >
                      %
                    </Button>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="winners__percentage">
                      {measures.positions.winners.percentage &&
                        getString(langId, "measures", measures.positions.winners.percentage.hintId)
                      }
                    </UncontrolledTooltip>
                    <Button
                      className="btn-icon btn-link"
                      color="warning"
                      id="winners__number"
                      size="sm"
                      type="button"
                      onClick={e => this.changeKpiFormat(e, "positions")}
                    >
                      #
                    </Button>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="winners__number">
                      {measures.positions.winners.number &&
                        getString(langId, "measures", measures.positions.winners.number.hintId)
                      }
                    </UncontrolledTooltip>
                  </Col>
                </Row>
              </CardFooter>
            </Card>
          </Col>
        </Row>
        {/* Cards 2 */}
        <Row>
          <Col md="6">
            <Card className="card-stats">
              <CardHeader>
                <Row>
                  <Col sm="12">
                    <div className="pull-right">
                      <Badge color={(!pageFirstLoading &&
                        measures.positions.result.percentage.data < 0 ?
                        "danger" : "success")} pill>
                        {this.handleKpiPresentation("percentage",
                          measures.positions.result.percentage && measures.positions.result.percentage.data,
                          true)
                        }
                      </Badge>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <h6 className="big-title">
                  {getString(langId, compId, "chart_title_profitability")}
                </h6>
                <Line
                  data={charts.positions.result[charts.positions.result.selectedChart].data}
                  options={charts.positions.result[charts.positions.result.selectedChart].options}
                />
              </CardBody>
              <CardFooter>
                <hr />
                <Row>
                  <Col md="3">
                    <div className="stats">
                      <i className="fa fa-cube" />
                      {getString(langId, compId, "label_groupBy")}:
                    </div>
                  </Col>
                  <Col md="9" className="text-right">
                    <Button
                      className="btn-link"
                      color="primary"
                      id="result__daily_groupByAsset"
                      size="sm"
                      type="button"
                      onClick={e => this.changeChart(e, "positions")}
                    >
                      {getString(langId, compId, "label_assets")}
                    </Button>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="result__daily_groupByAsset">
                      {getString(langId, "charts", charts.positions.result.daily_groupByAsset.hintId)}
                    </UncontrolledTooltip>
                    <Button
                      className="btn-link"
                      color="primary"
                      id="result__daily_groupByWallet"
                      size="sm"
                      type="button"
                      onClick={e => this.changeChart(e, "positions")}
                    >
                      {getString(langId, compId, "label_wallets")}
                    </Button>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="result__daily_groupByWallet">
                      {getString(langId, "charts", charts.positions.result.daily_groupByWallet.hintId)}
                    </UncontrolledTooltip>
                    <Button
                      className="btn-link"
                      color="primary"
                      id="result__daily_overall"
                      size="sm"
                      type="button"
                      onClick={e => this.changeChart(e, "positions")}
                    >
                      {getString(langId, compId, "label_overall")}
                    </Button>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="result__daily_overall">
                      {getString(langId, "charts", charts.positions.result.daily_overall.hintId)}
                    </UncontrolledTooltip>
                  </Col>
                </Row>
              </CardFooter>
            </Card>
          </Col>
          <Col md="6">
            <Card className="card-stats">
              <CardHeader>
                <Row>
                  <Col sm="12">
                    <div className="pull-right">
                      <Badge color="info" pill>
                        {this.handleKpiPresentation("percentage",
                          measures.positions.result.percentage && measures.positions.result.percentage.data,
                          true
                        )}
                      </Badge>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <h6 className="big-title">
                  {getString(langId, compId, "chart_title_diversification")}
                </h6>
                <Polar
                  data={{ ...charts.positions.amountInvested[charts.positions.amountInvested.selectedChart].data }}
                  options={charts.positions.amountInvested[charts.positions.amountInvested.selectedChart].options}
                />
              </CardBody>
              <CardFooter>
                <hr />
                <Row>
                  <Col md="3">
                    <div className="stats">
                      <i className="fa fa-cube" />
                      {getString(langId, compId, "label_groupBy")}:
                    </div>
                  </Col>
                  <Col md="9" className="text-right">
                    <Button
                      className="btn-link"
                      color="primary"
                      id="amountInvested__groupByAsset"
                      size="sm"
                      type="button"
                      onClick={e => this.changeChart(e, "positions")}
                    >
                      {getString(langId, compId, "label_assets")}
                    </Button>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="amountInvested__groupByAsset">
                      {getString(langId, "charts", charts.positions.amountInvested.groupByAsset.hintId)}
                    </UncontrolledTooltip>
                    <Button
                      className="btn-link"
                      color="primary"
                      id="amountInvested__groupBySector"
                      size="sm"
                      type="button"
                    // onClick={e => this.changeChart(e, "positions")}
                    >
                      {getString(langId, compId, "label_sectors")}
                    </Button>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="amountInvested__groupBySector">
                      {getString(langId, "charts", charts.positions.amountInvested.groupBySector.hintId)}
                    </UncontrolledTooltip>
                    <Button
                      className="btn-link"
                      color="primary"
                      id="amountInvested__groupByCountry"
                      size="sm"
                      type="button"
                      onClick={e => this.changeChart(e, "positions")}
                    >
                      {getString(langId, compId, "label_countries")}
                    </Button>
                    <UncontrolledTooltip delay={{ show: 200 }} placement="bottom" target="amountInvested__groupByCountry">
                      {getString(langId, "charts", charts.positions.amountInvested.groupByCountry.hintId)}
                    </UncontrolledTooltip>
                  </Col>
                </Row>
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <p>{JSON.stringify(dimensions.positions.disabled)}</p>
        <FixedFilter
          {...this.props}
          id="openPositions_filters"
          modalId="filters"
          position="top"
          icon="fa fa-filter fa-2x"
          isOpen={modal_filters_isOpen}
          toggleModal={this.toggleModal}
          onSelectionChange={this.onSelectionChange}
          dimensions={dimensions}
        />
        <FixedButton
          {...this.props}
          id="openPositions_newPosition"
          position="bottom"
          icon="fa fa-plus fa-2x"
          onClick={this.createClick}
        />
      </div >
    )
  }
}

export default OpenPositions;

OpenPositions.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}