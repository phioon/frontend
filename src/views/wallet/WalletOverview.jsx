import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Row,
  Col
} from "reactstrap";
import FixedButton from "../../components/FixedPlugin/FixedButton";
import FixedFilter from "../../components/FixedPlugin/filters/Overview";

// Measures
import AmountPositions from "../../components/cards/measures/AmountPositions";
import ClosingVolume from "../../components/cards/measures/ClosingVolume";
import OpCost from "../../components/cards/measures/OpCost";
import OpeningVolume from "../../components/cards/measures/OpeningVolume";
import Profitability from "../../components/cards/measures/Profitability";
import Winners from "../../components/cards/measures/Winners";
// Charts
import ChartManager from "../../core/managers/ChartManager"
import ProfitabilityOverTime from "../../components/cards/charts/ProfitabilityOverTime";
import ProfitabilityRanking from "../../components/cards/charts/ProfitabilityRanking";

import ModalCreateWallet from "../modals/wallet/ModalCreateWallet";
import ModalOpenPosition from "../modals/position/ModalOpenPosition";


class WalletOverview extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),

      // Prefs
      langId: props.prefs.langId,

      walletOptions: [],

      modal_filters_isOpen: false,
      modal_createWallet_isOpen: false,
      modal_openPosition_isOpen: false,

      measureFirstLoading: true,
      chartFirstLoading: true,

      dimensions: {
        assets: { data: [], items: [], selected: [], disabled: {} },
        dates: { data: [], items: [], selected: [], disabled: {} },
        months: { data: [], items: [], selected: [], disabled: {} },
        positions: { data: [], items: [], selected: [], disabled: {} },
        statuses: { data: [], items: [], selected: [], disabled: {} },
        types: { data: [], items: [], selected: [], disabled: {} },
        wallets: { data: [], items: [], selected: [], disabled: {} },
      },

      measures: {
        positions: {
          rawData: { selection: [], daily: [], monthly: [] },
          closingVolume: { id: "closingVolume" },
          count: { id: "count" },
          opCost: { id: "opCost" },
          openingVolume: { id: "openingVolume" },
          result: { id: "result" },
          winners: { id: "winners" },
        }
      },

      charts: {
        positions: {
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
          },
          resultRanking: {
            generic: {
              groupByAsset: {
                hintId: "profitabilityRanking_groupByAsset_hint",
                top5: { data: {}, options: {}, hintId: "" },
                top10: { data: {}, options: {}, hintId: "" },
                bottom5: { data: {}, options: {}, hintId: "" },
                bottom10: { data: {}, options: {}, hintId: "" },
              },
              groupByWallet: {
                hintId: "profitabilityRanking_groupByWallet_hint",
                top5: { data: {}, options: {}, hintId: "" },
                top10: { data: {}, options: {}, hintId: "" },
                bottom5: { data: {}, options: {}, hintId: "" },
                bottom10: { data: {}, options: {}, hintId: "" },
              }
            }
          }
        }
      },

      currency: { code: "BRL", symbol: "R$", thousands_separator_symbol: ".", decimal_symbol: "," }
    }

    this.onSelectionChange = this.onSelectionChange.bind(this)
    this.loadDimensionsAndMeasures = this.loadDimensionsAndMeasures.bind(this)
    this.toggleModal = this.toggleModal.bind(this);
    this.createWallet = this.createWallet.bind(this);
    this.openPosition = this.openPosition.bind(this);
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
    let currency = await this.props.managers.app.currencyRetrieve(this.props.prefs.currency)
    let walletOptions = await this.props.managers.app.walletsForSelect()

    this.setState({ walletOptions, currency })

    await this.loadDimensionsAndMeasures()
  }
  async loadDimensionsAndMeasures() {
    let dimensions = await this.prepareDimensions()
    let measures = await this.handleMeasures(dimensions)
    this.setState({ dimensions, measures, measureFirstLoading: false })

    let charts = await this.handleCharts(dimensions, measures)
    this.setState({ charts, chartFirstLoading: false })
  }

  async prepareDimensions() {
    let dimensions = {}

    // NO AUTHENTICATION NEEDED
    // Position Types
    let types = await this.props.managers.app.positionTypeAsDimension()
    if (!types.error)
      dimensions.types = types

    // AUTHENTICATION NEEDED
    // Assets
    let assets = await this.props.managers.app.assetAsDimension()
    if (!assets.error)
      dimensions.assets = assets

    // Date
    let dates = await this.props.managers.app.dateAsDimension()
    if (!dates.error)
      dimensions.dates = dates

    // Month
    let months = await this.props.managers.app.monthAsDimension()
    if (!months.error)
      dimensions.months = months

    // Positions
    let positions = await this.props.managers.app.positionAsDimension()
    if (!positions.error)
      dimensions.positions = positions

    // Status
    let statuses = await this.props.managers.app.statusAsDimension()
    if (!statuses.error)
      dimensions.statuses = statuses

    // Wallets
    let wallets = await this.props.managers.app.walletAsDimension()
    if (!wallets.error)
      dimensions.wallets = wallets

    // Translation
    dimensions.statuses.items = this.translateItems(dimensions.statuses.items)

    return dimensions
  }

  async handleMeasures(dimensions) {
    let { measures } = this.state

    // POSITIONS
    let positionsData = dimensions.positions.data
    let positionsDisabled = [].concat.apply([], Object.values(dimensions.positions.disabled))
    let selection = []
    for (var x = 0; x < positionsData.length; x++)
      if (!positionsDisabled.includes(x))
        selection.push(positionsData[x])

    // Closing Volume
    measures.positions.closingVolume.currency = await this.props.managers.measure.closingVolumeAsKpi(selection, "currency")
    // Count
    measures.positions.count.number = await this.props.managers.measure.countAsKpi(selection, "number")
    // Operational Cost
    measures.positions.opCost.currency = await this.props.managers.measure.opCostAsKpi(selection, "currency")
    measures.positions.opCost.percentage = await this.props.managers.measure.opCostAsKpi(selection, "percentage")
    // Opening Volume
    measures.positions.openingVolume.currency = await this.props.managers.measure.openingVolumeAsKpi(selection, "currency")
    // Result
    measures.positions.result.currency = await this.props.managers.measure.resultAsKpi(selection, "currency")
    measures.positions.result.percentage = await this.props.managers.measure.resultAsKpi(selection, "percentage")
    // Winners
    measures.positions.winners.number = await this.props.managers.measure.winnersAsKpi(selection, "number")
    measures.positions.winners.percentage = await this.props.managers.measure.winnersAsKpi(selection, "percentage")

    return measures
  }

  async handleCharts(dimensions, measures) {
    let { langId, charts } = this.state
    let aggrProps, chartProps = {}

    // POSITIONS
    let positionsData = dimensions.positions.data
    let positionsDisabled = [].concat.apply([], Object.values(dimensions.positions.disabled))
    let selection = []
    for (var x = 0; x < positionsData.length; x++)
      if (!positionsDisabled.includes(x))
        selection.push(positionsData[x])

    // Raw Data for Charts
    measures.positions.rawData.selection = await this.props.managers.measure.rawData(selection, "none")
    measures.positions.rawData.daily = await this.props.managers.measure.rawData(selection, "daily")
    measures.positions.rawData.monthly = await this.props.managers.measure.rawData(selection, "monthly")

    // 1 Result
    // 1.1 Daily
    // 1.1.1 Overall
    aggrProps = {
      type: "cumulative",
      action: "sum",
      toAggregate: ["date"],
      keyField: "id"
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
      toAggregate: ["date", "asset_label"],
      keyField: "id"
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
      type: "cumulative",
      action: "sum",
      toAggregate: ["date", "wallet_name"],
      keyField: "id"
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
    // 1.2 Monthly
    // 1.2.1 Overall
    aggrProps = {
      type: "cumulative",
      action: "sum",
      toAggregate: ["month"],
      keyField: "id"
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
    // 1.2.2 Group By Asset
    aggrProps = {
      type: undefined,
      action: "sum",
      toAggregate: ["month", "asset_label"],
      keyField: "id"
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
    // 1.2.3 Group By Wallet
    aggrProps = {
      type: "cumulative",
      action: "sum",
      toAggregate: ["month", "wallet_name"],
      keyField: "id"
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
    // 2 Result Ranking
    // 2.1 Generic
    // 2.1.1 Group By Asset
    aggrProps = {
      action: "sum",
      toAggregate: ["asset_label"]
    }
    // 2.1.1.1 Top 5
    chartProps = {
      xDimension: "asset_label",
      isOrderByDesc: true,
      firstXrows: 5,
      colors: ["green", "red"]
    }
    charts.positions.resultRanking.generic.groupByAsset.top5 = ChartManager.bar_resultRanking(
      measures.positions.rawData.selection,
      aggrProps,
      chartProps
    )
    // 2.1.1.2 Top 10
    chartProps = {
      xDimension: "asset_label",
      isOrderByDesc: true,
      firstXrows: 10,
      colors: ["green", "red"]
    }
    charts.positions.resultRanking.generic.groupByAsset.top10 = ChartManager.bar_resultRanking(
      measures.positions.rawData.selection,
      aggrProps,
      chartProps
    )
    // 2.1.1.3 Bottom 5
    chartProps = {
      xDimension: "asset_label",
      isOrderByDesc: false,
      firstXrows: 5,
      colors: ["green", "red"]
    }
    charts.positions.resultRanking.generic.groupByAsset.bottom5 = ChartManager.bar_resultRanking(
      measures.positions.rawData.selection,
      aggrProps,
      chartProps
    )
    // 2.1.1.4 Bottom 5
    chartProps = {
      xDimension: "asset_label",
      isOrderByDesc: false,
      firstXrows: 10,
      colors: ["green", "red"]
    }
    charts.positions.resultRanking.generic.groupByAsset.bottom10 = ChartManager.bar_resultRanking(
      measures.positions.rawData.selection,
      aggrProps,
      chartProps
    )
    // 2.1.2 Group By Wallet
    aggrProps = {
      action: "sum",
      toAggregate: ["wallet_name"]
    }
    // 2.1.2.1 Top 5
    chartProps = {
      xDimension: "wallet_name",
      isOrderByDesc: true,
      firstXrows: 5,
      colors: ["green", "red"]
    }
    charts.positions.resultRanking.generic.groupByWallet.top5 = ChartManager.bar_resultRanking(
      measures.positions.rawData.selection,
      aggrProps,
      chartProps
    )
    // 2.1.2.2 Top 10
    chartProps = {
      xDimension: "wallet_name",
      isOrderByDesc: true,
      firstXrows: 10,
      colors: ["green", "red"]
    }
    charts.positions.resultRanking.generic.groupByWallet.top10 = ChartManager.bar_resultRanking(
      measures.positions.rawData.selection,
      aggrProps,
      chartProps
    )
    // 2.1.2.3 Bottom 5
    chartProps = {
      xDimension: "wallet_name",
      isOrderByDesc: false,
      firstXrows: 5,
      colors: ["green", "red"]
    }
    charts.positions.resultRanking.generic.groupByWallet.bottom5 = ChartManager.bar_resultRanking(
      measures.positions.rawData.selection,
      aggrProps,
      chartProps
    )
    // 2.1.2.4 Bottom 10
    chartProps = {
      xDimension: "wallet_name",
      isOrderByDesc: false,
      firstXrows: 10,
      colors: ["green", "red"]
    }
    charts.positions.resultRanking.generic.groupByWallet.bottom10 = ChartManager.bar_resultRanking(
      measures.positions.rawData.selection,
      aggrProps,
      chartProps
    )

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
        dimensions = this.handleLinks(callers, dimensions, tSelection, "statuses")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "wallets")
        break;
      case "statuses":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positions")
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
      case "months":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "positions")
        break;
      case "positions":
        dimensions = this.handleLinks([], dimensions, selection, "assets")
        break;
      case "statuses":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "positions")
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
    this.setState({ dimensions, measures })

    let charts = await this.handleCharts(dimensions, measures)
    this.setState({ charts })
  }

  translateItems(items) {
    let { getString } = this.props
    let { langId, compId } = this.state

    for (var x = 0; x < items.length; x++)
      items[x] = getString(langId, compId, ["item_" + items[x]])

    return items
  }

  createWallet() {
    this.toggleModal("createWallet")
  }
  openPosition() {
    this.toggleModal("openPosition")
  }

  toggleCollapseFilter(e, dimension) {
    e.preventDefault()
    this.setState({ [dimension + "Collapsed"]: !this.state[dimension + "Collapsed"] })
  }
  toggleModal(modalId) {
    this.setState({ ["modal_" + modalId + "_isOpen"]: !this.state["modal_" + modalId + "_isOpen"] });
  };

  changeChart(dimension, measure, interval, chart) {
    let { charts } = this.state

    if (interval)
      charts[dimension][measure].interval = interval
    if (chart)
      charts[dimension][measure].chart = chart

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

  render() {
    let { getString, prefs, managers } = this.props;
    let {
      modal_filters_isOpen,
      modal_createWallet_isOpen,
      modal_openPosition_isOpen,

      walletOptions,
      currency,

      measureFirstLoading,
      chartFirstLoading,

      dimensions,
      measures,
      charts
    } = this.state;

    return (
      <div className="content">
        <ModalCreateWallet
          {...this.props}
          modalId="createWallet"
          isOpen={modal_createWallet_isOpen}
          sWalletNames={[]}
          currency={currency}
          toggleModal={this.toggleModal}
          runItIfSuccess={this.loadDimensionsAndMeasures}
        />
        <ModalOpenPosition
          {...this.props}
          modalId="openPosition"
          isOpen={modal_openPosition_isOpen}
          walletOptions={walletOptions}
          currency={currency}
          toggleModal={this.toggleModal}
          runItIfSuccess={this.loadDimensionsAndMeasures}
        />
        {/* First Row */}
        <Row className="centered">
          <Col lg="3" md="6" sm="6">
            <OpeningVolume
              getString={getString}
              prefs={prefs}
              managers={managers}
              pageFirstLoading={measureFirstLoading}
              measure={measures.positions.openingVolume}
              currency={currency}
            />
          </Col>
          <Col lg="3" md="6" sm="6">
            <ClosingVolume
              getString={getString}
              prefs={prefs}
              managers={managers}
              pageFirstLoading={measureFirstLoading}
              measure={measures.positions.closingVolume}
              currency={currency}
            />
          </Col>
          <Col lg="3" md="6" sm="6">
            <OpCost
              getString={getString}
              prefs={prefs}
              managers={managers}
              pageFirstLoading={measureFirstLoading}
              measure={measures.positions.opCost}
              currency={currency}
            />
          </Col>
          <Col lg="3" md="6" sm="6">
            <Profitability
              getString={getString}
              prefs={prefs}
              managers={managers}
              pageFirstLoading={measureFirstLoading}
              measure={measures.positions.result}
              currency={currency}
            />
          </Col>
        </Row>
        {/* Second Row */}
        <Row className="centered">
          <Col lg="3" md="6" sm="6">
            <AmountPositions
              getString={getString}
              prefs={prefs}
              managers={managers}
              pageFirstLoading={measureFirstLoading}
              measure={measures.positions.count}
              currency={currency}
            />
          </Col>
          <Col lg="3" md="6" sm="6">
            <Winners
              getString={getString}
              prefs={prefs}
              managers={managers}
              pageFirstLoading={measureFirstLoading}
              measure={measures.positions.winners}
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
              pageFirstLoading={chartFirstLoading}
              chart={charts.positions.result}
              measures={measures}
              currency={currency}
            />
          </Col>
          {/* Profitability Ranking */}
          <Col md="6">
            <ProfitabilityRanking
              getString={getString}
              prefs={prefs}
              pageFirstLoading={chartFirstLoading}
              chart={charts.positions.resultRanking}
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
          showTooltip={measureFirstLoading ? false : dimensions.positions.data.length == 2 ? true : false}
        />
        <FixedButton
          {...this.props}
          id={"newPosition"}
          position="bottom"
          icon="fa fa-plus fa-2x"
          onClick={dimensions.wallets.data.length == 0 ? this.createWallet : this.openPosition}
          showTooltip={measureFirstLoading ? false : dimensions.positions.data.length == 0 ? true : false}
        />
      </div >
    )
  }
}

export default WalletOverview;

WalletOverview.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  managers: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}