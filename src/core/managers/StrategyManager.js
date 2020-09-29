import jsonLogic from "json-logic-js";
import { joinContentObjLists, retrieveObjFromObjList, sleep } from "../utils";

class StrategyManager {
  constructor(marketManager) {
    this.managers = {
      market: marketManager
    }
    this.sModule = "strategy"
  }
  // Building data
  // 1. Define Indicators involved and amount of periods needed
  async buildData(stockExchange, rules) {
    // From a list of indicators being used in a Strategy, build up data to be filtered by jsonLogic
    let iItems = await this.managers.market.indicatorData()
    let variables = this.getDistinctVariableList(rules)
    let iSummary = this.getIndicatorsUsage(iItems, variables)
    let rawData = []
    let result = []

    // iSummary object will help us on deciding which indicator instances should be downloaded and how many periods are needed
    for (var [k, v] of Object.entries(iSummary)) {
      switch (k) {
        case "quote":
          rawData.push(this.managers.market.dQuoteData(stockExchange, v.interval, v.instances, v.lastPeriods))
          break;
        case "ema":
          rawData.push(this.managers.market.dEmaData(stockExchange, v.interval, v.instances, v.lastPeriods))
          break;
        case "pvpc":
          rawData.push(this.managers.market.dPhiboData(stockExchange, v.interval, v.instances, v.lastPeriods))
          break;
        case "roc":
          rawData.push(this.managers.market.dRocData(stockExchange, v.interval, v.instances, v.lastPeriods))
          break;
        default:
          break;
      }
    }

    rawData = await Promise.all(rawData)

    result = rawData[0].instances
    for (var x = 1; x < rawData.length; x++)
      result = joinContentObjLists(result, rawData[x].instances, "asset_symbol")

    return result
  }
  getIndicatorsUsage(iItems, variables) {
    // Given a distinct list of variables, identify the instances (db fields), interval (d, w, m60) and periods needed.
    let indicators = {}

    for (var v of variables) {
      let [iName, periods] = v.split("__")
      periods = String(periods).replace(/[^0-9.,]/g, "")
      let lastPeriods = Number(periods) + 1

      for (var item of iItems) {
        let instance = retrieveObjFromObjList(item.instances, "name", iName)

        if (instance) {
          // Instance is valid (has been found in one of the iItems)

          if (!indicators[item.indicator]) {
            // Indicator must be added into Indicators object.
            indicators[item.indicator] = {}
            indicators[item.indicator].lastPeriods = lastPeriods
            indicators[item.indicator].interval = instance.interval
            indicators[item.indicator].instances = [iName]
          }
          else {
            // Indicator already being considered within Indicators object...

            if (!indicators[item.indicator].instances.includes(iName))
              indicators[item.indicator].instances.push(iName)

            if (lastPeriods > indicators[item.indicator].lastPeriods)
              indicators[item.indicator].lastPeriods = lastPeriods
          }

          break;          // Instance was found already. No need to keep looking for it, so leave this FOR.
        }
      }
    }
    return indicators
  }
  getDistinctVariableList(rules) {
    // Return a distinct list of variables being used by rules
    let varList = []

    for (var [logic, v0] of Object.entries(rules))
      for (var operation of v0)
        for (var [operator, variables] of Object.entries(operation))
          for (var v of variables)
            if (!varList.includes(v.var))
              varList.push(v.var)

    return varList
  }
  // 2. Apply logical rules into a list of objects
  applyRules(data, jsonRules) {
    let result = []

    for (var obj of data) {
      let itMatches = jsonLogic.apply(jsonRules, obj)

      if (itMatches)
        result.push(obj)
    }

    return result
  }
  // --------------------

