import React from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
// reactstrap components
import {
  Button,
  Card,
  CardBody,
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
import SetupCard from "./SetupCard";
import { getDistinctValuesFromList, retrieveObjFromObjList } from "../../core/utils";

class PhiTrader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,

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
    this.toggleModal = this.toggleModal.bind(this);
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
    // Check User's subscription

    let dimensions = await this.prepareDimensions()
    dimensions.setups = await this.prepareCards(dimensions.setups)

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
            rawData.push(this.props.managers.market.assetAsSelectDimension(se))
            break;
          case "setups":
            rawData.push(this.props.managers.market.setupAsSelectDimension(se))
            break;
          case "openDates":
            rawData.push(this.props.managers.market.openDateAsSelectDimension(se))
            break;
          case "statuses":
            rawData.push(this.props.managers.market.statusAsSelectDimension(se))
            break;
          case "stockExchanges":
            rawData.push(this.props.managers.market.stockExchangeAsSelectDimension(se))
            break;
        }
      }
    rawData = await Promise.all(rawData)

    for (var dimension of Object.values(rawData)) {
      switch (dimension.id) {
        case "statuses":
          if (!dimension.error) {
            dimension.data = this.translateObjField(dimension.id, dimension.data, "label")
          }

        // No breaks... It will continue to default...
        // !!! ATENTION !!! If another case is added bellow this point, we need to copy default's content into this case statement.
        default:
          if (dimensions[dimension.id].id) {
            // Dimension has been already created for another Stock Exchange...
            dimensions[dimension.id].data = dimensions[dimension.id].data.concat(dimension.data)
          }
          else {
            // Dimension will be created for the first time...
            dimensions[dimension.id] = dimension
          }
          break;
      }
    }

    return dimensions
  }

  async prepareCards(dSetups) {
    let wallets = await this.props.managers.app.walletList()
    let stockExchanges = getDistinctValuesFromList(wallets.data, "se_short")

    this.setState({ cWallets: wallets.data.length })

    let summaries = []

    for (var se of stockExchanges) {
      let summaryResult = await this.props.managers.market.dSetupSummaryList(se)

      if (!summaryResult.data)
        summaryResult.data = []

      summaries = summaries.concat(summaryResult.data)
    }

    let assets = getDistinctValuesFromList(dSetups.data, "asset_symbol")
    assets = await this.props.managers.market.assetList(false, assets)

    for (var obj of dSetups.data) {
      let tc = await this.props.managers.market.technicalConditionRetrieve(obj.tc_id)
      let se = await this.props.managers.market.stockExchangeRetrieve(assets[obj.asset_symbol].data.stockExchange)
      let currency = await this.props.managers.app.currencyRetrieve(se.currency_code)
      let ss = retrieveObjFromObjList(summaries, "asset_setup", obj.asset_setup)

      obj.started_on = obj.started_on
      obj.asset_label = assets[obj.asset_symbol].data.asset_label
      obj.asset_name = assets[obj.asset_symbol].data.asset_name
      obj.price = assets[obj.asset_symbol].data.price
      obj.type = tc.type
      obj.currency = currency
      obj.tc_id = tc.id

      if (obj.ended_on)
        obj.ended_on = TimeManager.getLocaleDateString(obj.ended_on)
      else {
        let high = assets[obj.asset_symbol].data.high
        let low = assets[obj.asset_symbol].data.low
        let lastTradeDate = TimeManager.getLocaleDateString(assets[obj.asset_symbol].data.asset_lastTradeTime, false)

        if (obj.type === "purchase") {
          if (high && high >= obj.target) {
            obj.is_success = true
            obj.ended_on = lastTradeDate
          }
          else if (low && low <= obj.stop_loss) {
            obj.is_success = false
            obj.ended_on = lastTradeDate
          }
        }
        else if (obj.type === "sale") {
          if (low && low <= obj.target) {
            obj.is_success = true
            obj.ended_on = lastTradeDate
          }
          else if (high && high >= obj.stop_loss) {
            obj.is_success = false
            obj.ended_on = lastTradeDate
          }
        }
      }

      obj.delta = {
        stopLoss_maxPrice: tc.type === "purchase" ? obj.max_price - obj.stop_loss : obj.stop_loss - obj.max_price,
        stopLoss_target: tc.type === "purchase" ? obj.target - obj.stop_loss : obj.stop_loss - obj.target,
        stopLoss_assetPrice: tc.type === "purchase" ? obj.price - obj.stop_loss : obj.stop_loss - obj.price,
      }

      obj.occurrencies = ss.occurrencies
      obj.avg_duration_gain = ss.avg_duration_gain
      obj.last_ended_occurrence = ss.last_ended_occurrence
      obj.last_was_success = ss.last_was_success
      obj.success_rate = ss.success_rate
    }

    return dSetups
  }
  translateObjField(dimensionId, objList, field) {
    let { getString } = this.props
    let { langId, compId } = this.state

    switch (dimensionId) {
      case "statuses":
        for (var obj of objList)
          obj[field] = getString(langId, compId, [`item_${obj[field]}`])
        break;
    }

    return objList
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

  TimelineItems(dSetups) {
    // SETUPS
    let selection = []

    for (var obj of dSetups.data)
      if (!obj.isDisabled)
        selection.push(obj)

    if (selection.length == 0)
      return null

    return selection.map((setup) => {
      return (
        <SetupCard
          {...this.props}
          key={setup.id}
          setup={setup}
          isPurchase={setup.type == "purchase" ? true : false}
        />
      )
    });
  }

  toggleModal(modalId) {
    this.setState({ ["modal_" + modalId + "_isOpen"]: !this.state["modal_" + modalId + "_isOpen"] });
  };

  render() {
    let { getString } = this.props;
    let {
      langId,
      compId,

      cWallets,
      dimensions,

      pageFirstLoading,

    } = this.state;

    return (
      <div className="content">
        <div className="header text-center">
          <h3 className="title">{getString(langId, compId, "title")}</h3>
          <Card className="card-plain centered">
            <label>{getString(langId, compId, "label_intro_p1")}</label>
            <label>{getString(langId, compId, "label_intro_p2")}</label>
            <label>
              {getString(langId, compId, "label_intro_p3")}
              {" "}
              <strong>{getString(langId, compId, "label_intro_notRecommendation")}</strong>,
                {" "}
              {getString(langId, compId, "label_intro_p4")}
            </label>
          </Card>
        </div>

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
          <Col key={`filter__assets`} xs="6" md="3" xl={window.innerWidth > 1600 ? "2" : "3"}>
            <DimensionSelect
              getString={this.props.getString}
              prefs={this.props.prefs}
              titleTxtId="label_asset"
              onSelectionChange={this.onSelectionChange}
              dimension={dimensions.mAssets}
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
          <Card className="card-timeline card-plain">
            <CardBody>
              <ul className="timeline">
                <li className="">
                  <div className="timeline-panel">
                    <Skeleton height={420} />
                  </div>
                </li>
                <li className="timeline-inverted">
                  <div className="timeline-panel">
                    <Skeleton height={420} />
                  </div>
                </li>
              </ul>
            </CardBody>
          </Card> :
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
                  <p className="card-description">{getString(langId, compId, "label_noWallets_p1")}</p>
                  <p className="card-description">{getString(langId, compId, "label_noWallets_p2")}</p>
                </Col>
              </Row>
              <CardFooter className="centered">
                <Button
                  className="btn-round"
                  color="success"
                  data-dismiss="modal"
                  type="submit"
                  onClick={() => this.setState({ goToWallets: true })}
                >
                  {getString(langId, compId, "btn_goToWallets")}
                </Button>
                {this.state.goToWallets && <Redirect to="/app/myassets/wallets" />}
              </CardFooter>
            </Card>
            :
            dimensions.setups.data.length == 0 ?
              // Empty Setups
              <Card className="card-stats">
                <Row>
                  <Col xl="2" lg="2" md="3" xs="4" className="centered">
                    <div className="icon-big text-center">
                      <i className="nc-icon nc-zoom-split text-warning" />
                    </div>
                  </Col>
                  <Col xl="10" lg="10" md="9" xs="8">
                    <br />
                    <p className="card-description">{getString(langId, compId, "label_noNews_p1")}</p>
                    <p className="card-description">{getString(langId, compId, "label_noNews_p2")}</p>
                  </Col>
                </Row>
              </Card> :
              // Setups
              <Card className="card-timeline card-plain">
                <CardBody>
                  <ul className="timeline">
                    {this.TimelineItems(dimensions.setups)}
                  </ul>
                </CardBody>
              </Card>
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