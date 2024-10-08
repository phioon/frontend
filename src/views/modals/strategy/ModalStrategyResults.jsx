import React from "react";
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
  Row,
  UncontrolledTooltip,
} from "reactstrap";
// react plugin used to create DropdownMenu for selecting items
import Select from "react-select";
// react component for creating dynamic tables
import ReactTable from "react-table-v6";
import Skeleton from "react-loading-skeleton";
import ModalNewReview from "./ModalNewReview";
import TimeManager from "../../../core/managers/TimeManager";
import { CircularLoader } from "../../../components/Loaders";
import {
  cutLine,
  convertFloatToCurrency,
  getDistinctValuesFromList,
  integerWithThousandsSeparator,
  orderBy,
  retrieveObjFromObjList,
  rtDefaultFilter,
  round,
  sleep
} from "../../../core/utils";

class ModalStrategyResults extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      isFirstLoad: true,
      isReady: false,
      showRunBtn: false,
      modal_strategyReview_isOpen: false,

      iItems: [],
      jsonLogic: {},

      strategy: { rules: {} },
      tableData: [],

      stockExchangeOptions: [],
      intervalOptions: [],

      filters: {
        variables: {
          interval: { value: "d", label: "Test" }
        },
        general: {
          stockExchange: { value: "BVMF", label: "" }
        },
      },
      stockExchange: {},
      currency: { code: "BRL", symbol: "R$", thousands_separator_symbol: ".", decimal_symbol: "," },
    }

    this.toggleModal = this.toggleModal.bind(this);
    this.onClick = this.onClick.bind(this);
  }
  componentDidMount() {
    this.prepareRequirements()
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen && this.props.isOpen)
      this.prepareStrategy()
  }
  async prepareRequirements() {
    let { prefs, getString } = this.props;

    let iItems = await this.props.managers.market.indicatorData()

    let wallets = await this.props.managers.app.walletList()
    let stockExchanges = getDistinctValuesFromList(wallets.data, "se_short")
    let stockExchangeOptions = []
    let intervalOptions = []

    for (var se_short of stockExchanges) {
      let stockExchange = await this.props.managers.market.stockExchangeRetrieve(se_short)
      let option = {
        value: stockExchange.se_short,
        label: stockExchange.name
      }

      stockExchangeOptions.push(option)
    }

    // Default option
    if (stockExchangeOptions.length > 0)
      this.onSelectChange("stockExchange", stockExchangeOptions[0])

    for (var indicator of iItems)
      for (var instance of indicator.instances)
        if (!retrieveObjFromObjList(intervalOptions, "value", instance.interval)) {
          let option = {
            value: instance.interval,
            label: getString(prefs.locale, "indicators", instance.interval)
          }
          intervalOptions.push(option)

          // Default option
          if (option.value == "d")
            this.onSelectChange("interval", option)
        }

    this.setState({ stockExchangeOptions, intervalOptions })
  }
  async prepareStrategy() {
    let { modalId, strategy } = this.props;
    this.setState({ isFirstLoad: true, isReady: false })

    let result = await this.props.managers.app.strategyRetrieve(false, strategy.uuid)

    if (result.data) {
      strategy = result.data

      // Title
      strategy.title = this.getDescTitle(strategy.desc)
      if (strategy.title.length > 0)
        if (strategy.title.substring(strategy.title.length - 3) === "...")
          strategy.readMore = true
    }
    else {
      // Something wrong happened...
      this.props.toggleModal(modalId)
    }

    this.setState({ strategy, isReady: true })
  }
  prepareRules(strategy, filters) {
    let jsonRules = { and: [] }

    for (var [wsId, rules] of Object.entries(strategy.rules)) {

      // Rules from Basic WS has different format if compared with Advanced WS...
      rules = this.props.managers.strategy.standardizeWSRules(wsId, rules)

      for (var [variable, obj] of Object.entries(filters)) {
        // At this point, 'obj' is an object selected from a list: {value: "", label: ""}
        rules = this.props.managers.strategy.replaceVariable(rules, variable, obj.value)
      }
      if (rules.and)
        jsonRules.and = jsonRules.and.concat(rules.and)
    }

    return jsonRules
  }
  async prepareTableData(result) {
    // Prepare data to be shown related on Table Results...
    let assets = getDistinctValuesFromList(result, "asset_symbol")
    assets = await this.props.managers.market.assetData(assets)
    assets = orderBy(assets, ["-last_trade_time", "asset_label"])

    return assets
  }

  onSelectChange(fieldName, value) {
    let newState = { filters: this.state.filters }

    let runStrategy = undefined

    switch (fieldName) {
      case "stockExchange":
        if (newState.filters.general.stockExchange !== value)
          runStrategy = true

        newState.filters.general.stockExchange = value
        break;
      case "interval":
        if (newState.filters.variables.interval !== value)
          runStrategy = true

        newState.filters.variables.interval = value
        break;
    }

    if (!this.state.isFirstLoad && runStrategy && this.props.strategy.uuid) {
      // Selection changed...
      this.runClick(this.props.strategy)
    }

    this.setState(newState)
  }

  onClick(action, obj) {
    switch (action) {
      case "run":
        this.runClick(obj)
        break;
      default:
        this.props.onClick(action, obj)
        break;
    }
  }
  async runClick(strategy) {
    this.setState({ isFirstLoad: false })
    this.props.setFlag("Running", true)
    let { filters } = this.state;

    // Stats...
    this.props.managers.app.strategyRun(strategy)

    let stockExchange = await this.props.managers.market.stockExchangeRetrieve(filters.general.stockExchange.value)
    let currency = await this.props.managers.app.currencyRetrieve(stockExchange.currency_code)

    let jsonRules = this.prepareRules(strategy, filters.variables)
    let data = await this.props.managers.strategy.buildData(stockExchange.se_short, jsonRules)
    let result = this.props.managers.strategy.applyRules(data, jsonRules)

    let tableData = await this.prepareTableData(result)

    this.askForReview(strategy, tableData)

    this.setState({ tableData, stockExchange, currency })
    this.props.setFlag("Running", false)
  }

  async askForReview(strategy, data) {
    let isOwner = this.props.user.username === strategy.owner_username

    if (!isOwner && data.length > 0 && strategy.my_rating == null) {
      // There are results for this Strategy...
      await sleep(17000)

      if (this.props.isOpen) {
        // [this] modal is still open...
        this.toggleModal("strategyReview")
      }
    }
  }

  getDescTitle(desc) {
    let lines = []
    let title = undefined
    let addDots = undefined
    let limitLength = 130
    let blankSpaceLookup = 120

    if (desc) {
      lines = desc.split("\n")
      title = lines[0]

      if (title.length > limitLength) {
        // Title is long enough for 2 lines
        title = cutLine(title, limitLength, blankSpaceLookup)
        addDots = true
      }
      else if (lines.length > 1) {
        if (title.length < limitLength / 2) {
          // Title needs only 1 line. Bring the next line and cut it if needed
          title += `\n`
          title += cutLine(lines[1], round(limitLength / 2, 0), round(blankSpaceLookup / 2, 0))
          addDots = true
        }
        else
          addDots = true
      }

      if (addDots)
        title += `...`
    }
    else {
      // No description
      title = ``
    }

    return title
  }

  // Components
  renderLoading(msgId) {
    let { prefs, getString } = this.props;

    return (
      <>
        <Row className="mt-4" />
        <Row className="mt-3" />
        <Row className="mt-3" />
        <div className="centered">
          <CircularLoader size="md" />
        </div>
        <br />
        <p className="text-center description">
          {getString(prefs.locale, this.compId, `label_${msgId}`)}
        </p>
        <Row className="mt-5" />
        <Row className="mt-5" />
        <Row className="mt-5" />
        <Row className="mt-4" />
        <Row className="mt-3" />
        <Row className="mt-3" />
      </>
    )
  }
  renderRunBtn(strategy, isRunning) {
    return (
      <>
        <Row className="mt-5" />
        <div className="centered">
          <Button
            className="btn-icon btn-round"
            size="lg"
            color="info"
            outline
            type="button"
            disabled={isRunning}
            onClick={() => this.onClick("run", strategy)}
          >
            <i id="strategy_run" className="nc-icon nc-button-play" />
          </Button>
        </div>
        <Row className="mt-5" />
        <Row className="mt-5" />
        <Row className="mt-5" />
        <Row className="mt-5" />
      </>
    )
  }

  toggleModal(modalId) {
    this.setState({ [`modal_${modalId}_isOpen`]: !this.state[`modal_${modalId}_isOpen`] });
  };

  render() {
    let { prefs, getString, modalId, isOpen, isRunning } = this.props;
    let {
      isFirstLoad,
      isReady,
      modal_strategyReview_isOpen,

      strategy,
      tableData,

      stockExchangeOptions,
      intervalOptions,

      filters,

      stockExchange,
      currency
    } = this.state;

    return (
      <Modal isOpen={isOpen} size="xl" toggle={() => this.props.toggleModal(modalId)}>
        <ModalNewReview
          prefs={prefs}
          getString={getString}
          managers={this.props.managers}
          modalId="strategyReview"
          isOpen={modal_strategyReview_isOpen}
          toggleModal={this.toggleModal}
          onClick={this.onClick}
          strategy={strategy}
        />
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
              {isReady ?
                strategy.name :
                <Skeleton width={200} />
              }
            </h5>
            <br />

            <pre>
              {isReady ?
                strategy.title :
                <Skeleton />
              }
              {isReady && strategy.readMore &&
                <a
                  className="description"
                  href={this.props.managers.app.strategyPagePath(strategy.uuid)}
                  onClick={e => {
                    e.preventDefault()
                    this.props.onClick("goToStrategyPage", strategy)
                  }}
                >
                  {" "}{getString(prefs.locale, this.compId, "label_readMore")}
                </a>
              }
            </pre>

            <Row className="mt-3" />
            <div className="description text-right">
              {isReady ?
                <a
                  className="description"
                  href={this.props.managers.app.userProfilePath(strategy.owner_username)}
                  onClick={e => {
                    e.preventDefault()
                    this.props.onClick("goToProfile", strategy)
                  }}
                >
                  -{" "}@{strategy.owner_username}
                </a> :
                <Skeleton width={150} />
              }
            </div>
            <hr />
          </CardHeader>
          <CardBody>
            <Row className="justify-content-center">
              {/* Stock Exchange */}
              <Col xl="3" lg="3" md="4" xs="6">
                <FormGroup>
                  <label>{getString(prefs.locale, this.compId, "input_stockExchange")}
                    {" "}
                    <i id={"input_stockExchange_hint"} className="nc-icon nc-alert-circle-i" />
                  </label>
                  <UncontrolledTooltip placement="top-start" target={"input_stockExchange_hint"}>
                    {getString(prefs.locale, this.compId, "input_stockExchange_hint")}
                  </UncontrolledTooltip>
                  <Select
                    className="react-select"
                    classNamePrefix="react-select"
                    name="stockExchange"
                    placeholder={getString(prefs.locale, "generic", "input_select")}
                    value={filters.general.stockExchange}
                    options={stockExchangeOptions}
                    onChange={value => this.onSelectChange("stockExchange", value)}
                  />
                </FormGroup>
              </Col>
              {/* Time Interval */}
              <Col xl="2" lg="3" md="3" xs="6">
                <FormGroup>
                  <label>{getString(prefs.locale, this.compId, "input_interval")}
                    {" "}
                    <i id={"input_interval_hint"} className="nc-icon nc-alert-circle-i" />
                  </label>
                  <UncontrolledTooltip placement="top-start" target={"input_interval_hint"}>
                    {getString(prefs.locale, this.compId, "input_interval_hint")}
                  </UncontrolledTooltip>
                  <Select
                    className="react-select"
                    classNamePrefix="react-select"
                    name="interval"
                    placeholder={getString(prefs.locale, "generic", "input_select")}
                    value={filters.variables.interval}
                    options={intervalOptions}
                    onChange={value => this.onSelectChange("interval", value)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row className="mt-4" />

            {isFirstLoad ?
              isReady ?
                this.renderRunBtn(strategy, isRunning) :
                this.renderLoading("loading") :
              isRunning ?
                this.renderLoading("running") :
                <ReactTable
                  data={tableData}
                  filterable={tableData.length > 0 ? true : false}
                  defaultFilterMethod={rtDefaultFilter}
                  columns={[
                    {
                      Header: getString(prefs.locale, this.compId, "header_asset"),
                      accessor: "asset_label",
                      width: 100
                    },
                    {
                      Header: getString(prefs.locale, this.compId, "header_name"),
                      accessor: "asset_name"
                    },
                    {
                      className: "text-right",
                      Header: getString(prefs.locale, this.compId, "header_quote"),
                      filterable: false,
                      accessor: "price",
                      Cell: (cell) => { return convertFloatToCurrency(cell.value, currency) },
                      width: 100,
                    },
                    {
                      className: "text-right",
                      Header: getString(prefs.locale, this.compId, "header_volume"),
                      filterable: false,
                      accessor: "avg_volume_10d",
                      Cell: (cell) => { return integerWithThousandsSeparator(cell.value, currency.thousands_separator_symbol) },
                      width: 120
                    },
                    {
                      Header: getString(prefs.locale, this.compId, "header_lastTradeTime"),
                      accessor: "last_trade_time",
                      filterable: false,
                      Cell: (cell) => {
                        let tzDatetime = TimeManager.tzConvert(stockExchange.timezone, cell.value, true)
                        tzDatetime.locale(getString(prefs.locale, "locales", prefs.locale))

                        let relativeTime = tzDatetime.calendar(null, {
                          sameDay: `[${getString(prefs.locale, "momentrelative", "sameDay")}] LT`,
                          nextDay: `[${getString(prefs.locale, "momentrelative", "nextDay")}] LT`,
                          nextWeek: `[${getString(prefs.locale, "momentrelative", "next")}] dddd[,] LT`,
                          lastDay: `[${getString(prefs.locale, "momentrelative", "lastDay")}] LT`,
                          lastWeek: `[${getString(prefs.locale, "momentrelative", "last")}] dddd[,] LT`,
                          sameElse: `L LT`
                        })
                        return relativeTime
                      }
                    }
                  ]}
                  defaultPageSize={10}
                  previousText={getString(prefs.locale, "reacttable", "label_previous")}
                  nextText={getString(prefs.locale, "reacttable", "label_next")}
                  pageText={getString(prefs.locale, "reacttable", "label_page")}
                  ofText={getString(prefs.locale, "reacttable", "label_of")}
                  rowsText={getString(prefs.locale, "reacttable", "label_rows")}
                  noDataText={
                    isRunning ? getString(prefs.locale, "generic", "label_loading") :
                      tableData.length == 0 ?
                        getString(prefs.locale, this.compId, "table_emptyData") :
                        getString(prefs.locale, this.compId, "table_noDataFound")
                  }
                  showPaginationBottom
                  className="-striped -highlight default-pagination"
                />
            }
          </CardBody>
          <CardFooter className="text-center">
            <Button
              className="btn-simple btn-round"
              color="success"
              data-dismiss="modal"
              type="submit"
              onClick={() => this.props.toggleModal(modalId)}
            >
              {getString(prefs.locale, this.compId, "btn_footer")}
            </Button>
          </CardFooter>
        </Card>
      </Modal>
    )
  }
}

export default ModalStrategyResults;

ModalStrategyResults.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,

  strategy: PropTypes.object.isRequired,
  setFlag: PropTypes.func.isRequired,
}