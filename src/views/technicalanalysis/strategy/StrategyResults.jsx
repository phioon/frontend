import React from "react";
import PropTypes from "prop-types";
// reactstrap components
import {
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Col,
  Row,
} from "reactstrap";
// react component for creating dynamic tables
import ReactTable from "react-table";

import TimeManager from "../../../core/managers/TimeManager";
import {
  convertFloatToCurrency,
  getDistinctValuesFromList,
  integerWithThousandsSeparator,
  orderBy
} from "../../../core/utils";

class StrategyResults extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      compId: this.constructor.name.toLowerCase(),
      langId: props.prefs.langId,
      isLoading: false,
      firstLoad: true,

      iItems: [],
      jsonLogic: {},

      tableData: [],

      currency: { code: "BRL", symbol: "R$", thousands_separator_symbol: ".", decimal_symbol: "," },
      alert: null,
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (props.prefs.langId !== state.langId)
      return { langId: props.prefs.langId }
    return null
  }
  componentDidUpdate(prevProps) {
    if (prevProps.strategy !== this.props.strategy)
      this.prepareRequirements()
    else if (prevProps.data !== this.props.data)
      this.prepareRequirements()
  }
  async prepareRequirements() {
    this.setState({ tableData: [], firstLoad: false, isLoading: true })
    let { strategy, filters } = this.props;

    strategy.rules = JSON.parse(strategy.rules)

    console.log(strategy)

    let stockExchange = await this.props.managers.market.stockExchangeRetrieve(filters.general.stockExchange.value)
    let currency = await this.props.managers.app.currencyRetrieve(stockExchange.currency_code)

    let jsonRules = this.prepareRules(strategy, filters.variables)
    let data = await this.props.managers.strategy.buildData(stockExchange.se_short, jsonRules)
    let result = this.props.managers.strategy.applyRules(data, jsonRules)

    let tableData = await this.prepareTableData(result, stockExchange)

    console.log(tableData)

    this.setState({ isLoading: false, tableData, currency })
    this.props.toggleLoading(false)
  }
  prepareRules(strategy, filters) {
    let jsonRules = { and: [] }

    for (var [wsId, rules] of Object.entries(strategy.rules)) {
      for (var [variable, obj] of Object.entries(filters)) {
        // At this point, 'obj' is an object selected from a list: {value: "", label: ""}
        rules = this.props.managers.strategy.replaceVariable(rules, variable, obj.value)
      }
      if (rules.and)
        jsonRules.and = jsonRules.and.concat(rules.and)
    }

    return jsonRules
  }
  async prepareTableData(result, stockExchange) {
    // Extend data related to each asset...
    let assets = getDistinctValuesFromList(result, "asset_symbol")
    assets = await this.props.managers.market.assetData(assets)
    assets = orderBy(assets, ["-last_trade_time", "asset_label"])

    for (var a of assets) {
      let tzDatetime = TimeManager.tzConvert(stockExchange.se_timezone, a.last_trade_time, true)

      a.last_trade_time = TimeManager.getLocaleString(tzDatetime)
    }

    return assets
  }

  render() {
    let { getString, strategy, filters } = this.props;
    let { langId, compId, firstLoad, isLoading, tableData, currency } = this.state;

    return (
      <Card id={compId}>
        <CardHeader>
          <Row>
            <Col>
              <CardTitle tag="h5">{getString(langId, compId, "card_title")}</CardTitle>
            </Col>
            <Col>
              <div className="pull-right">
                <Badge color={"default"} pill>
                  {strategy.name ? strategy.name : getString(langId, compId, "badge_strategy")}
                </Badge>
              </div>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <ReactTable
            data={tableData}
            filterable={tableData.length > 0 ? true : false}
            columns={[
              {
                Header: getString(langId, compId, "header_asset"),
                accessor: "asset_label",
                width: 100
              },
              {
                Header: getString(langId, compId, "header_name"),
                accessor: "asset_name"
              },
              {
                className: "text-right",
                Header: getString(langId, compId, "header_quote"),
                accessor: "price",
                Cell: (cell) => { return convertFloatToCurrency(cell.value, currency) },
                width: 100
              },
              {
                className: "text-right",
                Header: getString(langId, compId, "header_volume"),
                accessor: "avg_volume_10d",
                Cell: (cell) => { return integerWithThousandsSeparator(cell.value, currency.thousands_separator_symbol) },
                width: 120
              },
              {
                Header: getString(langId, compId, "header_lastTradeTime"),
                accessor: "last_trade_time"
              }
            ]}
            defaultPageSize={5}
            noDataText={
              firstLoad ? getString(langId, compId, "table_firstLoad") :
                isLoading ? getString(langId, "generic", "label_loading") :
                  tableData.length == 0 ?
                    getString(langId, compId, "table_emptyData") :
                    getString(langId, compId, "table_noDataFound")
            }
            showPaginationBottom
            className="-striped -highlight default-pagination"
          />
        </CardBody>
      </Card>
    )
  }
}

export default StrategyResults;

StrategyResults.propTypes = {
  managers: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  prefs: PropTypes.object.isRequired,

  strategy: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired
}