  // WS Rules utils
  isDynamic(strategy) {
    if (strategy.workspaces)
      for (var ws of strategy.workspaces) {
        if (ws.type == "advanced") {
          // Evaluate how to decide if an Advanced WS is Dynamic or Static
          continue
        }
      }

    return true
  }
  replaceVariable(wsRules, varId, value) {
    // For a Strategy to be Dinamic, we use variables within its Rules, so we can replace them for any other value in runtime.
    // Most common example: variable.replace("<interval>", "d")

    varId = "<" + varId + ">"

    for (var [logic, v0] of Object.entries(wsRules))
      for (var operation of v0)
        for (var [operator, variables] of Object.entries(operation)) {
          for (var v of variables) {
            // Each variable of the operation
            if (v.var && String(v.var).includes(varId)) {
              // Key 'var' exists and it matches our varId
              v.var = String(v.var).replace(varId, value)
            }
          }
        }

    return wsRules
  }
  // --------------------

  // Workspaces into JSON string (before sending it to database)
  jsonRulesAsString(workspaces) {
    let jsonRules = {}

    for (var ws of workspaces) {
      switch (ws.type) {
        case "basic":
          jsonRules[ws.id] = ws.rules
          break;
        case "advanced":
          jsonRules[ws.id] = ws.rules
          break;
        default:
          break;
      }
    }

    return JSON.stringify(jsonRules)
  }

  // WS into JSON
  isWorkspaceValid(workspace) {
    // Validate basic fields
    if (!workspace.hasOwnProperty("id"))
      return false
    if (!workspace.hasOwnProperty("items") || !Array.isArray(workspace.items))
      return false
    if (!workspace.hasOwnProperty("type"))
      return false

    return true
  }
  convertWSIntoJSONRules(workspace) {
    let jsonRules = {}

    if (this.isWorkspaceValid(workspace))
      switch (workspace.id) {
        case "basic_0":
          if (Object.values(workspace.items).length >= 2)
            jsonRules = this.getJSONRulesBasic(workspace.items, 0)
          break;
        case "basic_1":
          if (Object.values(workspace.items).length >= 2)
            jsonRules = this.getJSONRulesBasic(workspace.items, 1)
          break;
        case "advanced":
          break;
        default:
          break;
      }

    return jsonRules
  }
  getJSONRulesBasic(items, shift) {
    let jsonRules = {
      and: []
    }
    let rule = {}
    let operator = ">="

    let lastItemId = String("<interval>_" + items[0].id + "__p" + shift)

    for (var item of items) {
      let itemId = String("<interval>_" + item.id + "__p" + shift)
      if (itemId !== lastItemId) {
        rule = {
          [operator]: [
            { var: lastItemId },
            { var: itemId }
          ]
        }
        jsonRules.and.push(rule)

        lastItemId = itemId
      }
    }

    return jsonRules
  }
  // --------------------

  // JSON into WS
  convertJSONRulesIntoWS(iItems, wsId, wsRules) {
    let workspace = {
      id: wsId,
      items: [],
      rules: wsRules,
      type: undefined
    }

    if (wsId.startsWith("basic")) {
      workspace.type = "basic"
      workspace.items = this.getWSItemsBasic(iItems, wsRules)
    }
    else if (wsId.startsWith("advanced")) {
      workspace.type = "advanced"
      workspace.items = this.getWSItemsAdvanced(wsRules)
    }

    return workspace
  }
  getWSItemsBasic(iItems, rules) {
    let items = []

    // Expected logics:     ['and']
    // Expected operators:  ['>=']
    for (var [logic, v0] of Object.entries(rules))
      for (var operation of v0)
        for (var [operator, variables] of Object.entries(operation)) {
          switch (operator) {
            case ">=":
              for (var v of variables) {
                let itemId = String(v.var).replace('<interval>_', '')
                itemId = itemId.substring(0, itemId.indexOf('__'))

                if (!retrieveObjFromObjList(items, 'id', itemId)) {
                  let item = retrieveObjFromObjList(iItems, 'id', itemId)
                  items.push(item)
                }
              }
              break;
            default:
              break;
          }
        }

    return items
  }
  getWSItemsAdvanced(rules) {
    let items = []

    return items
  }
  // --------------------
}

export default StrategyManager;