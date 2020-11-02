import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Row,
  Col
} from "reactstrap";

// Filters
import FilterCard from "../../components/cards/filters/FilterCard";
import DimensionSelect from "../../components/cards/filters/selects/DimensionSelect";
import DimentionTimeInterval from "../../components/cards/filters/selects/DimensionTimeInterval";
// Measures
import AmountPositions from "../../components/cards/measures/AmountPositions";
import CloseVolume from "../../components/cards/measures/CloseVolume";
import OpCost from "../../components/cards/measures/OpCost";
import OpenVolume from "../../components/cards/measures/OpenVolume";
import Profitability from "../../components/cards/measures/Profitability";
import Winners from "../../components/cards/measures/Winners";
// Charts
import ChartManager from "../../core/managers/ChartManager"
import ProfitabilityOverTime from "../../components/cards/charts/ProfitabilityOverTime";
import ProfitabilityRanking from "../../components/cards/charts/ProfitabilityRanking";

import FixedButton from "../../components/FixedPlugin/FixedButton";
import ModalCreateWallet from "../modals/wallet/ModalCreateWallet";
import ModalOpenPosition from "../modals/position/ModalOpenPosition";

import { getDistinctValuesFromList } from "../../core/utils";

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
        types: { data: [], items: [], selected: [] },
        pAssets: { data: [], items: [], selected: [] },
        mAssets: { data: [], items: [], selected: [] },
        openDates: { data: [], items: [], selected: [] },
        closeDates: { data: [], items: [], selected: [] },
        positions: { data: [], items: [], selected: [] },
        statuses: { data: [], items: [], selected: [] },
        sectors: { data: [], items: [], selected: [] },
        wallets: { data: [], items: [], selected: [] },
      },

      measures: {
        positions: {
          rawData: { selection: [], daily: [], monthly: [] },
          closeVolume: { id: "closeVolume" },
          count: { id: "count" },
          opCost: { id: "opCost" },
          openVolume: { id: "openVolume" },
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

    this.prepareRequirements = this.prepareRequirements.bind(this)
    this.onSelectionChange = this.onSelectionChange.bind(this)
    this.clearSelection = this.clearSelection.bind(this)
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

    let dimensions = await this.prepareDimensions()
    this.prepareMeasuresAndCharts(dimensions)
  }
  async prepareDimensions() {
    let dimensions = { ...this.state.dimensions }
    let rawData = []

    // App Manager...
    for (var dimension of Object.keys(dimensions)) {
      switch (dimension) {
        case "types":
          rawData.push(this.props.managers.app.positionTypeAsSelectDimension())
          break;
        case "wallets":
          rawData.push(this.props.managers.app.walletAsSelectDimension())
          break;
        case "positions":
          rawData.push(this.props.managers.app.positionAsSelectDimension())
          break;
        case "statuses":
          rawData.push(this.props.managers.app.statusAsSelectDimension())
          break;
        case "openDates":
          rawData.push(this.props.managers.app.openDateAsSelectDimension())
          break;
        case "closeDates":
          rawData.push(this.props.managers.app.closeDateAsSelectDimension())
          break;
        case "pAssets":
          // Position Assets
          rawData.push(this.props.managers.app.assetAsSelectDimension())
          break;
      }
    }
    rawData = await Promise.all(rawData)

    let pAssetsIndex = Object.keys(dimensions).indexOf("pAssets")
    let assetList = getDistinctValuesFromList(rawData[pAssetsIndex].data, "value")

    for (var dimension of Object.keys(dimensions)) {
      switch (dimension) {
        case "mAssets":
          // Market Assets
          rawData.push(this.props.managers.market.assetAsSelectDimension(assetList))
          break;
        case "sectors":
          rawData.push(this.props.managers.market.sectorAsSelectDimension(assetList))
          break;
      }
    }
    rawData = await Promise.all(rawData)

    // Customizations...
    for (var dimension of Object.values(rawData)) {
      switch (dimension.id) {
        case "types":
          if (!dimension.error) {
            dimension.data = this.translateObjField(dimension.id, dimension.data, "label")
            dimensions[dimension.id] = dimension
          }
          break;
        case "statuses":
          if (!dimension.error) {
            dimension.data = this.translateObjField(dimension.id, dimension.data, "label")
            dimensions[dimension.id] = dimension
          }
          break;
        case "sectors":
          if (!dimension.error) {
            dimension.data = this.translateObjField(dimension.id, dimension.data, "label")
            dimensions[dimension.id] = dimension
          }
          break;
        default:
          dimensions[dimension.id] = dimension
          break;
      }
    }

    return dimensions
  }
  async prepareMeasuresAndCharts(dimensions) {
    let selection = []

    for (var obj of dimensions.positions.data)
      if (!obj.isDisabled)
        selection.push(obj)

    let measures = await this.handleMeasures(selection)
    this.setState({ dimensions, measures, measureFirstLoading: false })

    let charts = await this.handleCharts(selection, measures)
    this.setState({ charts, chartFirstLoading: false })
  }
  async handleMeasures(selection) {
    let { measures } = this.state

    // Close Volume
    measures.positions.closeVolume.currency = await this.props.managers.measure.closeVolumeAsKpi(selection, "currency")
    // Count
    measures.positions.count.number = await this.props.managers.measure.countAsKpi(selection, "number")
    // Operational Cost
    measures.positions.opCost.currency = await this.props.managers.measure.opCostAsKpi(selection, "currency")
    measures.positions.opCost.percentage = await this.props.managers.measure.opCostAsKpi(selection, "percentage")
    // Open Volume
    measures.positions.openVolume.currency = await this.props.managers.measure.openVolumeAsKpi(selection, "currency")
    // Result
    measures.positions.result.currency = await this.props.managers.measure.resultAsKpi(selection, "currency")
    measures.positions.result.percentage = await this.props.managers.measure.resultAsKpi(selection, "percentage")
    // Winners
    measures.positions.winners.number = await this.props.managers.measure.winnersAsKpi(selection, "number")
    measures.positions.winners.percentage = await this.props.managers.measure.winnersAsKpi(selection, "percentage")

    return measures
  }
  async handleCharts(selection, measures) {
    let { langId, charts } = this.state
    let aggrProps, chartProps = {}

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
  translateObjField(dimensionId, objList, field) {
    let { getString } = this.props
    let { langId, compId } = this.state

    switch (dimensionId) {
      case "types":
        for (var obj of objList)
          obj[field] = getString(langId, compId, [`item_${obj[field]}`])
        break;
      case "statuses":
        for (var obj of objList)
          obj[field] = getString(langId, compId, [`item_${obj[field]}`])
        break;
      case "sectors":
        for (var obj of objList)
          obj[field] = getString(langId, "sectors", obj[field])
        break;
    }

    return objList
  }

  clearSelection() {
    let dimensions = { ...this.state.dimensions };
    let toBeClean = []

    for (var position of dimensions.positions.data) {
      // For each position, bring which dimensions they are being disabled by (if there is any)
      if (position.isDisabled)
        for (var d of position.isDisabled)
          if (!toBeClean.includes(d))
            toBeClean.push(d)
    }

    for (var dimensionId of toBeClean)
      this.onSelectionChange(dimensionId, [])
  }

  handleLinks(callers, dimensions, selection, tDimension) {
    if (callers.includes(tDimension)) {
      // Prevent infinite loops
      return dimensions
    }

    // console.log(`callers: ${callers} || tDimension: ${tDimension}`)
    // console.log(selection)

    let firstCaller = callers[0]
    let linkedIds = []

    let tSelection = []
    let tDimensionData = dimensions[tDimension].data

    if (selection.length > 0)
      for (var obj of selection)
        for (var value of obj.links[tDimension])
          if (!linkedIds.includes(value))
            linkedIds.push(value)

    for (var obj of tDimensionData) {
      // It prepares Target Selection to be used by next loop...
      if (selection.length == 0 || linkedIds.includes(obj.value)) {
        // Object will be selected...
        tSelection.push(obj)

        if (obj.isDisabled) {
          // Object is disabled... 
          if (obj.isDisabled.includes(firstCaller)) {
            // Disabled by the firstCaller. So we can enable it.
            obj.isDisabled.splice(obj.isDisabled.indexOf(firstCaller), 1)
          }
        }
      }
      else {
        // Object will be disabled...
        if (obj.isDisabled) {
          // Object is already disabled by another dimension...
          if (!obj.isDisabled.includes(firstCaller))
            obj.isDisabled.push(firstCaller)
        }
        else {
          // Object is going to be disabled by the first time...
          obj.isDisabled = [firstCaller]
        }
      }

      if (obj.isDisabled && obj.isDisabled.length == 0) {
        // There is no constraints for this object... Turn it available
        obj.isDisabled = false
      }
    }

    callers.push(tDimension)

    switch (tDimension) {
      case "pAssets":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positions")
        break;
      case "mAssets":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "sectors")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "pAssets")
        break;
      case "openDates":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positions")
        break;
      case "closeDates":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positions")
        break;
      case "positions":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "pAssets")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "mAssets")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "openDates")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "closeDates")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "types")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "statuses")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "wallets")
        break;
      case "sectors":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "mAssets")
        break;
      case "types":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positions")
        break;
      case "statuses":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positions")
        break;
      case "wallets":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "positions")
        break;
    }

    return dimensions
  }
  async onSelectionChange(callerDimension, selection) {
    let { dimensions } = this.state

    dimensions[callerDimension].selected = selection
    selection = selection || []

    switch (callerDimension) {
      case "pAssets":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "positions")
        break;
      case "openDates":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "positions")
        break;
      case "closeDates":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "positions")
        break;
      case "sectors":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "mAssets")
        break;
      case "types":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "positions")
        break;
      case "statuses":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "positions")
        break;
      case "wallets":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "positions")
        break;
      default:
        break;
    }

    // Recalculate Measures and Charts
    this.prepareMeasuresAndCharts(dimensions)
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
          runItIfSuccess={this.prepareRequirements}
        />
        <ModalOpenPosition
          {...this.props}
          modalId="openPosition"
          isOpen={modal_openPosition_isOpen}
          walletOptions={walletOptions}
          currency={currency}
          toggleModal={this.toggleModal}
          runItIfSuccess={this.prepareRequirements}
        />
        {/* Filters */}
        <FilterCard
          getString={getString}
          prefs={this.props.prefs}
          dimensions={dimensions}
          clearSelection={this.clearSelection}
        >
          <Col key={`filter__openDates`} xs="12" md="6" xl={window.innerWidth > 1600 ? "4" : "6"}>
            <DimentionTimeInterval
              getString={this.props.getString}
              prefs={this.props.prefs}
              dimension={dimensions.openDates}
              onSelectionChange={this.onSelectionChange}

              dateFromTxtId="label_open_dateFrom"
              dateToTxtId="label_open_dateTo"
              alertInvalidFormatTxtId="alert_timeInterval_invalidFormat"
              alertNoEntriesTxtId="alert_timeInterval_noPositionsOpened"
            />
          </Col>
          <Col key={`filter__closeDates`} xs="12" md="6" xl={window.innerWidth > 1600 ? "4" : "6"}>
            <DimentionTimeInterval
              getString={this.props.getString}
              prefs={this.props.prefs}
              dimension={dimensions.closeDates}
              onSelectionChange={this.onSelectionChange}

              dateFromTxtId="label_close_dateFrom"
              dateToTxtId="label_close_dateTo"
              alertInvalidFormatTxtId="alert_timeInterval_invalidFormat"
              alertNoEntriesTxtId="alert_timeInterval_noPositionsClosed"
            />
          </Col>
          <Col key={`filter__wallets`} xs="6" md="3" xl={window.innerWidth > 1600 ? "2" : "3"}>
            <DimensionSelect
              getString={this.props.getString}
              prefs={this.props.prefs}
              titleTxtId="label_wallet"
              onSelectionChange={this.onSelectionChange}
              dimension={dimensions.wallets}
            />
          </Col>
          <Col key={`filter__assets`} xs="6" md="3" xl={window.innerWidth > 1600 ? "2" : "3"}>
            <DimensionSelect
              getString={this.props.getString}
              prefs={this.props.prefs}
              titleTxtId="label_asset"
              onSelectionChange={this.onSelectionChange}
              dimension={dimensions.pAssets}
            />
          </Col>
          <Col key={`filter__sectors`} xs="6" md="3" xl={window.innerWidth > 1600 ? "2" : "3"}>
            <DimensionSelect
              getString={this.props.getString}
              prefs={this.props.prefs}
              titleTxtId="label_sector"
              onSelectionChange={this.onSelectionChange}
              dimension={dimensions.sectors}
            />
          </Col>
          <Col key={`filter__statuses`} xs="6" md="3" xl={window.innerWidth > 1600 ? "2" : "3"}>
            <DimensionSelect
              getString={this.props.getString}
              prefs={this.props.prefs}
              titleTxtId="label_status"
              onSelectionChange={this.onSelectionChange}
              dimension={dimensions.statuses}
            />
          </Col>
          <Col key={`filter__types`} xs="6" md="3" xl={window.innerWidth > 1600 ? "2" : "3"}>
            <DimensionSelect
              getString={this.props.getString}
              prefs={this.props.prefs}
              titleTxtId="label_type"
              onSelectionChange={this.onSelectionChange}
              dimension={dimensions.types}
            />
          </Col>
        </FilterCard>
        {/* Measures */}
        <Row className="justify-content-center">
          <Col xl="3" lg="4" md="6" sm="6">
            <OpenVolume
              getString={getString}
              prefs={prefs}
              managers={managers}
              pageFirstLoading={measureFirstLoading}
              measure={measures.positions.openVolume}
              currency={currency}
            />
          </Col>
          <Col xl="3" lg="4" md="6" sm="6">
            <CloseVolume
              getString={getString}
              prefs={prefs}
              managers={managers}
              pageFirstLoading={measureFirstLoading}
              measure={measures.positions.closeVolume}
              currency={currency}
            />
          </Col>
          <Col xl="3" lg="4" md="6" sm="6">
            <OpCost
              getString={getString}
              prefs={prefs}
              managers={managers}
              pageFirstLoading={measureFirstLoading}
              measure={measures.positions.opCost}
              currency={currency}
            />
          </Col>
          <Col xl="3" lg="4" md="6" sm="6">
            <Profitability
              getString={getString}
              prefs={prefs}
              managers={managers}
              pageFirstLoading={measureFirstLoading}
              measure={measures.positions.result}
              currency={currency}
            />
          </Col>
          <Col xl="3" lg="4" md="6" sm="6">
            <AmountPositions
              getString={getString}
              prefs={prefs}
              managers={managers}
              pageFirstLoading={measureFirstLoading}
              measure={measures.positions.count}
              currency={currency}
            />
          </Col>
          <Col xl="3" lg="4" md="6" sm="6">
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
        {/* Charts */}
        <Row>
          {/* Profitability Over Time */}
          <Col xl="6">
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
          <Col xl="6">
            <ProfitabilityRanking
              getString={getString}
              prefs={prefs}
              pageFirstLoading={chartFirstLoading}
              chart={charts.positions.resultRanking}
              currency={currency}
            />
          </Col>
        </Row>
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