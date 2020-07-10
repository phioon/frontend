import axios from "axios";

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function customAxios(method, url, headers, params, data) {
  try {
    const res = await axios({
      method: method,
      url: url,
      headers: headers,
      params: params,
      data: data
    });
    let successCodes = [200, 201, 202, 203, 204];
    if (successCodes.includes(res.status))
      return res;
    // return res.data;
    return { error: { status: res.status, statusText: res.statusText, responseURL: res.request.responseURL } };
  }
  catch (err) {
    return { error: err };
  }
}
export async function regularAxios(method, url, headers, params, data) {
  return axios({
    method: method,
    url: url,
    headers: headers,
    params: params,
    data: data
  }).then(res => res)
    .catch(err => err)
}

export function retrieveLessFields(objList, fieldList) {
  let result = []

  for (var obj of objList) {
    let tempObj = {}
    for (var field of fieldList)
      tempObj[field] = obj[field]
    result.push(tempObj)
  }

  return result
}
export function retrieveObjFromObjList(objList, keyField = "id", value) {
  for (var obj of objList)
    if (obj[keyField] == value)
      return obj
  return null
}
export function getDistinctValuesFromList(objList, field) {
  let distinctList = []

  for (var obj of objList)
    if (obj[field] && !distinctList.includes(obj[field]))
      distinctList.push(obj[field])
  return distinctList
}
export function getValueListFromObjList(objList, field) {
  let valueList = []

  for (var obj of objList)
    if (obj[field])
      valueList.push(obj[field])
  return valueList
}

export function getObjsExpectedField(objList, field, value) {
  let newObjList = []
  for (var obj of objList)
    if (!obj[field] == value)
      newObjList.push(obj)

  return newObjList
}
export function getObjsFieldNull(objList, field) {
  let newObjList = []
  for (var obj of objList)
    if (!obj[field])
      newObjList.push(obj)

  return newObjList
}
export function getObjsFieldNotNull(objList, field) {
  let newObjList = []
  for (var obj of objList)
    if (obj[field])
      newObjList.push(obj)

  return newObjList
}

export function removeFieldFromObjList(objList, field) {
  for (var obj of objList)
    delete obj[field]

  return objList
}

export function deepCloneObj(obj) {
  return JSON.parse(JSON.stringify(obj))
}

export function areObjsEqual(obj1, obj2) {
  return JSON.stringify(obj1) == JSON.stringify(obj2)
}

export function joinObjLists(objList0, objList1, keyField = "id") {
  // keyField must exist in every object of both lists
  let keyList = []

  for (var obj of objList0)
    keyList.push(obj[keyField])

  for (var obj of objList1)
    if (!keyList.includes(obj[keyField]))
      objList0.push(obj)

  return objList0
}

export function getFieldAsKey(objList, keyField) {
  let objDict = {}

  for (var obj of objList) {
    if (!objDict[obj[keyField]])
      objDict[obj[keyField]] = []

    objDict[obj[keyField]].push(obj)
  }

  return objDict
}
export function aggr(rawData, aggrProps, mFields = []) {
  let aggrData = []
  let fieldAsKey = {}

  for (var obj of rawData) {
    let aggrKey = ""
    for (var dField of aggrProps.toAggregate)
      aggrKey += String(obj[dField] + "__aggr__")
    aggrKey = aggrKey.substring(0, aggrKey.lastIndexOf("__aggr__"))

    if (!fieldAsKey[aggrKey]) {
      fieldAsKey[aggrKey] = {}

      for (var dField of aggrProps.toAggregate)
        fieldAsKey[aggrKey][dField] = obj[dField]
    }

    switch (aggrProps.action) {
      case "count":
        for (var mField of mFields) {
          if (!fieldAsKey[aggrKey][mField + "__count"])
            fieldAsKey[aggrKey][mField + "__count"] = 0
          fieldAsKey[aggrKey][mField + "__count"]++
        }
        break;
      case "sum":
        for (var mField of mFields) {
          if (!fieldAsKey[aggrKey][mField + "__sum"])
            fieldAsKey[aggrKey][mField + "__sum"] = 0
          fieldAsKey[aggrKey][mField + "__sum"] += obj[mField]
        }
        break;
      default:
        break;
    }
  }


  for (var obj of Object.values(fieldAsKey))
    aggrData.push(obj)

  return aggrData
}
export function cumulativeAggr(rawData, aggrProps, mFields = []) {
  // Usually, cumulative data are required for time series Charts (line, histogram...)
  // Because of that, it's common sense to keep date as xDimension.
  // yDimension is optional and will be used only if set. (!= undefined)
  let aggrData = []
  let xDimension = aggrProps.toAggregate[0]
  let dimensionAsKey = getFieldAsKey(rawData, xDimension)
  let keyField = aggrProps.keyField
  let previousKey = undefined

  console.log(dimensionAsKey)

  // Raw data are expected to be ordered. (usually by date ASC)
  for (var [k, v] of Object.entries(dimensionAsKey)) {
    // For each TODAY's object...
    if (previousKey)
      for (var obj of dimensionAsKey[previousKey]) {
        // ... check if its ID is found on YESTERDAY's object. (xRow has this information)
        let xRow = retrieveObjFromObjList(v, keyField, obj[keyField])

        if (!xRow) {
          let obj_copy = deepCloneObj(obj)
          obj_copy[xDimension] = k
          v.push(obj_copy)
        }
      }

    let vAggr = aggr(v, aggrProps, mFields)
    aggrData = aggrData.concat(vAggr)

    previousKey = k   // Set yesterday's key
  }

  return aggrData
}

