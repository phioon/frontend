import React from "react";
import PropTypes from "prop-types";

// react component for creating dynamic tables
import ReactTable from "react-table-v6";

import TimeManager from "../../core/managers/TimeManager";
import {
  convertFloatToCurrency,
  rtDefaultFilter,
  getDistinctValuesFromList,
  integerWithThousandsSeparator,
  orderBy
} from "../../core/utils";

class StrategyResults extends React.Component {
  constructor(props) {
    super(props);
    this.compId = this.constructor.name.toLowerCase();

    this.state = {
      isLoading: false,
      firstLoad: true,

      iItems: [],
      jsonLogic: {},

      tableData: [],

      stockExchange: {},
      currency: { code: "BRL", symbol: "R$", thousands_separator_symbol: ".", decimal_symbol: "," },
      alert: null,
    }
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

    let stockExchange = await this.props.managers.market.stockExchangeRetrieve(filters.general.stockExchange.value)
    let currency = await this.props.managers.app.currencyRetrieve(stockExchange.currency_code)

    let jsonRules = this.prepareRules(strategy, filters.variables)
    let data = await this.props.managers.strategy.buildData(stockExchange.se_short, jsonRules)
    let result = this.props.managers.strategy.applyRules(data, jsonRules)

    let tableData = await this.prepareTableData(result)

    this.setState({ isLoading: false, tableData, stockExchange, currency })
    this.props.toggleLoading(false)
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

  render() {
    let { prefs, getString } = this.props;
    let { firstLoad, isLoading, tableData, stockExchange, currency } = this.state;

    return (
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
              let tzDatetime = TimeManager.tzConvert(stockExchange.se_timezone, cell.value, true)
              tzDatetime.locale(getString(prefs.locale, "locales", prefs.locale))

              let calendarTime = tzDatetime.calendar(null, {
                sameDay: `[${getString(prefs.locale, "momentcalendar", "sameDay")}] LT`,
                nextDay: `[${getString(prefs.locale, "momentcalendar", "nextDay")}] LT`,
                nextWeek: `[${getString(prefs.locale, "momentcalendar", "next")}] dddd[,] LT`,
                lastDay: `[${getString(prefs.locale, "momentcalendar", "lastDay")}] LT`,
                lastWeek: `[${getString(prefs.locale, "momentcalendar", "last")}] dddd[,] LT`,
                sameElse: `L LT`
              })
              return calendarTime
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
          firstLoad ? getString(prefs.locale, this.compId, "table_firstLoad") :
            isLoading ? getString(prefs.locale, "generic", "label_loading") :
              tableData.length == 0 ?
                getString(prefs.locale, this.compId, "table_emptyData") :
                getString(prefs.locale, this.compId, "table_noDataFound")
        }
        showPaginationBottom
        className="-striped -highlight default-pagination"
      />
    )
  }
}

export default StrategyResults;

StrategyResults.propTypes = {
  prefs: PropTypes.object.isRequired,
  getString: PropTypes.func.isRequired,
  managers: PropTypes.object.isRequired,

  strategy: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired
}