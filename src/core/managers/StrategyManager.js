import jsonLogic from "json-logic-js";
import { retrieveObjFromObjList } from "../utils";

class StrategyManager {
  constructor() {
    this.sModule = "strategy"
  }

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

  // Workspaces into JSON string (sending it to database)
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
  // --------------------

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
    console.log(rules)
    console.log(`Analyzing rules...`)

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

    console.log(items)

    return items
  }
  getWSItemsAdvanced(rules) {
    let items = []

    return items
  }
  // --------------------
}

export default StrategyManager;