export function convertMaskedStringToFloat(strNumber, currency) {
  let number = String(strNumber).replace(/[^0-9.,]/g, "")

  if (currency.decimal_symbol == ",") {
    number = number.replace(/\./g, "")    // Firstly, remove thousands separators (if there is any)
    number = number.replace(/\,/g, ".")   // Then, replace decimal separator ',' for '.'
  }
  else
    number = number.replace(/\,/g, "")    // Remove thousands separators. Decimal separator is already OK because it's a '.' already.
  return Number(number)
}
export function convertFloatToPercentage(number, decimal_symbol) {
  let strNumber = String(number).replace(/[^0-9-.,]/g, "")
  let result = ""

  if (decimal_symbol == ",")
    strNumber = strNumber.replace(/\./g, ",")

  result += strNumber + " %"

  return result
}
export function convertFloatToCurrency(number, currency) {
  let strNumber = String(number).replace(/[^0-9-.,]/g, "")
  let strInt = String(number).replace(/[^0-9-.,]/g, "")
  let strDecimal = "00"
  let result = ""

  if (number % 1 != 0) {
    strInt = strNumber.substring(0, strNumber.indexOf("."))
    strDecimal = strNumber.substring(strNumber.indexOf(".") + 1)

    if (strDecimal.length == 1)
      strDecimal += "0"
  }

  strInt = integerWithThousandsSeparator(strInt, currency.thousands_separator_symbol)

  if (number < 0) {
    strInt = strInt.substr(1)
    result += "-"
  }

  result += currency.symbol + " " + strInt + currency.decimal_symbol + strDecimal
  return result
}
export function integerWithThousandsSeparator(integer, thousands_separator) {
  let strInt = String(integer).replace(/[^0-9-.,]/g, "")
  let result = ""

  if (integer % 1 != 0)
    return null

  strInt = strInt.replace(/\B(?=(\d{3})+(?!\d))/g, thousands_separator)

  // if (integer < 0)
  //   result += "-"
  result += strInt

  return result
}

// Math
export function multiply(v1, v2) {
  return Math.round((v1 * v2) * 100) / 100
}
export function percentage(v1, v2) {
  return v2 > 0 ? Math.round(v1 / v2 * 100 * 10) / 10 : 0
}
export function sum(v1, v2) {
  return Math.round((v1 + v2) * 100) / 100
}
// function that verifies if a number is greater than another number
export function verifyGreaterThan(value, gt) {
  if (value > gt) {
    return true;
  }
  return false;
};
// function that verifies if a string has a given length or not
export function verifyLength(value, length) {
  if (value.length >= length) {
    return true;
  }
  return false;
};
// function that verifies if number is a integer
export function verifyIfInteger(value) {
  if (value % 1 == 0)
    return true;
  return false;
};

export function orderByAsc(objList, field = "id", isNumber = false) {
  if (isNumber)
    return objList.sort(
      (a, b) => (Number(a[field]) > Number(b[field])) ? 1
        : ((Number(b[field]) > Number(a[field])) ? -1
          : 0
        ))
  else
    return objList.sort(
      (a, b) => (String(a[field]).toLowerCase() > String(b[field]).toLowerCase()) ? 1
        : ((String(b[field]).toLowerCase() > String(a[field]).toLowerCase()) ? -1
          : 0
        ))
}
export function orderByDesc(objList, field = "id", isNumber = false) {
  if (isNumber)
    return objList.sort(
      (a, b) => (Number(a[field]) < Number(b[field])) ? 1
        : ((Number(b[field]) < Number(a[field])) ? -1
          : 0
        ))
  else
    return objList.sort(
      (a, b) => (String(a[field]).toLowerCase() < String(b[field]).toLowerCase()) ? 1
        : ((String(b[field]).toLowerCase() < String(a[field]).toLowerCase()) ? -1
          : 0
        ))
}