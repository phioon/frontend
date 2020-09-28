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

import TimeManager from "../../core/managers/TimeManager";
import { getDistinctValuesFromList, retrieveObjFromObjList } from "../../core/utils";
import SetupCard from "./SetupCard";
import FixedFilter from "../../components/FixedPlugin/filters/Suggestions";

class Suggestions extends React.Component {
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
        assets: { data: [], items: [], selected: [], disabled: {} },
        setups: { data: [], items: [], selected: [], disabled: {} },
        dates: { data: [], items: [], selected: [], disabled: {} },
        statuses: { data: [], items: [], selected: [], disabled: {} },
        stockExchanges: { data: [], items: [], selected: [], disabled: {} },
      }
    }

    this.onSelectionChange = this.onSelectionChange.bind(this)
    this.loadDimensions = this.loadDimensionsAndCards.bind(this)
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

    this.loadDimensionsAndCards()
  }

  async loadDimensionsAndCards() {
    let dimensions = await this.prepareDimensions()
    dimensions.setups = await this.prepareCards(dimensions.setups)

    // console.log(dimensions)

    this.setState({ dimensions, pageFirstLoading: false })
  }
  async prepareDimensions() {
    let { dimensions } = this.state

    let wallets = await this.props.managers.app.walletList()
    let stockExchanges = getDistinctValuesFromList(wallets.data, "se_short")

    for (var se of stockExchanges) {
      // Assets
      let assets = await this.props.managers.market.assetAsDimension(se)
      dimensions.assets.id = assets.id
      if (!assets.error) {
        dimensions.assets.data = dimensions.assets.data.concat(assets.data)
        dimensions.assets.items = dimensions.assets.items.concat(assets.items)
      }

      // Setups
      let setups = await this.props.managers.market.dSetupAsDimension(se)
      dimensions.setups.id = setups.id
      if (!setups.error) {
        dimensions.setups.data = dimensions.setups.data.concat(setups.data)
        dimensions.setups.items = dimensions.setups.items.concat(setups.items)
      }

      // Setup Dates
      let dates = await this.props.managers.market.dateAsDimension(se)
      dimensions.dates.id = dates.id
      if (!dates.error) {
        dimensions.dates.data = dimensions.dates.data.concat(dates.data)
        dimensions.dates.items = dimensions.dates.items.concat(dates.items)
      }

      // Setup Statuses
      let statuses = await this.props.managers.market.statusAsDimension(se)
      dimensions.statuses.id = statuses.id
      if (!statuses.error) {
        dimensions.statuses.data = dimensions.statuses.data.concat(statuses.data)
        dimensions.statuses.items = dimensions.statuses.items.concat(statuses.items)
      }

      // Stock Exchanges
      let stockExchanges = await this.props.managers.market.stockExchangeAsDimension(se)
      dimensions.stockExchanges.id = stockExchanges.id
      if (!stockExchanges.error) {
        dimensions.stockExchanges.data = dimensions.stockExchanges.data.concat(stockExchanges.data)
        dimensions.stockExchanges.items = dimensions.stockExchanges.items.concat(stockExchanges.items)
      }
    }

    // Translation
    dimensions.statuses.items = this.translateItems(dimensions.statuses.items)

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
        let high = assets[obj.asset_symbol].data.asset_high
        let low = assets[obj.asset_symbol].data.asset_low
        let lastTradeDate = TimeManager.getLocaleDateString(assets[obj.asset_symbol].data.asset_lastTradeTime, false)
        if (high && high >= obj.target) {
          obj.is_success = true
          obj.ended_on = lastTradeDate
        }
        else if (low && low <= obj.stop_loss) {
          obj.is_success = false
          obj.ended_on = lastTradeDate
        }
      }

      obj.delta = {
        stopLoss_maxPrice: tc.type == "purchase" ? obj.max_price - obj.stop_loss : obj.stop_loss - obj.max_price,
        stopLoss_target: tc.type == "purchase" ? obj.target - obj.stop_loss : obj.stop_loss - obj.target,
        stopLoss_assetPrice: tc.type == "purchase" ? obj.price - obj.stop_loss : obj.stop_loss - obj.price,
      }

      obj.occurrencies = ss.occurrencies
      obj.avg_duration_gain = ss.avg_duration_gain
      obj.last_ended_occurrence = ss.last_ended_occurrence
      obj.last_was_success = ss.last_was_success
      obj.success_rate = ss.success_rate
    }

    return dSetups
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
      dimensions = this.handleLinks([tDimension], dimensions, tSelection, "setups")

    callers.push(tDimension)
    switch (tDimension) {
      case "assets":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "setups")
        break;
      case "setups":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "assets")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "dates")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "statuses")
        dimensions = this.handleLinks(callers, dimensions, tSelection, "stockExchanges")
        break;
      case "setupDates":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "setups")
        break;
      case "setupStatuses":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "setups")
        break;
      case "stockExchanges":
        dimensions = this.handleLinks(callers, dimensions, tSelection, "setups")
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
        dimensions = this.handleLinks([callerDimension], dimensions, selection, "setups")
        break;
      case "setups":
        dimensions = this.handleLinks([], dimensions, selection, "assets")
        break;
      case "dates":
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

  translateItems(items) {
    let { getString } = this.props
    let { langId, compId } = this.state

    for (var x = 0; x < items.length; x++)
      items[x] = getString(langId, compId, ["item_" + items[x]])

    return items
  }

  TimelineItems(dSetups) {
    // SETUPS
    let setupsData = dSetups.data
    let setupsDisabled = [].concat.apply([], Object.values(dSetups.disabled))
    let tSelection = []
    for (var x = 0; x < setupsData.length; x++)
      if (!setupsDisabled.includes(x))
        tSelection.push(setupsData[x])

    if (tSelection.length == 0)
      return null

    return tSelection.map((setup) => {
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
      modal_filters_isOpen,

    } = this.state;

    return (
      <>
        <div className="content">
          <div className="header text-center">
            <h3 className="title">{getString(langId, compId, "title")}</h3>
          </div>

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
        <FixedFilter
          {...this.props}
          id={"filters"}
          modalId="filters"
          position="top"
          icon="fa fa-filter fa-2x"
          isOpen={modal_filters_isOpen}
          toggleModal={this.toggleModal}
          onSelectionChange={this.onSelectionChange}
          dimensions={dimensions}
        />
      </>
    );
  }
}

export default Suggestions;

Suggestions.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,
  setNavbarTitleId: PropTypes.func.isRequired
}