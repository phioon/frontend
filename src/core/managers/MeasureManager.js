import AppManager from "./AppManager";
import MarketManager from "./MarketManager";
import TimeManager from "./TimeManager";

import {
  orderByAsc,
  getDistinctValuesFromList,
} from "../utils";


class MeasureManager {
  constructor(appManager, marketManager) {
    this.sModule = "measure"
    this.managers = {
      app: appManager,
      market: marketManager
    }
    this.config = {
      keys: {
        strHintId: "hintId",
        strData: "data",

        strLabelId: "labelId",
        strSelectedFormat: "selectedFormat",
      },
      formats: {
        strCurrency: "currency",
        strNumber: "number",
        strPercentage: "percentage",
      }
    }
  }

  // U T I L S
  percentage(v1, v2, decimals) {
    let result = 0

    if (v2 > 0) {
      result = this.round(v1 / v2 * 100, decimals)
    }

    return result
  }
  round(value, decimals) {
    switch (decimals) {
      case 0:
        value = Math.round(value)
        break;
      case 2:
        value = Math.round(value * 100) / 100
        break;
      case 3:
        value = Math.round(value * 1000) / 1000
        break;
      default:
        value = Math.round(value * 10) / 10
        break;
    }

    return value
  }

  // Selection

  opening_cost_currency(selection) {
    let cost = 0.00

    for (var obj of selection)
      cost += obj.s_total_price

    return this.round(cost, 2)
  }
  closing_cost_currency(selection) {
    let cost = 0.00

    for (var obj of selection)
      if (obj.ended_on)
        cost += obj.e_total_price

    return this.round(cost, 2)
  }
  opCost_currency(selection, onlyHintId) {
    if (onlyHintId)
      return "opCost_currency_hint"

    let opCost = 0.00

    for (var obj of selection) {
      opCost += obj.s_operational_cost
      if (obj.ended_on)
        opCost += obj.e_operational_cost
    }

    return this.round(opCost, 2)
  }
  opCost_percentage(selection, onlyHintId) {
    if (onlyHintId)
      return "opCost_percentage_hint"

    let opCost = this.opCost_currency(selection)
    let totalCost = this.amountInvested_currency(selection)

    return this.percentage(opCost, totalCost, 2)
  }

  result_currency_raw(type, amount, asset_price, totalCost) {
    let result = 0.00

    if (type.name == "buy")
      result = (amount * asset_price) - totalCost
    else
      result = totalCost - (amount * asset_price)

    return this.round(result, 2)
  }

  amountInvested_currency(selection, onlyHintId) {
    if (onlyHintId)
      return "amountInvested_currency_hint"

    let totalCost = this.opening_cost_currency(selection) + this.opCost_currency(selection)

    return this.round(totalCost, 2)
  }
  async amountInvested_percentage(selection, onlyHintId) {
    if (onlyHintId)
      return "amountInvested_percentage_hint"

    let wBalance = await this.balance_currency(selection)
    let totalCost = this.amountInvested_currency(selection)

    return this.percentage(totalCost, wBalance, 0)
  }

  async balance_currency(selection) {
    let balance = 0.00
    let wallets = getDistinctValuesFromList(selection, "wallet")

    for (var w of wallets) {
      let wallet = await this.managers.app.walletRetrieve(w)
      balance += wallet.balance
    }

    return this.round(balance, 2)
  }

  closingVolume_currency(selection, onlyHintId) {
    if (onlyHintId)
      return "closingVolume_currency_hint"

    let closingVolume = this.closing_cost_currency(selection)

    return closingVolume
  }

  async result_currency(selection, onlyHintId) {
    if (onlyHintId)
      return "result_currency_hint"

    let result = 0.00

    if (selection.length > 0) {
      let assets = getDistinctValuesFromList(selection, "asset_symbol")
      assets = await this.managers.market.assetList(false, true, assets)

      for (var obj of selection) {
        let type = await this.managers.app.positionTypeRetrieve(obj.type)
        let totalCost = this.amountInvested_currency([obj])

        if (obj.ended_on)
          result += this.result_currency_raw(type, obj.amount, obj.e_unit_price, totalCost)
        else
          result += this.result_currency_raw(type, obj.amount, assets[obj.asset_symbol].data.asset_price, totalCost)
      }
    }

    return result
  }
  async result_percentage(selection, onlyHintId) {
    if (onlyHintId)
      return "result_percentage_hint"
    let result = await this.result_currency(selection)
    let totalCost = this.amountInvested_currency(selection)

    return this.percentage(result, totalCost)
  }

  async winners_number(selection, onlyHintId) {
    if (onlyHintId)
      return "winners_number_hint"

    let cWinners = 0

    for (var obj of selection) {
      let tResult = await this.result_currency([obj])
      if (tResult > 0)
        cWinners++
    }

    return cWinners
  }
  async winners_percentage(selection, onlyHintId) {
    if (onlyHintId)
      return "winners_percentage_hint"

    let cPositions = selection.length
    let cWinners = await this.winners_number(selection)

    return this.percentage(cWinners, cPositions)
  }

