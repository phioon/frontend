import React from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
// reactstrap components
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CardFooter,
  Row,
  Col
} from "reactstrap";
import Skeleton from "react-loading-skeleton";

// Filters
import FilterCard from "../../components/cards/filters/FilterCard";
import DimensionSelect from "../../components/cards/filters/selects/DimensionSelect";
import DimentionTimeInterval from "../../components/cards/filters/selects/DimensionTimeInterval";

import TimeManager from "../../core/managers/TimeManager";
import PhiOperationCard from "./PhiOperationCard";
import { getDistinctValuesFromList, queryObjList } from "../../core/utils";

class PhiTrader extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {

      modal_filters_isOpen: false,

      pageFirstLoading: true,

      redirectToUpgrade: false,

      cWallets: 0,
      dimensions: {
        mAssets: { data: [], items: [], selected: [] },
        setups: { data: [], items: [], selected: [] },
        openDates: { data: [], items: [], selected: [] },
        statuses: { data: [], items: [], selected: [] },
        stockExchanges: { data: [], items: [], selected: [] },
      }
    }

    this.onSelectionChange = this.onSelectionChange.bind(this)
  }
  componentDidMount() {
    this.props.setNavbarTitleId("title_" + this.compId)

    this.prepareRequirements()
  }
  async prepareRequirements() {
    // Check User's subscription

    let dimensions = await this.prepareDimensions()
    dimensions.setups = await this.prepareOperations(dimensions.setups)

    // Customization
    dimensions.statuses.data = this.translateObjField(dimensions.statuses.id, dimensions.statuses.data, "label")

    this.setState({ dimensions, pageFirstLoading: false })
  }

  async prepareDimensions() {
    let dimensions = { ...this.state.dimensions }
    let rawData = []

    let wallets = await this.props.managers.app.walletList()
    let stockExchanges = getDistinctValuesFromList(wallets.data, "se_short")

    for (var se of stockExchanges)
      for (var dimension of Object.keys(dimensions)) {
        switch (dimension) {
          case "mAssets":
            rawData.push(this.props.managers.market.setupAssetAsSelectDimension(se))
            break;
          case "setups":
            rawData.push(this.props.managers.market.setupAsSelectDimension(se))
            break;
          case "openDates":
            rawData.push(this.props.managers.market.setupOpenDateAsSelectDimension(se))
            break;
          case "statuses":
            rawData.push(this.props.managers.market.setupStatusAsSelectDimension(se))
            break;
          case "stockExchanges":
            rawData.push(this.props.managers.market.setupStockExchangeAsSelectDimension(se))
            break;
        }
      }
    rawData = await Promise.all(rawData)

    for (var dimension of Object.values(rawData)) {
      if (dimensions[dimension.id].id) {
        // Dimension has been already created for another Stock Exchange...
        dimensions[dimension.id].data = dimensions[dimension.id].data.concat(dimension.data)
      }
      else {
        // Dimension will be created for the first time...
        dimensions[dimension.id] = dimension
      }
    }

    return dimensions
  }

  async prepareOperations(dSetups) {
    let wallets = await this.props.managers.app.walletList()
    let stockExchanges = getDistinctValuesFromList(wallets.data, "se_short")

    this.setState({ cWallets: wallets.data.length })

    let statsList = []

    for (var se of stockExchanges) {
      let statsResult = await this.props.managers.market.dSetupStatsList(se)

      if (!statsResult.data)
        statsResult.data = []

      statsList = statsList.concat(statsResult.data)
    }

    let assets = getDistinctValuesFromList(dSetups.data, "asset_symbol")
    assets = await this.props.managers.market.assetList(false, assets)

    for (var obj of dSetups.data) {
      let se = await this.props.managers.market.stockExchangeRetrieve(assets[obj.asset_symbol].data.stock_exchange)
      let tc = await this.props.managers.market.technicalConditionRetrieve(obj.tc_id)
      let currency = await this.props.managers.app.currencyRetrieve(se.currency_code)

      let high = assets[obj.asset_symbol].data.high
      let low = assets[obj.asset_symbol].data.low
      let lastTradeDate = TimeManager.getDatetimeString(assets[obj.asset_symbol].data.last_trade_time, false)

      // 1. Basic data
      obj.radar_on = TimeManager.getLocaleDateString(obj.radar_on, false)
      obj.started_on = TimeManager.getLocaleDateString(obj.started_on, false)
      obj.asset_label = assets[obj.asset_symbol].data.asset_label
      obj.asset_name = assets[obj.asset_symbol].data.asset_name
      obj.asset_price = assets[obj.asset_symbol].data.price
      obj.type = tc.type
      obj.currency = currency

      // 2. Latest Historical Fields
      obj.last_entry_price = this.getLastObjValue(obj.entry_price, -1)
      obj.last_stop_loss = this.getLastObjValue(obj.stop_loss, -1)
      obj.last_target = this.getLastObjValue(obj.target, -1)
      obj.last_loss_percent = this.getLastObjValue(obj.loss_percent, -1)
      obj.last_gain_percent = this.getLastObjValue(obj.gain_percent, -1)
      obj.last_risk_reward = this.getLastObjValue(obj.risk_reward, -1)

      // 3. Update setup with latest data available (realtime)
      switch (obj.status) {
        case "waiting":
          if (obj.type === "long") {
            if (low && low <= obj.last_stop_loss) {
              obj.status = "canceled"
              obj.ended_on = lastTradeDate
            }
            else if (high && high >= obj.last_entry_price) {
              obj.status = "in_progress"
              obj.started_on = lastTradeDate
            }
          }
          else
            if (high && high >= obj.last_stop_loss) {
              obj.status = "canceled"
              obj.ended_on = lastTradeDate
            }
            else if (low && low <= obj.last_entry_price) {
              obj.status = "in_progress"
              obj.started_on = lastTradeDate
            }
          break;

        case "in_progress":
          if (obj.type === "long") {
            if (high && high >= obj.last_target) {
              obj.status = "gain"
              obj.ended_on = lastTradeDate
            }
            else if (low && low <= obj.last_stop_loss) {
              obj.status = "loss"
              obj.ended_on = lastTradeDate
            }
          }
          else {
            if (low && low <= obj.last_target) {
              obj.status = "gain"
              obj.ended_on = lastTradeDate
            }
            else if (high && high >= obj.last_stop_loss) {
              obj.status = "loss"
              obj.ended_on = lastTradeDate
            }
          }
          break;
      }

      if (obj.ended_on)
        obj.ended_on = TimeManager.getLocaleDateString(obj.ended_on, false)

      // 4. Deltas
      obj.delta = {
        stopLoss_entryPrice: tc.type === "long" ?
          obj.last_entry_price - obj.last_stop_loss :
          obj.last_stop_loss - obj.last_entry_price,

        stopLoss_target: tc.type === "long" ?
          obj.last_target - obj.last_stop_loss :
          obj.last_stop_loss - obj.last_target,

        stopLoss_assetPrice: tc.type === "long" ?
          obj.asset_price - obj.last_stop_loss :
          obj.last_stop_loss - obj.asset_price,
      }

      // 5. Technical Condition Stats
      let filters = {
        asset_symbol: obj.asset_symbol,
        tc_id: obj.tc_id
      }
      let tcStats = queryObjList(statsList, filters)[0]

      obj.occurrencies = tcStats.occurrencies
      obj.avg_duration_gain = tcStats.avg_duration_gain
      obj.last_ended_occurrence = tcStats.last_ended_occurrence
      obj.last_was_success = tcStats.last_was_success
      obj.success_rate = tcStats.success_rate
    }

    return dSetups
  }
  translateObjField(dimensionId, objList, field) {
    let { prefs, getString } = this.props

    switch (dimensionId) {
      case "statuses":
        for (var obj of objList)
          obj[field] = getString(prefs.locale, this.compId, [`item_${obj[field]}`])
        break;
    }

    return objList
  }
  getLastObjValue(kpiObj, index = -1) {
    let value = undefined

    if (typeof kpiObj === "object")
      value = kpiObj.slice(index)[0].value
    return value
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
      case "mAssets":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "setups")
        break;
      case "setups":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "mAssets")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "openDates")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "statuses")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "stockExchanges")
        break;
      case "openDates":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "setups")
        break;
      case "statuses":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "setups")
        break;
      case "stockExchanges":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "setups")
        break;
    }

    return dimensions
  }
  async onSelectionChange(callerDimension, selection) {
    let { dimensions } = this.state

    dimensions[callerDimension].selected = selection
    selection = selection || []

    switch (callerDimension) {
      case "mAssets":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "setups")
        break;
      case "setups":
        dimensions = this.handleLinks([], dimensions, selection, "mAssets")
        break;
      case "openDates":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "setups")
        break;
      case "statuses":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "setups")
        break;
      case "stockExchanges":
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "setups")
        break;
      default:
        break;
    }

    this.setState({ dimensions })
  }

  phiOperations(dSetups) {
    // SETUPS
    let selection = []

    for (var obj of dSetups.data)
      if (!obj.isDisabled)
        selection.push(obj)

    if (selection.length == 0)
      return null

    return selection.map((setup) => {
      return (
        <PhiOperationCard
          {...this.props}
          key={setup.id}
          operation={setup}
        />
      )
    });
  }

  render() {
    let { prefs, getString } = this.props;
    let {
      cWallets,
      dimensions,

      pageFirstLoading,

    } = this.state;

    return (
      <div className="content">
        <div className="header text-center">
          <h3 className="title">{getString(prefs.locale, this.compId, "title")}</h3>
          <Card className="card-plain centered">
            <label>{getString(prefs.locale, this.compId, "label_intro_p1")}</label>
            <label>{getString(prefs.locale, this.compId, "label_intro_p2")}</label>
            <label>
              {getString(prefs.locale, this.compId, "label_intro_p3")}
              {" "}
              <strong>{getString(prefs.locale, this.compId, "label_intro_notRecommendation")}</strong>,
                {" "}
              {getString(prefs.locale, this.compId, "label_intro_p4")}
            </label>
          </Card>
        </div>

        {/* Filters */}
        <FilterCard
          getString={getString}
          prefs={this.props.prefs}
          dimensions={dimensions}
          clearSelection={this.clearSelection}
          pageFirstLoading={pageFirstLoading}
          delayTriggerDimension={"setups"}
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
          <Col key={`filter__statuses`} xs="6" md="3" xl={window.innerWidth > 1600 ? "2" : "3"}>
            <DimensionSelect
              getString={this.props.getString}
              prefs={this.props.prefs}
              titleTxtId="label_status"
              onSelectionChange={this.onSelectionChange}
              dimension={dimensions.statuses}
            />
          </Col>
          <Col key={`filter__assets`} xs="6" md="3" xl={window.innerWidth > 1600 ? "2" : "3"}>
            <DimensionSelect
              getString={this.props.getString}
              prefs={this.props.prefs}
              titleTxtId="label_asset"
              onSelectionChange={this.onSelectionChange}
              dimension={dimensions.mAssets}
            />
          </Col>
          <Col key={`filter__stockExchanges`} xs="6" md="3" xl={window.innerWidth > 1600 ? "2" : "3"}>
            <DimensionSelect
              getString={this.props.getString}
              prefs={this.props.prefs}
              titleTxtId="label_stockExchange"
              onSelectionChange={this.onSelectionChange}
              dimension={dimensions.stockExchanges}
            />
          </Col>
        </FilterCard>

        {pageFirstLoading ?
          <>
            <Card className="card-plain">
              <Skeleton height={202} />
            </Card>
            <Card className="card-plain">
              <Skeleton height={202} />
            </Card>
          </> :
          cWallets == 0 ?
            // No wallets
            <Card className="card-stats">
              <Row>
                <Col xl="2" lg="2" md="3" xs="3" className="centered">
                  <div className="icon-big text-center">
                    <i className="nc-icon nc-alert-circle-i text-warning" />
                  </div>
                </Col>
                <Col xl="10" lg="10" md="9" xs="9">
                  <br />
                  <p className="card-description">{getString(prefs.locale, this.compId, "label_noWallets_p1")}</p>
                  <p className="card-description">{getString(prefs.locale, this.compId, "label_noWallets_p2")}</p>
                </Col>
              </Row>
              <CardFooter className="centered">
                <Button
                  className="btn-simple btn-round"
                  color="success"
                  data-dismiss="modal"
                  type="submit"
                  onClick={() => this.setState({ goToWallets: true })}
                >
                  {getString(prefs.locale, this.compId, "btn_goToWallets")}
                </Button>
                {this.state.goToWallets && <Redirect to="/app/myassets/wallets/" />}
              </CardFooter>
            </Card>
            :
            dimensions.setups.data.length == 0 ?
              // Empty Setups
              <Card className="card-stats">
                <CardBody>
                  <Row>
                    <Col xl="2" lg="2" md="3" xs="4" className="centered">
                      <div className="icon-big text-center">
                        <i className="nc-icon nc-zoom-split text-warning" />
                      </div>
                    </Col>
                    <Col xl="10" lg="10" md="9" xs="8">
                      <br />
                      <p className="card-description">{getString(prefs.locale, this.compId, "label_noNews_p1")}</p>
                      <p className="card-description">{getString(prefs.locale, this.compId, "label_noNews_p2")}</p>
                    </Col>
                  </Row>
                </CardBody>
              </Card> :
              <>
                <CardTitle tag="h3" className="description">
                  {getString(prefs.locale, this.compId, "section_operations")}
                </CardTitle>
                {this.phiOperations(dimensions.setups)}
              </>
        }
      </div>
    );
  }
}

export default PhiTrader;

PhiTrader.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}