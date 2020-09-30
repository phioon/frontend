import React from "react";
import PropTypes from "prop-types";

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

      stockExchange: {},
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
    let { getString } = this.props;
    let { langId, compId, firstLoad, isLoading, tableData, stockExchange, currency } = this.state;

    return (
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
            width: 100,
            filterable: false
          },
          {
            className: "text-right",
            Header: getString(langId, compId, "header_volume"),
            accessor: "avg_volume_10d",
            Cell: (cell) => { return integerWithThousandsSeparator(cell.value, currency.thousands_separator_symbol) },
            width: 120,
            filterable: false
          },
          {
            Header: getString(langId, compId, "header_lastTradeTime"),
            accessor: "last_trade_time",
            Cell: (cell) => {
              let tzDatetime = TimeManager.tzConvert(stockExchange.se_timezone, cell.value, true)
              tzDatetime.locale(getString(langId, "locales", langId))

              let calendarTime = tzDatetime.calendar(null, {
                sameDay: `[${getString(langId, "momentcalendar", "sameDay")}] LT`,
                nextDay: `[${getString(langId, "momentcalendar", "nextDay")}] LT`,
                nextWeek: `[${getString(langId, "momentcalendar", "next")}] dddd[,] LT`,
                lastDay: `[${getString(langId, "momentcalendar", "lastDay")}] LT`,
                lastWeek: `[${getString(langId, "momentcalendar", "last")}] dddd[,] LT`,
                sameElse: `L LT`
              })
              return calendarTime
            }
          }
        ]}
        defaultPageSize={10}
        previousText={getString(langId, "reacttable", "label_previous")}
        nextText={getString(langId, "reacttable", "label_next")}
        pageText={getString(langId, "reacttable", "label_page")}
        ofText={getString(langId, "reacttable", "label_of")}
        rowsText={getString(langId, "reacttable", "label_rows")}
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