  // Raw Data
  async generateRawData(selection) {
    let rawData = []
    let assets = getDistinctValuesFromList(selection, "asset_symbol")
    assets = await this.managers.market.assetList(false, true, assets)

    for (var obj of selection) {

      let tWallet = await this.managers.app.walletRetrieve(obj.wallet)
      let tStockExchange = await this.managers.market.stockExchangeRetrieve(tWallet.se_short)
      let tCountry = await this.managers.app.countryRetrieve(tStockExchange.country_code)

      let tType = await this.managers.app.positionTypeRetrieve(obj.type)
      let totalCost = await this.amountInvested_currency([obj])
      let tResult_currency = await this.result_currency([obj])

      let asset_label = obj.asset_label
      let country_code = tCountry.code
      let wallet_id = tWallet.id
      let wallet_name = tWallet.name
      let type_id = tType.id
      let type_name = tType.name

      rawData.push({
        wallet_id: wallet_id,
        wallet_name: wallet_name,
        asset_label: asset_label,
        country_code: country_code,
        type_id: type_id,
        type_name: type_name,
        amount: obj.amount,
        started_on: obj.started_on,
        ended_on: obj.ended_on,
        totalCost: totalCost,
        tResult_currency: tResult_currency,
      })
    }

    return rawData
  }
  async generateDailyRawData(selection) {
    let rawData = []
    let assets = getDistinctValuesFromList(selection, "asset_symbol")
    assets = await this.managers.market.assetList(false, true, assets)

    for (var obj of selection) {
      let data = []
      let started_on = TimeManager.getDateString(obj.started_on)
      let ended_on = obj.ended_on ? TimeManager.getDateString(obj.ended_on) : TimeManager.getDateString()
      let tWallet = await this.managers.app.walletRetrieve(obj.wallet)
      let tType = await this.managers.app.positionTypeRetrieve(obj.type)
      let totalCost = await this.amountInvested_currency([obj])
      let dRaws = await this.managers.market.dRawList(false, obj.asset_symbol, obj.started_on, ended_on)

      let lastTradeDate = TimeManager.getDateString(assets[obj.asset_symbol].data.asset_lastTradeTime)

      let wallet_name = tWallet.name
      let asset_label = obj.asset_label
      let type_name = tType.name

      let dateList = []

      for (var dRaw of dRaws.data) {
        let d_date = TimeManager.getDateString(dRaw.d_datetime)
        dateList.push(d_date)

        if (d_date >= started_on && d_date <= ended_on) {
          let tResult_currency = 0
          if (obj.ended_on && d_date == ended_on)
            tResult_currency = this.result_currency_raw(tType, obj.amount, obj.e_unit_price, totalCost)
          else
            tResult_currency = this.result_currency_raw(tType, obj.amount, dRaw.d_close, totalCost)

          data.push({
            id: obj.id,
            date: d_date,
            wallet_name: wallet_name,
            asset_label: asset_label,
            type_name: type_name,
            totalCost: totalCost,
            tResult_currency: tResult_currency
          })
        }
      }

      if (!obj.ended_on &&
        started_on < lastTradeDate &&
        !getDistinctValuesFromList(data, "date").includes(lastTradeDate)) {

        let tResult_currency = this.result_currency_raw(tType, obj.amount, assets[obj.asset_symbol].data.asset_price, totalCost)
        data.push({
          id: obj.id,
          date: lastTradeDate,
          wallet_name: wallet_name,
          asset_label: asset_label,
          type_name: type_name,
          totalCost: totalCost,
          tResult_currency: tResult_currency
        })
      }
      rawData = rawData.concat(data)
    }

    rawData = orderByAsc(rawData, "date")
    return rawData
  }
  async generateMonthlyRawData(selection) {
    let rawData = []
    let assets = getDistinctValuesFromList(selection, "asset_symbol")
    assets = await this.managers.market.assetList(false, true, assets)

    for (var obj of selection) {
      let data = []
      let started_on = TimeManager.getDateString(obj.started_on)
      let ended_on = obj.ended_on ? TimeManager.getDateString(obj.ended_on) : TimeManager.getDateString()

      let tWallet = await this.managers.app.walletRetrieve(obj.wallet)
      let tType = await this.managers.app.positionTypeRetrieve(obj.type)
      let totalCost = await this.amountInvested_currency([obj])
      let dRaws = await this.managers.market.dRawList(false, obj.asset_symbol, obj.started_on, ended_on)

      let lastTradeDate = TimeManager.getDateString(assets[obj.asset_symbol].data.asset_lastTradeTime)

      let wallet_name = tWallet.name
      let asset_label = obj.asset_label
      let type_name = tType.name

      let dateList = []
      let monthList = []

      for (var dRaw of dRaws.data) {
        let month = TimeManager.getYearMonthString(dRaw.d_datetime)
        let d_date = TimeManager.getDateString(dRaw.d_datetime)
        dateList.push(d_date)

        if (!monthList.includes(month)) {
          let last_day_of_the_month = TimeManager.getDateString(dRaw.d_datetime)

          if (d_date >= started_on && d_date <= ended_on) {
            let tResult_currency = 0
            if (obj.ended_on && d_date == ended_on)
              tResult_currency = this.result_currency_raw(tType, obj.amount, obj.e_unit_price, totalCost)
            else
              tResult_currency = this.result_currency_raw(tType, obj.amount, dRaw.d_close, totalCost)

            data.push({
              id: obj.id,
              month: month,
              last_day_of_the_month: last_day_of_the_month,
              wallet_name: wallet_name,
              asset_label: asset_label,
              type_name: type_name,
              totalCost: totalCost,
              tResult_currency: tResult_currency
            })

            monthList.push(month)
          }
        }
      }

      if (!obj.ended_on &&
        started_on < lastTradeDate &&
        !dateList.includes(lastTradeDate)) {

        let tResult_currency = this.result_currency_raw(tType, obj.amount, assets[obj.asset_symbol].data.asset_price, totalCost)

        if (data.length > 0)
          data[0].tResult_currency = tResult_currency
        else
          data.push({
            id: obj.id,
            month: TimeManager.getYearMonthString(lastTradeDate),
            last_day_of_the_month: lastTradeDate,
            wallet_name: wallet_name,
            asset_label: asset_label,
            type_name: type_name,
            totalCost: totalCost,
            tResult_currency: tResult_currency
          })
      }

      rawData = rawData.concat(data)
    }

    rawData = orderByAsc(rawData, "month")
    return rawData
  }
  // --------------------

