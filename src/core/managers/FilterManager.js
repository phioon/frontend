import jsonLogic from "json-logic-js";
import { joinContentObjLists, retrieveObjFromObjList } from "../utils";

class FilterManager {
  constructor(marketManager) {
    this.managers = {
      market: marketManager
    }
    this.sModule = "filter"
  }

  buildRules(filterObject) {
    // {var1: [value1, value2]}

  }
}

export default FilterManager;