import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Row,
  Col
} from "reactstrap";
import FixedButton from "../../components/FixedPlugin/FixedButton";
import FixedFilter from "../../components/FixedPlugin/filters/OpenPositions";

// Measures
import AmountInvested from "../../components/cards/measures/AmountInvested";
import Profitability from "../../components/cards/measures/Profitability";
import Winners from "../../components/cards/measures/Winners";
import OpCost from "../../components/cards/measures/OpCost";
// Charts
import ProfitabilityOverTime from "../../components/cards/charts/ProfitabilityOverTime";
import Diversification from "../../components/cards/charts/Diversification";

import ChartManager from "../../core/managers/ChartManager"
import ModalOpenPosition from "../modals/position/ModalOpenPosition";


class OpenPositions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      // Prefs
      langId: props.prefs.langId,

      walletOptions: [],

      modal_filters_isOpen: false,
      modal_newPosition_isOpen: false,

      pageFirstLoading: true,

      dimensions: {
        assets: { data: [], items: [], selected: [], disabled: {} },
        dates: { data: [], items: [], selected: [], disabled: {} },
        months: { data: [], items: [], selected: [], disabled: {} },
        positions: { data: [], items: [], selected: [], disabled: {} },
        types: { data: [], items: [], selected: [], disabled: {} },
        wallets: { data: [], items: [], selected: [], disabled: {} },
      },

      measures: {
        positions: {
          rawData: { selection: [], daily: [], monthly: [] },
          amountInvested: { id: "amountInvested" },
          opCost: { id: "opCost" },
          result: { id: "result" },
          winners: { id: "winners" },
        }
      },

      charts: {
        positions: {
          amountInvested: {
            generic: {
              groupByAsset: { data: {}, options: {}, hintId: "" },
              groupByCountry: { data: {}, options: {}, hintId: "" },
              groupBySector: { data: {}, options: {}, hintId: "" }
            }
          },
          result: {
            monthly: {
              overall: { data: {}, options: {}, hintId: "" },
              groupByAsset: { data: {}, options: {}, hintId: "" },
              groupByWallet: { data: {}, options: {}, hintId: "" }
            },
            daily: {
              overall: { data: {}, options: {}, hintId: "" },
              groupByAsset: { data: {}, options: {}, hintId: "" },
              groupByWallet: { data: {}, options: {}, hintId: "" }
            }
          }
        }
      },

      currency: { code: "BRL", symbol: "R$", thousands_separator_symbol: ".", decimal_symbol: "," }
    }

    this.onSelectionChange = this.onSelectionChange.bind(this)
    this.loadDimensionsAndMeasures = this.loadDimensionsAndMeasures.bind(this)
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
    this.prepareRequirements()
  }

  async prepareRequirements() {
    let walletOptions = await this.props.managers.app.walletsForSelect()
    let currency = await this.props.managers.app.currencyRetrieve(this.props.prefs.currency)

    this.setState({ walletOptions, currency })

    await this.loadDimensionsAndMeasures()

    this.setState({ pageFirstLoading: false })
  }
  async loadDimensionsAndMeasures() {
    let dimensions = await this.prepareDimensions()
    let measures = await this.handleMeasures(dimensions)
    let charts = this.handleCharts(measures)

    this.setState({ dimensions, measures, charts })
  }

  async prepareDimensions() {
    let dimensions = {}
    let onlyOpen = true

    // NO AUTHENTICATION NEEDED
    // Position Types
    let types = await this.props.managers.app.positionTypeAsDimension(onlyOpen)
    if (!types.error)
      dimensions.types = types

    // AUTHENTICATION NEEDED
    // Wallets
    let wallets = await this.props.managers.app.walletAsDimension()
    if (!wallets.error)
      dimensions.wallets = wallets

    // Positions
    let positions = await this.props.managers.app.positionAsDimension(onlyOpen)
    if (!positions.error)
      dimensions.positions = positions

    // Assets
    let assets = await this.props.managers.app.assetAsDimension(onlyOpen)
    if (!assets.error)
      dimensions.assets = assets

    // Date
    let dates = await this.props.managers.app.dateAsDimension(onlyOpen)
    if (!dates.error)
      dimensions.dates = dates

    return dimensions
  }

  async handleMeasures(dimensions) {
    let { measures } = this.state

    // POSITIONS
    let positionsData = dimensions.positions.data
    let positionsDisabled = [].concat.apply([], Object.values(dimensions.positions.disabled))
    let tSelection = []
    for (var x = 0; x < positionsData.length; x++)
      if (!positionsDisabled.includes(x))
        tSelection.push(positionsData[x])

    // Raw Data for Charts
    measures.positions.rawData.selection = await this.props.managers.measure.rawData(tSelection, "none")
    measures.positions.rawData.daily = await this.props.managers.measure.rawData(tSelection, "daily")
    measures.positions.rawData.monthly = await this.props.managers.measure.rawData(tSelection, "monthly")
    // Amount Invested
    measures.positions.amountInvested.currency = await this.props.managers.measure.amountInvestedAsKpi(tSelection, "currency")
    measures.positions.amountInvested.percentage = await this.props.managers.measure.amountInvestedAsKpi(tSelection, "percentage")
    // Operational Cost
    measures.positions.opCost.currency = await this.props.managers.measure.opCostAsKpi(tSelection, "currency")
    measures.positions.opCost.percentage = await this.props.managers.measure.opCostAsKpi(tSelection, "percentage")
    // Result
    measures.positions.result.currency = await this.props.managers.measure.resultAsKpi(tSelection, "currency")
    measures.positions.result.percentage = await this.props.managers.measure.resultAsKpi(tSelection, "percentage")
    // Winners
    measures.positions.winners.number = await this.props.managers.measure.winnersAsKpi(tSelection, "number")
    measures.positions.winners.percentage = await this.props.managers.measure.winnersAsKpi(tSelection, "percentage")

    return measures
  }

  handleCharts(measures) {
    let { langId, charts } = this.state

    let aggrProps, chartProps = {}

    // 1 Result
    // 1.1 Daily
    // 1.1.1 Overall
    aggrProps = {
      action: "sum",
      toAggregate: ["date"]
    }
    chartProps = {
      xDimension: "date",
      yDimension: undefined,
      yTooltip: this.props.getString(langId, "charts", "chart_tooltip_profitability"),
      colors: "default"
    }
    charts.positions.result.daily.overall = ChartManager.line_result(
      langId,
      measures.positions.rawData.daily,
      aggrProps,
      chartProps
    )
    charts.positions.result.daily.overall.hintId = "result_overall_hint"
    // 1.1.2 Group By Asset
    aggrProps = {
      type: undefined,
      action: "sum",
      toAggregate: ["date", "asset_label"]
    }
    chartProps = {
      xDimension: "date",
      yDimension: "asset_label",
      yTooltip: undefined,
      colors: "default"
    }
    charts.positions.result.daily.groupByAsset = ChartManager.line_result(
      langId,
      measures.positions.rawData.daily,
      aggrProps,
      chartProps
    )
    charts.positions.result.daily.groupByAsset.hintId = "result_groupByAsset_hint"
    // 1.1.3 Group By Wallet
    aggrProps = {
      action: "sum",
      toAggregate: ["date", "wallet_name"]
    }
    chartProps = {
      xDimension: "date",
      yDimension: "wallet_name",
      yTooltip: undefined,
      colors: "default"
    }
    charts.positions.result.daily.groupByWallet = ChartManager.line_result(
      langId,
      measures.positions.rawData.daily,
      aggrProps,
      chartProps
    )
    charts.positions.result.daily.groupByWallet.hintId = "result_groupByWallet_hint"
    // // 1.2 Monthly
    // // 1.2.1 Overall
    aggrProps = {
      action: "sum",
      toAggregate: ["month"]
    }
    chartProps = {
      xDimension: "month",
      yDimension: undefined,
      yTooltip: this.props.getString(langId, "charts", "chart_tooltip_profitability"),
      colors: "default"
    }
    charts.positions.result.monthly.overall = ChartManager.line_result(
      langId,
      measures.positions.rawData.monthly,
      aggrProps,
      chartProps
    )
    charts.positions.result.monthly.overall.hintId = "result_overall_hint"
    // // 1.2.2 Group By Asset
    aggrProps = {
      type: undefined,
      action: "sum",
      toAggregate: ["month", "asset_label"]
    }
    chartProps = {
      xDimension: "month",
      yDimension: "asset_label",
      yTooltip: undefined,
      colors: "default"
    }
    charts.positions.result.monthly.groupByAsset = ChartManager.line_result(
      langId,
      measures.positions.rawData.monthly,
      aggrProps,
      chartProps
    )
    charts.positions.result.monthly.groupByAsset.hintId = "result_groupByAsset_hint"
    // // 1.2.3 Group By Wallet
    aggrProps = {
      action: "sum",
      toAggregate: ["month", "wallet_name"]
    }
    chartProps = {
      xDimension: "month",
      yDimension: "wallet_name",
      yTooltip: undefined,
      colors: "default"
    }
    charts.positions.result.monthly.groupByWallet = ChartManager.line_result(
      langId,
      measures.positions.rawData.monthly,
      aggrProps,
      chartProps
    )
    charts.positions.result.monthly.groupByWallet.hintId = "result_groupByWallet_hint"
    // ----------------------------------------
    // 2 Amount Invested
    // 2.1 Generic
    // 2.1.1 Group By Asset
    aggrProps = {
      action: "sum",
      toAggregate: ["asset_label"]
    }
    chartProps = {
      xDimension: "asset_label",
      colors: "default"
    }
    charts.positions.amountInvested.generic.groupByAsset = ChartManager.polar_amountInvested(
      langId,
      measures.positions.rawData.selection,
      aggrProps,
      chartProps
    )
    charts.positions.amountInvested.generic.groupByAsset.hintId = "amountInvested_groupByAsset_hint"

    // 2.1.2 Group By Country
    aggrProps = {
      action: "sum",
      toAggregate: ["country_code"]
    }
    chartProps = {
      xDimension: "country_code",
      colors: "default"
    }
    charts.positions.amountInvested.generic.groupByCountry = ChartManager.polar_amountInvested(
      langId,
      measures.positions.rawData.selection,
      aggrProps,
      chartProps
    )
    charts.positions.amountInvested.generic.groupByCountry.hintId = "amountInvested_groupByCountry_hint"

    // 2.1.3 Group By Sector
    charts.positions.amountInvested.generic.groupBySector.hintId = "amountInvested_groupBySector_hint"
    // ----------------------------------------

    return charts
  }

  clearSelection(dimension) {
    let { dimensions } = this.state

    if (dimension)
      this.onSelectionChange(dimension, [])
    else {
      let dimensions = Object.keys(dimensions)
      for (var dimension of dimensions)
        this.onSelectionChange(dimension, [])
    }
  }

  handleLinks(callers, dimensions, selection, tDimension) {
    // Prevent infinite loops
    if (callers.includes(tDimension))
      return dimensions

    // console.log("callers: " + callers + " || tDimension: " + tDimension)
    // console.log(dimensions)
    // console.log(selection)

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

    for (var x = 0; x < tDimensionData.length; x++) {
      //tSelection prepares selection for next loop (target dimension)
      if ((selection.length == 0 && firstCaller == currCaller) || linkedIds.includes(tDimensionData[x].id)) {
        tSelection.push(tDimensionData[x])

        // If item was disabled by a past selection and
        // became selected in this selection, remove it from Disabled array
        if (tDisabled[firstCaller].includes(x))
          tDisabled[firstCaller].splice(tDisabled[firstCaller].indexOf(x), 1)
      }
      else {
        if (!tDisabled[firstCaller].includes(x)) {
          tDisabled[firstCaller].push(x)              // Add index into disabled array

          // If a dimension was changed by another firstCaller
          // and items were selected before, unselect the item. 
          // (prevent item to not get updated after the state change)
          if (tSelected.includes(x)) {
            tSelected.splice(tSelected.indexOf(x), 1)
            refreshLinks = true
          }
        }
      }
    }

    if (refreshLinks)
      dimensions = this.handleLinks([tDimension], dimensions, tSelection, "positions")

    callers.push(tDimension)
    switch (tDimension) {
      case "assets":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positions")
        break;
      case "dates":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positions")
        break;
      case "positions":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "assets")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "dates")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "types")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "wallets")
        break;
      case "types":
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
  async onSelectionChange(callerDimension, iSelected) {
    let { dimensions } = this.state
    let selection = []

    dimensions[callerDimension].selected = iSelected

    // Push selected objects accordingly to its index 
    if (iSelected.length > 0)
      for (var i of iSelected)
        selection.push(dimensions[callerDimension].data[i])

    switch (callerDimension) {
      case "assets":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "positions")
        break;
      case "dates":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "positions")
        break;
      case "positions":
        dimensions = this.handleLinks([], dimensions, selection, "assets")
        break;
      case "types":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "positions")
        break;
      case "wallets":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "positions")
        break;
      default:
        break;
    }

    // Recalculate measures
    let measures = await this.handleMeasures(dimensions)

    let charts = this.handleCharts(measures)

    this.setState({ dimensions, measures, charts })
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

  changeKpiFormat(e, dimension) {
    e.preventDefault()
    let measures = this.state.measures
    let params = e.target.id.split("__")
    let mName = params[0]
    let toTarget = params[1]

    measures[dimension][mName].selectedKpiFormat = toTarget
    this.setState({ measures })
  }

  render() {
    let { getString, prefs } = this.props;
    let {
      compId,
      modal_filters_isOpen,
      modal_newPosition_isOpen,
      walletOptions,
      currency,

      pageFirstLoading,

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
        {/* First Row */}
        <Row>
          <Col lg="3" md="6" sm="6">
            <AmountInvested
              getString={getString}
              prefs={prefs}
              pageFirstLoading={pageFirstLoading}
              measure={measures.positions.amountInvested}
              currency={currency}
            />
          </Col>
          <Col lg="3" md="6" sm="6">
            <Profitability
              getString={getString}
              prefs={prefs}
              pageFirstLoading={pageFirstLoading}
              measure={measures.positions.result}
              currency={currency}
            />
          </Col>
          <Col lg="3" md="6" sm="6">
            <Winners
              getString={getString}
              prefs={prefs}
              pageFirstLoading={pageFirstLoading}
              measure={measures.positions.winners}
              currency={currency}
            />
          </Col>
        </Row>
        {/* Second Row */}
        <Row>
          <Col lg="3" md="6" sm="6">
            <OpCost
              getString={getString}
              prefs={prefs}
              pageFirstLoading={pageFirstLoading}
              measure={measures.positions.opCost}
              currency={currency}
            />
          </Col>
        </Row>
        {/* Third Row */}
        <Row>
          {/* Profitability Over Time */}
          <Col md="6">
            <ProfitabilityOverTime
              getString={getString}
              prefs={prefs}
              pageFirstLoading={pageFirstLoading}
              chart={charts.positions.result}
              measures={measures}
              currency={currency}
            />
          </Col>
          {/* Diversification */}
          <Col md="6">
            <Diversification
              getString={getString}
              prefs={prefs}
              pageFirstLoading={pageFirstLoading}
              chart={charts.positions.amountInvested}
              measures={measures}
              currency={currency}
            />
          </Col>
        </Row>
        <FixedFilter
          {...this.props}
          id={"filters"}
          modalId="filters"
          position="top"
          icon="fa fa-filter fa-2x"
          isOpen={modal_filters_isOpen}
          toggleModal={this.toggleModal}
          dimensions={dimensions}
          onSelectionChange={this.onSelectionChange}
        />
        <FixedButton
          {...this.props}
          id={"newPosition"}
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