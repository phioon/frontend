import {
  aggr,
  cumulativeAggr,
  deepCloneObj,
  getDistinctValuesFromList,
  getValueListFromObjList,
  percentage,
  orderByAsc,
  orderByDesc
} from "../utils";
import { getString } from "../lang";

const colors = {
  cold: [],
  hot: [],
  green: ["#196719", "#1e7b1e", "#239023", "#28a428", "#2db92d", "#32cd32", "#46d246", "#5bd75b", "#6fdc6f", "#84e184"],
  red: ["#800000", "#990000", "#b30000", "#cc0000", "#e60000", "#ff0000", "#ff1a1a", "#ff3333", "#ff4d4d", "#ff6666"],
  default: [
    "#bcbdc0",  // Light Grey
    "#51bcda",  // Light Blue
    "#fbc658",  // Light Orange
    "#5cd65c",  // Light Green
    "#5cd6d6",  // Light Blue-Green
    "#c178c1",  // Light Purple
    "#dcb285",  // Light Brown
    "#1F77D0",  // Blue
    "#ff00ff",  // Pink
    "#ffff66",  // Yellow
    "#804000",  // Brown
    "#00e6e6",  // Aqua
    "#5e5e5e",  // Dark Grey
    "#b30000",  // Dark Red
    "#062229",  // Brand Dark
    "#91c7b0",  // Brand Green
  ]
}

class ChartManager {
  static bar_getDatasetsFromData(data, chartProps) {
    let result = []

    let colorCat_pos = chartProps.colors[0]
    let colorCat_neg = ""
    let i_pos_next = 1
    let i_neg_next = 1
    let count_pos = 0
    let count_neg = 0

    if (chartProps.colors.length > 1)
      colorCat_neg = chartProps.colors[1]
    else
      colorCat_neg = colorCat_pos

    let i_pos = chartProps.isOrderByDesc ? 0 : colors[colorCat_pos].length - 1
    let i_neg = chartProps.isOrderByDesc ? colors[colorCat_neg].length - 1 : 0

    for (var obj of data)
      if (obj[chartProps.mField] >= 0)
        count_pos += 1
      else
        count_neg += 1

    i_pos_next = Math.round(colors[colorCat_pos].length / count_pos) - 1
    i_neg_next = Math.round(colors[colorCat_neg].length / count_neg) - 1

    if (data.length == 0)
      return result

    let ds = {
      backgroundColor: [],
      borderColor: [],
      data: []
    };

    for (var x = 0; x < data.length; x++) {
      let value = data[x][chartProps.mField]
      ds.data.push(value)

      if (value >= 0) {
        ds.backgroundColor.push(colors[colorCat_pos][i_pos])
        ds.borderColor.push(colors[colorCat_pos][i_pos])

        if (chartProps.isOrderByDesc)
          i_pos += i_pos_next
        else
          i_pos -= i_pos_next
      }
      else {
        ds.backgroundColor.push(colors[colorCat_neg][i_neg])
        ds.borderColor.push(colors[colorCat_neg][i_neg])

        if (chartProps.isOrderByDesc)
          i_neg -= i_neg_next
        else
          i_neg += i_neg_next
      }
    }
    result.push(ds)

    return result
  }
  static line_getDatasetsFromData(data, chartProps) {
    let datasets = {}
    let result = []

    if (data.length == 0)
      return result

    let dsFound = []
    let prevValue_xField = data[0][chartProps.xDimension]

    // 2D
    if (chartProps.yDimension) {
      for (var field of getDistinctValuesFromList(data, chartProps.yDimension))
        datasets[field] = {
          label: field,               // If chart is 2D, label datasets accordingly to the field
          backgroundColor: colors[chartProps.colors][Object.keys(datasets).length],
          borderColor: colors[chartProps.colors][Object.keys(datasets).length],
          pointRadius: 1,
          pointHoverRadius: 2,
          fill: false,
          borderWidth: 2,
          data: []
        }

      for (var obj of data) {
        if (obj[chartProps.xDimension] != prevValue_xField) {
          for (var ds of Object.values(datasets))
            if (!dsFound.includes(ds.label))
              ds.data.push(null)
          dsFound = []
        }

        datasets[obj[chartProps.yDimension]].data.push(obj[chartProps.mField])
        dsFound.push(obj[chartProps.yDimension])

        prevValue_xField = obj[chartProps.xDimension]
      }

      for (var ds of Object.values(datasets))
        result.push(ds)
    }

    // 1D
    else {
      result = [{
        label: chartProps.yTooltip,       // If chart is 1D, label datasets accordingly to the given parameter
        backgroundColor: colors[chartProps.colors][0],
        borderColor: colors[chartProps.colors][0],
        pointRadius: 1,
        pointHoverRadius: 2,
        fill: false,
        borderWidth: 3,
        data: []
      }]

      for (var obj of data)
        result[0].data.push(obj[chartProps.mField])
    }

    return result
  }
  static polar_getDatasetsFromData(data, chartProps) {
    let result = []

    if (data.length == 0)
      return result

    let ds = {
      backgroundColor: [],
      borderColor: [],
      data: []
    };

    for (var x = 0; x < data.length; x++) {
      ds.data.push(data[x][chartProps.mField])
      ds.backgroundColor.push(colors[chartProps.colors][x])
      ds.borderColor.push(colors[chartProps.colors][x])
    }
    result.push(ds)

    return result
  }