  // ---------------
  // KPIs
  // 'strLabelId' and 'strHintId' are used for translations
  async amountInvestedAsKpi(selection, kpiFormat) {
    let kpi = {}

    switch (kpiFormat) {
      case "currency":
        kpi[this.config.keys.strHintId] = this.amountInvested_currency(undefined, true)
        kpi[this.config.keys.strData] = this.amountInvested_currency(selection)
        break;
      case "percentage":
        kpi[this.config.keys.strHintId] = await this.amountInvested_percentage(undefined, true)
        kpi[this.config.keys.strData] = await this.amountInvested_percentage(selection)
        break;
      default:
        break;
    }

    return kpi
  }
  async closingVolumeAsKpi(selection, kpiFormat) {
    let kpi = {}

    switch (kpiFormat) {
      case "currency":
        kpi[this.config.keys.strHintId] = this.closingVolume_currency(undefined, true)
        kpi[this.config.keys.strData] = this.closingVolume_currency(selection)
        break;
      default:
        break;
    }

    return kpi
  }
  async opCostAsKpi(selection, kpiFormat) {
    let kpi = {}

    switch (kpiFormat) {
      case "currency":
        kpi[this.config.keys.strHintId] = this.opCost_currency(undefined, true)
        kpi[this.config.keys.strData] = this.opCost_currency(selection)
        break;
      case "percentage":
        kpi[this.config.keys.strHintId] = await this.opCost_percentage(undefined, true)
        kpi[this.config.keys.strData] = await this.opCost_percentage(selection)
      default:
        break;
    }

    return kpi
  }
  async resultAsKpi(selection, kpiFormat) {
    let kpi = {}

    switch (kpiFormat) {
      case "currency":
        kpi[this.config.keys.strHintId] = await this.result_currency(undefined, true)
        kpi[this.config.keys.strData] = await this.result_currency(selection)
        break;
      case "percentage":
        kpi[this.config.keys.strHintId] = await this.result_percentage(undefined, true)
        kpi[this.config.keys.strData] = await this.result_percentage(selection)
        break;
      default:
        break;
    }

    return kpi
  }

  async winnersAsKpi(selection, kpiFormat) {
    let kpi = {}

    switch (kpiFormat) {
      case "number":
        kpi[this.config.keys.strHintId] = await this.winners_number(undefined, true)
        kpi[this.config.keys.strData] = await this.winners_number(selection)
        break;
      case "percentage":
        kpi[this.config.keys.strHintId] = await this.winners_percentage(undefined, true)
        kpi[this.config.keys.strData] = await this.winners_percentage(selection)
        break;
      default:
        break;
    }

    return kpi
  }

  async rawData(selection, timeInterval) {
    let rawData = []

    switch (timeInterval) {
      case "none":
        rawData = await this.generateRawData(selection)
        break;
      case "daily":
        rawData = await this.generateDailyRawData(selection)
        break;
      case "monthly":
        rawData = await this.generateMonthlyRawData(selection)
        break;
      default:
        break;
    }

    return rawData
  }

}

export default MeasureManager;