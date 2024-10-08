import axios from "axios";
import { trim } from "jquery";
import { isAuthenticated } from "../App";

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Requests
export async function httpRequest(method, url, headers, params, data) {
  let result = { status: undefined }

  if (headers.Authorization) {
    // Authentication is needed
    if ([true, undefined].includes(isAuthenticated)) {
      // User is probably authenticated
      result = axios({
        method: method,
        url: url,
        headers: headers,
        params: params,
        data: data
      }).then(res => res)
        .catch(err => err)
    }
  }
  else {
    // No authentication is needed
    result = axios({
      method: method,
      url: url,
      headers: headers,
      params: params,
      data: data
    }).then(res => res)
      .catch(err => err)
  }

  return result
}
export function getPaginationCursor(url) {
  let cursor = undefined
  let strLookup = "cursor="
  let strLimit = "&"

  if (url) {
    cursor = String(url).substring(url.indexOf(strLookup) + strLookup.length)

    if (cursor.includes(strLimit))
      cursor = cursor.substring(0, cursor.indexOf(strLimit))
  }

  return cursor
}

// Handling data structures
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
  // Return the first occurrence found
  for (var obj of objList)
    if (obj[keyField] == value)
      return obj
  return null
}
export function indexOfObj(objList, keyField = "id", value) {
  // Return the first occurrence found
  for (var x = 0; x < objList.length; x++) {
    if (objList[x][keyField] == value)
      return x
  }
  return -1
}
export function queryObjList(objList, filters = { field: [undefined] }) {
  // Filter object and return only the matching occurrencies
  let data = []

  for (var obj of objList) {
    let push = undefined

    // Apply filter
    for (var [k, v] of Object.entries(filters))
      // Object 'filters' is not empty
      if (v.includes(obj[k]))
        push = true
      else {
        push = false
        break;        // Leaves this FOR iteration and check next 'obj'
      }

    if (push)
      data.push(obj)
  }

  return data
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
export function getObjPropByStringPath(obj, path = "prop1.prop2.prop3") {
  path = path.split(".")
  let prop = obj[path.splice(0, 1)]

  for (var p of path) {
    if (p in prop)
      prop = prop[p]
    else {
      prop = undefined
      break;
    }
  }

  return prop
}
export function removeFieldFromObjList(objList, field) {
  for (var obj of objList)
    delete obj[field]

  return objList
}
export function deepCloneObj(obj) {
  return JSON.parse(JSON.stringify(obj))
}
export function joinObjLists(objList0, objList1, keyField = "id") {
  // Both lists must have the keyField.
  // Objects that doesn't exist on objList0, but exist on objList1, will be pushed into objList0.
  let keyList = []

  for (var obj of objList0)
    keyList.push(obj[keyField])

  for (var obj of objList1)
    if (!keyList.includes(obj[keyField]))
      objList0.push(obj)

  return objList0
}
export function joinContentObjLists(objList0, objList1, keyField = "id") {
  // Both lists must have the keyField.
  // Keys that doesn't exist on objList0, but exist on objList1, will be pushed into its object (main list).

  for (var obj of objList0) {
    let key = obj[keyField]
    let relatedObj = retrieveObjFromObjList(objList1, keyField, key)

    if (relatedObj)
      for (var [k, v] of Object.entries(relatedObj))
        if (!Object.keys(obj).includes(k))
          obj[k] = v
  }

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

// Used by Sortable List
export function arrayMove(array, from, to) {
  array = [...array];
  array = arrayMoveMutate(array, from, to);

  return array;
}
function arrayMoveMutate(array, from, to) {
  const startIndex = from < 0 ? array.length + from : from;

  if (startIndex >= 0 && startIndex < array.length) {
    const endIndex = to < 0 ? array.length + to : to;

    const [item] = array.splice(from, 1);
    array.splice(endIndex, 0, item);
  }

  return array
}

// Used by React Table
export function rtDefaultFilter(filter, row, column) {
  let id = filter.pivotId || filter.id

  return row[id] !== undefined ?
    String(row[id]).toLowerCase().includes(filter.value.toLowerCase()) :
    true
}

// Converting
export function convertMaskedStringToFloat(strNumber, currency) {
  let number = String(strNumber).replace(/[^0-9.,]/g, "")

  if (currency.decimal_symbol == ",") {
    number = number.replace(/\./g, "")    // Firstly, remove thousand separators (if there is any)
    number = number.replace(/\,/g, ".")   // Then, replace decimal separator ',' for '.'
  }
  else
    number = number.replace(/\,/g, "")    // Remove thousand separators. Decimal separator is OK because it's a '.' already.
  return Number(number)
}
export function convertFloatToPercentage(number, decimal_symbol) {
  number = Number(number)
  let strNumber = String(number).replace(/[^0-9-.,]/g, "")
  let result = ""

  if (decimal_symbol === ",")
    strNumber = strNumber.replace(/\./g, ",")

  result += strNumber + " %"

  return result
}
export function convertFloatToCurrency(number, currency) {
  number = Number(number)
  let strNumber = String(number).replace(/[^0-9-.,]/g, "")
  let strInt = String(number).replace(/[^0-9-.,]/g, "")
  let strDecimal = "00"
  let result = ""

  if (number % 1 !== 0) {
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
  result += strInt

  return result
}

// Math
export function multiply(v1, v2) {
  return Math.round((v1 * v2) * 100) / 100
}
export function percentage(v1, v2, decimals = 2) {
  let result = 0

  if (v2 > 0)
    result = round(v1 / v2 * 100, decimals)

  return result
}
export function sum(v1, v2) {
  return Math.round((v1 + v2) * 100) / 100
}
export function round(value, decimals) {
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
    case 4:
      value = Math.round(value * 10000) / 10000
      break;
    default:
      value = Math.round(value * 10) / 10
      break;
  }

  return value
}
export function distance(v1, v2, threshold) {
  let distance = v1 - v2

  if (threshold.perc) {
    distance = distance / v1
    threshold = threshold.perc / 100
  }
  else
    threshold = threshold.const

  distance = Math.abs(distance)

  return distance <= threshold
}

// Icons
export function getIconFromURL(value) {
  let icon = "fas fa-link";

  if (value.includes("https://facebook.com"))
    icon = "fab fa-facebook-f"
  else if (value.includes("https://instagram.com"))
    icon = "fab fa-instagram"
  else if (value.includes("https://linkedin.com"))
    icon = "fab fa-linkedin-in"
  else if (value.includes("https://t.me"))
    icon = "fab fa-telegram"
  else if (value.includes("https://twitter.com"))
    icon = "fab fa-twitter"
  else if (value.includes("https://whatsapp.com"))
    icon = "fab fa-whatsapp"
  else if (value.includes("wikipedia.org"))
    icon = "fab fa-wikipedia-w"
  else if (value.includes("https://youtube.com") || value.includes("https://youtu.be"))
    icon = "fab fa-youtube"

  return icon
}

// String
export function cutLine(line, limitLength, blankSpaceLookup) {
  let nextSpace = line.indexOf(" ", blankSpaceLookup)

  if (nextSpace > 0 && nextSpace < limitLength)
    line = line.substring(0, nextSpace)
  else
    line = line.substring(0, limitLength)

  return line
}
export function substringText(text, maxLength) {
  text = String(text)
  maxLength = maxLength - 3

  if (text.length > maxLength) {
    text = text.substring(0, maxLength)
    text += "..."
  }

  return text
}
export function getInitials(fullName) {

  var names = trim(String(fullName)).split(" ")
  var fisrtName = names.shift().toUpperCase()
  var lastName = names.pop().toUpperCase()

  var initials = `${fisrtName[0]}${lastName[0]}`

  return initials
}
export function getFirstAndLastName(fullName) {

  let maxLength = 18

  let names = trim(String(fullName)).split(" ")
  let firstName = names.shift()
  let lastName = names.pop()

  let shortName = `${firstName} ${lastName}`

  if (fullName.length > maxLength)
    if (shortName.length > maxLength)
      fullName = `${firstName} ${lastName[0]}.`
    else
      fullName = shortName

  return fullName
}
export function areObjsEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2)
}
export function compare(string1, string2) {
  if (string1 === string2) {
    return true;
  }
  return false;
}
export function verifyEmail(value) {
  var emailRex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (emailRex.test(value))
    return true;
  return false;
}
export function verifyGreaterThan(value, gt) {
  if (value > gt) {
    return true;
  }
  return false;
}
export function verifyLength(value, minLen, maxLen = undefined) {
  value = String(value);

  if (value.length >= minLen) {
    if (maxLen) {
      if (value.length <= maxLen)
        return true
    }
    else
      return true;
  }
  return false;
}
export function verifyOnlyLetters(value) {
  value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return /^[a-zA-Z- ]+$/.test(value);
}
export function verifyURL(value) {
  var linkRex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  if (linkRex.test(value))
    return true;
  return false;
}
// function that verifies if a string is valid for username
export function verifyUsernameStr(value) {
  return /^[0-9a-zA-Z_.]+$/.test(value);
}
export function verifyIfInteger(value) {
  if (value % 1 === 0)
    return true;
  return false;
}

export function orderBy(objList, fields = ["id"]) {
  return objList.sort(function (a, b) {
    for (var field of fields) {
      let orderType = "asc"
      if (field.startsWith("-")) {
        field = field.replace("-", "")
        orderType = "desc"
      }

      let aValue = typeof a[field] == "string" ? String(a[field]).toLowerCase() : Number(a[field])
      let bValue = typeof b[field] == "string" ? String(b[field]).toLowerCase() : Number(b[field])

      if (orderType == "asc") {
        // ASC
        if (aValue > bValue)
          return 1
        else if (aValue < bValue)
          return -1
      }
      else
        // DESC
        if (aValue < bValue)
          return 1
        else if (aValue > bValue)
          return -1
      // If aValue is equals to bValue, next field will try to solve it.
    }
    return 0
  })
}