  static bar_resultRanking(rawData, aggrProps, chartProps) {
    let chart = { data: {}, options: {} }

    chartProps.mField = "tResult_percentage"
    let mFields = ["tResult_currency", "totalCost"]
    let aggrData = aggr(rawData, aggrProps, mFields)

    for (var obj of aggrData)
      obj[chartProps.mField] = percentage(obj.tResult_currency__sum, obj.totalCost__sum)

    if (chartProps.isOrderByDesc)
      aggrData = orderByDesc(aggrData, chartProps.mField, true)
    else
      aggrData = orderByAsc(aggrData, chartProps.mField, true)

    let x = 0
    while (aggrData.length > chartProps.firstXrows) {
      if (x >= chartProps.firstXrows)
        aggrData.pop()
      x += 1
    }

    let labels = getValueListFromObjList(aggrData, chartProps.xDimension)

    chart.data.labels = labels
    chart.data.datasets = this.bar_getDatasetsFromData(aggrData, chartProps)
    chart.options = this.getChartOptions("bar")

    return chart
  }

  static polar(aggrData, chart_dField, chart_mField, colorCategory) {
    let chart = { data: {}, options: {} }

    let labels = getValueListFromObjList(aggrData, chart_dField)
    let datasets = this.polar_getDatasetsFromData(aggrData, chart_mField, colorCategory)
    let options = this.getChartOptions("polar", "right")

    chart.data.labels = labels
    chart.data.datasets = datasets
    chart.options = options

    return chart
  }

  static polar_amountInvested(langId, rawData, aggrProps, chartProps) {
    let chart = { data: {}, options: {} }

    chartProps.mField = "amountInvested_percentage"
    let mFields = ["totalCost"]
    let aggrData = aggr(rawData, aggrProps, mFields)

    let amountInvested_total = 0
    for (var obj of aggrData)
      amountInvested_total += obj.totalCost__sum

    for (var obj of aggrData)
      obj[chartProps.mField] = percentage(obj.totalCost__sum, amountInvested_total)

    let labels = getValueListFromObjList(aggrData, chartProps.xDimension)
    labels = this.translateLabels(langId, labels, chartProps.xDimension)

    chart.data.labels = labels
    chart.data.datasets = this.polar_getDatasetsFromData(aggrData, chartProps)
    chart.options = this.getChartOptions("polar", "right")

    return chart
  }

  static line_result(langId, rawData, aggrProps, chartProps) {
    let chart = { data: {}, options: {} }
    let aggrData = []

    chartProps.mField = "tResult_percentage"
    let mFields = ["tResult_currency", "totalCost"]

    switch (aggrProps.type) {
      case "cumulative":
        aggrData = cumulativeAggr(rawData, aggrProps, mFields)
        break;
      default:
        aggrData = aggr(rawData, aggrProps, mFields)
        break;
    }

    for (var obj of aggrData)
      obj[chartProps.mField] = percentage(obj.tResult_currency__sum, obj.totalCost__sum)

    let labels = getDistinctValuesFromList(aggrData, chartProps.xDimension)
    labels = this.translateLabels(langId, labels, chartProps.xDimension)
    let datasets = this.line_getDatasetsFromData(aggrData, chartProps)
    let options = {}

    if (chartProps.yDimension)
      options = this.getChartOptions("line", "right")
    else
      options = this.getChartOptions("line", undefined)

    chart.data.labels = labels
    chart.data.datasets = datasets
    chart.options = options

    return chart
  }

