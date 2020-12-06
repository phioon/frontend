import React from "react";
import { Col, Row } from "reactstrap";

import {
  convertFloatToPercentage,
  convertFloatToCurrency,
  deepCloneObj,
  distance,
  joinContentObjLists,
  retrieveObjFromObjList,
} from "../utils";
import jsonLogic from "json-logic-js";

var percentage = (value) => { return { perc: value } }
var constant = (value) => { return { const: value } }

// Custom operation to handle Distance tool
jsonLogic.add_operation("distance", distance);
// Custom operations to handle Objects
jsonLogic.add_operation("perc", percentage);
jsonLogic.add_operation("const", constant);


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
          rawData.push(this.managers.market.quoteData(stockExchange, v.interval, v.instances, v.lastPeriods))
          break;
        case "sma":
          rawData.push(this.managers.market.smaData(stockExchange, v.interval, v.instances, v.lastPeriods))
          break;
        case "ema":
          rawData.push(this.managers.market.emaData(stockExchange, v.interval, v.instances, v.lastPeriods))
          break;
        case "phibo":
          rawData.push(this.managers.market.phiboData(stockExchange, v.interval, v.instances, v.lastPeriods))
          break;
        case "roc":
          // Problem is here... This case is never reached out.
          rawData.push(this.managers.market.rocData(stockExchange, v.interval, v.instances, v.lastPeriods))
          break;
      }
    }

    rawData = await Promise.all(rawData)

    result = rawData[0].data
    for (var x = 1; x < rawData.length; x++)
      result = joinContentObjLists(result, rawData[x].data, "asset_symbol")

    return result
  }
  getIndicatorsUsage(iItems, variables) {
    // Given a distinct list of variables, identify the instances (db fields), interval (d, w, m60) and periods needed.
    let indicators = {}

    for (var v of variables) {
      let iName = v.substring(0, v.indexOf("__"))
      let offset = this.getOffsetFromVariable(v)
      let lastPeriods = offset + 1

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
            if (v.hasOwnProperty("var") && !varList.includes(v.var))
              varList.push(v.var)

    return varList
  }
  // 2. Apply logical rules into a list of objects
  applyRules(data, jsonRules) {
    let result = []
    let variables = this.getDistinctVariableList(jsonRules)

    for (var obj of data) {
      let isValidated = true

      for (var v of variables)
        if (!(v in obj)) {
          isValidated = false
          break;
        }

      if (isValidated) {
        let itMatches = jsonLogic.apply(jsonRules, obj)

        if (itMatches)
          result.push(obj)
      }
    }

    return result
  }
  // --------------------

  // WS Rules utils
  isDynamic(strategy) {
    if (strategy.workspaces)
      for (var ws of strategy.workspaces) {
        if (ws.type === "advanced") {
          // Checking if advanced WS is Dynamic or Static
          for (var item of ws.items)
            for (var iItem of item.items)
              if (iItem.interval !== "any")
                return false
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
        for (var [operator, values] of Object.entries(operation)) {
          for (var v of values) {
            // Each value of the operation
            if (v.hasOwnProperty("var") && String(v.var).includes(varId)) {
              // Key 'var' exists and it matches our varId
              v.var = String(v.var).replace(varId, value)
            }
          }
        }

    return wsRules
  }
  standardizeWSRules(wsId, wsRules) {
    let stdObj = {}

    if (wsId === "advanced") {
      // It's an Advanced WS, so let's check the tools that are being used...
      let constantObjNeeded = ["distance"]

      for (var [logic, v0] of Object.entries(wsRules)) {
        stdObj[logic] = []

        for (var tool of v0)
          for (var [toolId, operation] of Object.entries(tool)) {
            for (var [operator, values] of Object.entries(operation)) {
              let stdOperation = { [operator]: [] }

              for (var v of values) {
                // Each value of the operation
                if (!constantObjNeeded.includes(toolId) && v.hasOwnProperty("const")) {
                  // It's a constant and object {const: <value>} is not needed, so ignore key "const"
                  v = deepCloneObj(v.const)
                }

                stdOperation[operator].push(v)
              }
              stdObj[logic].push(stdOperation)
            }
          }
      }
    }
    else
      stdObj = wsRules

    return stdObj
  }
  // --------------------

  // Workspaces into JSON string (before sending it to database)
  jsonRulesAsString(workspaces) {
    let jsonRules = {}

    for (var ws of workspaces)
      jsonRules[ws.id] = ws.rules

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
          if (Object.values(workspace.items).length >= 1)
            jsonRules = this.getJSONRulesAdvanced(workspace.items)
          break;
      }

    return jsonRules
  }
  getJSONRulesBasic(items, offset) {
    let jsonRules = { and: [] }
    let rule = {}
    let operator = ">"

    let lastItemId = String(`<interval>_${items[0].id}__p${offset}`)

    for (var item of items) {
      let itemId = String(`<interval>_${item.id}__p${offset}`)
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

  getJSONRulesAdvanced(items) {
    let jsonRules = { and: [] }

    for (var obj of items) {
      let rule = { [obj.toolId]: [] }

      switch (obj.toolId) {
        case "comparison":
          rule[obj.toolId] = this.getComparisonRules(obj)
          break;
        case "distance":
          rule[obj.toolId] = this.getDistanceRules(obj)
          break;
        case "slope":
          rule[obj.toolId] = this.getComparisonRules(obj)
          break;
      }

      jsonRules.and.push(rule)
    }
    return jsonRules
  }
  getComparisonRules(obj) {
    let rule = { [obj.operator]: [] }

    for (var item of obj.items) {
      let value = undefined

      switch (item.id) {
        case "constant":
          value = { const: item.value }
          break;
        default:
          let interval = item.interval === "any" ? "<interval>" : item.interval
          value = { var: String(`${interval}_${item.id}__p${item.offset}`) }
          break;
      }
      rule[obj.operator].push(value)
    }
    return rule
  }
  getDistanceRules(obj) {
    let rule = { distance: [] }

    for (var item of obj.items) {
      let value = undefined

      switch (item.id) {
        case "constant":
          value = { const: item.value }
          break;
        default:
          let interval = item.interval === "any" ? "<interval>" : item.interval
          value = { var: String(`${interval}_${item.id}__p${item.offset}`) }
          break;
      }
      rule.distance.push(value)
    }

    // Handling threshold... { perc: <value> } or { const: <value> }
    rule.distance.push(obj.threshold)

    return rule
  }
  // --------------------
  // JSON into WS
  convertJSONRulesIntoWS(getString, prefs, currency, iItems, wsId, wsRules) {
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
      workspace.items = this.getWSItemsAdvanced(iItems, wsRules)
      workspace.items = this.buildElements(getString, prefs, currency, workspace.items)
    }

    return workspace
  }
  getWSItemsBasic(iItems, rules) {
    let items = []

    // Expected logics:     ['and']
    // Expected operators:  ['>']
    for (var [logic, v0] of Object.entries(rules))
      for (var operation of v0)
        for (var [operator, variables] of Object.entries(operation)) {
          for (var v of variables) {
            let strInterval = String(v.var).substring(0, String(v.var).indexOf("_") + 1)

            let itemId = String(v.var).replace(strInterval, "")
            itemId = itemId.substring(0, itemId.indexOf("__"))

            if (!retrieveObjFromObjList(items, "id", itemId)) {
              let item = retrieveObjFromObjList(iItems, "id", itemId)
              items.push(item)
            }
          }
        }

    return items
  }
  getWSItemsAdvanced(iItems, rules) {
    let items = []

    // Expected logics:     ['and']
    // Expected operators:  ['=', '>', '>=', '<', '<=']
    for (var [logic, v0] of Object.entries(rules))
      for (var tool of v0)
        for (var [toolId, operation] of Object.entries(tool)) {
          let item = undefined

          switch (toolId) {
            case "comparison":
              item = this.getComparisonWSItems(iItems, operation)
              break;
            case "distance":
              item = this.getDistanceWSItems(iItems, operation)
              break;
            case "slope":
              // Same structure as [Comparison]...
              item = this.getComparisonWSItems(iItems, operation)
              item.toolId = "slope"
              break
          }
          items.push(item)
        }

    return items
  }
  getComparisonWSItems(iItems, operation) {
    let item = { toolId: "comparison" }

    for (var [operator, variables] of Object.entries(operation)) {
      item.operator = operator
      item.items = []

      for (var v of variables) {
        let iItem = undefined
        let itemId = undefined
        let interval = "<interval>"
        let offset = 0

        if (v.hasOwnProperty("var")) {
          interval = String(v.var).substring(0, String(v.var).indexOf("_"))
          offset = this.getOffsetFromVariable(v.var)

          itemId = String(v.var).replace(`${interval}_`, "")
          itemId = itemId.substring(0, itemId.indexOf("__"))

          iItem = retrieveObjFromObjList(iItems, "id", itemId)
        }
        else if (v.hasOwnProperty("const")) {
          interval = "any"
          offset = 0

          itemId = "constant"

          iItem = retrieveObjFromObjList(iItems, "id", itemId)
          iItem.value = v.const
        }

        iItem.interval = interval.replace("<interval>", "any")
        iItem.offset = offset

        item.items.push(deepCloneObj(iItem))
      }
    }
    return item
  }
  getDistanceWSItems(iItems, operation) {
    let item = { toolId: "distance" }

    for (var [operator, variables] of Object.entries(operation)) {
      item.threshold = variables[2]   // Third element
      item.items = []

      for (var x = 0; x < 2; x++) {
        // Only the first two elements are iItems. The third one is [threshold]
        let v = variables[x]
        let iItem = undefined
        let itemId = undefined
        let interval = "<interval>"
        let offset = 0

        if (v.hasOwnProperty("var")) {
          interval = String(v.var).substring(0, String(v.var).indexOf("_"))
          offset = this.getOffsetFromVariable(v.var)

          itemId = String(v.var).replace(`${interval}_`, "")
          itemId = itemId.substring(0, itemId.indexOf("__"))

          iItem = retrieveObjFromObjList(iItems, "id", itemId)
        }
        else if (v.hasOwnProperty("const")) {
          interval = "any"
          offset = 0

          itemId = "constant"

          iItem = retrieveObjFromObjList(iItems, "id", itemId)
          iItem.value = v.const
        }

        iItem.interval = interval.replace("<interval>", "any")
        iItem.offset = offset

        item.items.push(deepCloneObj(iItem))
      }
    }
    return item
  }
  // --------------------
  // React Elements
  buildElements(getString, prefs, currency, wsItems) {
    for (var item of wsItems) {
      switch (item.toolId) {
        case "comparison":
          item.element = this.buildComparisonElement(getString, prefs, currency, item)
          break;
        case "distance":
          item.element = this.buildDistanceElement(getString, prefs, currency, item)
          break;
        case "slope":
          item.element = this.buildSlopeElement(getString, prefs, item)
          break;
      }
    }
    return wsItems
  }
  buildComparisonElement(getString, prefs, currency, item) {
    // Element that appears on Sortable List...
    let ignoreTranslation = ["constant"]
    let showAsCurrency = ["price_lagging"]

    // Pretty print when is could be printed as Currency
    if (ignoreTranslation.includes(item.items[0].id) && showAsCurrency.includes(item.items[1].category)) {
      // First item is [constant] and the second one is a [price_lagging]
      item.items[0].prettyValue = convertFloatToCurrency(item.items[0].value, currency)
    }
    else if (ignoreTranslation.includes(item.items[1].id) && showAsCurrency.includes(item.items[0].category)) {
      // Second item is [constant] and the first one is a [price_lagging]
      item.items[1].prettyValue = convertFloatToCurrency(item.items[1].value, currency)
    }

    return (
      <Row>
        {/* First Item */}
        <Col xs="5" className="centered">
          {item.items[0].interval === "any" ? "" : `[${item.items[0].interval}] `}
          {ignoreTranslation.includes(item.items[0].id) ?
            showAsCurrency.includes(item.items[1].category) ?
              item.items[0].prettyValue :
              item.items[0].value :
            getString(prefs.locale, "indicators", item.items[0].id)
          }
          {Number(item.items[0].offset) === 0 ? "" : ` [${item.items[0].offset}]`}
        </Col>
        {/* Operator */}
        <Col xs="2" className="centered">
          <b>{item.operator}</b>
        </Col>
        {/* Second Item */}
        <Col xs="5" className="centered">
          {item.items[1].interval === "any" ? "" : `[${item.items[1].interval}] `}
          {ignoreTranslation.includes(item.items[1].id) ?
            showAsCurrency.includes(item.items[0].category) ?
              item.items[1].prettyValue :
              item.items[1].value :
            getString(prefs.locale, "indicators", item.items[1].id)
          }
          {Number(item.items[1].offset) === 0 ? "" : ` [${item.items[1].offset}]`}
        </Col>
      </Row>
    )
  }
  buildDistanceElement(getString, prefs, currency, item) {
    // Element that appears on Sortable List...
    let ignoreTranslation = ["constant"]

    return (
      <Row>
        {/* First Item */}
        <Col xs="5" className="centered">
          {item.items[0].interval === "any" ? "" : `[${item.items[0].interval}] `}
          {ignoreTranslation.includes(item.items[0].id) ?
            item.items[0].value :
            getString(prefs.locale, "indicators", item.items[0].id)
          }
          {Number(item.items[0].offset) === 0 ? "" : ` [${item.items[0].offset}]`}
        </Col>
        {/* Distance */}
        <Col xs="2" className="centered">
          <small><b>
            {`< ${item.threshold.perc ?
              convertFloatToPercentage(item.threshold.perc, currency.decimal_symbol) :
              convertFloatToCurrency(item.threshold.const, currency)} >`
            }
          </b></small>
        </Col>
        {/* Second Item */}
        <Col xs="5" className="centered">
          {item.items[1].interval === "any" ? "" : `[${item.items[1].interval}] `}
          {ignoreTranslation.includes(item.items[1].id) ?
            item.items[1].value :
            getString(prefs.locale, "indicators", item.items[1].id)
          }
          {Number(item.items[1].offset) === 0 ? "" : ` [${item.items[1].offset}]`}
        </Col>
      </Row>
    )
  }
  buildSlopeElement(getString, prefs, item) {
    // Element that appears on Sortable List...
    return (
      <Row>
        {/* iItem */}
        <Col xs="5" className="centered">
          {item.items[0].interval === "any" ? "" : `[${item.items[0].interval}] `}
          {getString(prefs.locale, "indicators", item.items[0].id)}
          {Number(item.items[0].offset) === 0 ? "" : ` [${item.items[0].offset}]`}
        </Col>
        {/* Slope */}
        <Col xs="2" className="centered">
          <small><b>
            {`< ${getString(prefs.locale, "indicators", "label_slope")} >`}
          </b></small>
        </Col>
        {/* Direction */}
        <Col xs="5" className="centered">
          {item.operator === ">" ?
            getString(prefs.locale, "indicators", "label_upwards") :
            getString(prefs.locale, "indicators", "label_downwards")
          }
        </Col>
      </Row>
    )
  }
  // --------------------
  // General Utils
  getOffsetFromVariable(variable) {
    let [iName, offset] = String(variable).split("__")
    offset = String(offset).replace(/[^0-9]/g, "")

    return Number(offset)
  }
}

export default StrategyManager;