  static getChartOptions(chartType, legPos) {
    let chartOptions = {}

    switch (chartType) {
      case "bar":
        chartOptions = {
          legend: {
            display: legPos ? true : false,
            position: legPos,
            labels: {
              boxWidth: 3
            }
          },
          tooltips: {
            tooltipFillColor: "rgba(0,0,0,0.5)",
            tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            tooltipFontSize: 14,
            tooltipFontStyle: "normal",
            tooltipFontColor: "#fff",
            tooltipTitleFontFamily:
              "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            tooltipTitleFontSize: 14,
            tooltipTitleFontStyle: "bold",
            tooltipTitleFontColor: "#fff",
            tooltipYPadding: 6,
            tooltipXPadding: 6,
            tooltipCaretSize: 8,
            tooltipCornerRadius: 6,
            tooltipXOffset: 10
          },
          scales: {
            xAxes: [{
              type: 'linear',
              position: 'bottom',
              ticks: {
                fontColor: "#9f9f9f"
              }
            }],

            yAxes: [{
              type: 'category',
              position: 'right',
              categoryPercentage: 0.8,
              barPercentage: 0.9,
              offset: true,
            }]
          },
        }
        break;
      case "line":
        chartOptions = {
          legend: {
            display: legPos ? true : false,
            position: legPos,
            labels: {
              boxWidth: 3
            }
          },
          tooltips: {
            tooltipFillColor: "rgba(0,0,0,0.5)",
            tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            tooltipFontSize: 14,
            tooltipFontStyle: "normal",
            tooltipFontColor: "#fff",
            tooltipTitleFontFamily:
              "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            tooltipTitleFontSize: 14,
            tooltipTitleFontStyle: "bold",
            tooltipTitleFontColor: "#fff",
            tooltipYPadding: 6,
            tooltipXPadding: 6,
            tooltipCaretSize: 8,
            tooltipCornerRadius: 6,
            tooltipXOffset: 10
          },
          scales: {
            yAxes: [
              {
                gridLines: {
                  drawBorder: false,
                  zeroLineColor: "rgba(180,180,180,0.5)",
                  color: "rgba(200,200,200,0.5)"
                },
                ticks: {
                  fontColor: "#9f9f9f",
                  beginAtZero: false
                }
              }
            ],

            xAxes: [
              {
                barPercentage: 1.6,
                gridLines: {
                  drawBorder: false,
                  color: "rgba(255,255,255,0.1)",
                  zeroLineColor: "transparent",
                  display: false
                },
                ticks: {
                  fontColor: "#9f9f9f"
                }
              }
            ]
          }
        }
        break;
      case "polar":
        chartOptions = {
          legend: {
            display: legPos ? true : false,
            position: legPos,
            labels: {
              boxWidth: 3
            }
          },
          tooltips: {
            tooltipFillColor: "rgba(0,0,0,0.5)",
            tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            tooltipFontSize: 14,
            tooltipFontStyle: "normal",
            tooltipFontColor: "#fff",
            tooltipTitleFontFamily:
              "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            tooltipTitleFontSize: 14,
            tooltipTitleFontStyle: "bold",
            tooltipTitleFontColor: "#fff",
            tooltipYPadding: 6,
            tooltipXPadding: 6,
            tooltipCaretSize: 8,
            tooltipCornerRadius: 6,
            tooltipXOffset: 10
          },
        }
        break;
      default:
        break;
    }

    return chartOptions
  }

  // Translations
  static translateLabels(langId, labels_ori, chartField) {
    let labels = deepCloneObj(labels_ori)

    switch (chartField) {
      case "country_code":
        let country_code = ""
        for (var x = 0; x < labels.length; x++) {
          country_code = String(labels[x]).toLowerCase()
          labels[x] = String(getString(langId, "countries", country_code))
        }
        break;
      case "date":
        for (var x = 0; x < labels.length; x++) {
          let strDate = labels[x].split('-')
          let year = strDate[0]
          let month = strDate[1]
          let date = strDate[2]

          if (x == 0)
            labels[x] = String(year + "-" + getString(langId, "monthShort", month) + "-" + date)
          else
            labels[x] = String(getString(langId, "monthShort", month) + "-" + date)
        }
        break;
      case "month":
        for (var x = 0; x < labels.length; x++) {
          let yearMonth = labels[x].split('-')
          let year = yearMonth[0]
          let month = yearMonth[1]

          labels[x] = String(year + "-" + getString(langId, "monthShort", month))
        }
        break;
      default:
        break;
    }

    return labels
  }
}

export default ChartManager;