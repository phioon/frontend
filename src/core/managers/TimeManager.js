import Moment from "moment-timezone";

class TimeManager {
  constructor() {
  }

  static getWeekday(timestamp) {
    if (timestamp)
      return new Date(timestamp).getDay()
    return new Date().getDay()
  }
  static tzGetWeekday(tz, timestamp) {
    try {
      if (timestamp)
        timestamp = new Date(timestamp).toLocaleString("en-US", { timeZone: tz })
      else
        timestamp = new Date().toLocaleString("en-US", { timeZone: tz })
    } catch {
      timestamp = new Date().toISOString()
    }

    return new Date(timestamp).getDay()
  }

  static getYearMonthString(timestamp) {
    if (timestamp)
      return Moment(timestamp).format("YYYY-MM")
    return Moment(new Date()).format("YYYY-MM")
  }
  static getYearString(timestamp) {
    if (timestamp)
      return Moment(timestamp).format("YYYY")
    return Moment(new Date()).format("YYYY")
  }
  static getMonthString(timestamp) {
    if (timestamp)
      return Moment(timestamp).format("MM")
    return Moment(new Date()).format("MM")
  }
  static getDateString(timestamp) {
    if (timestamp)
      return Moment(timestamp).format("YYYY-MM-DD")
    return Moment(new Date()).format("YYYY-MM-DD")
  }
  static getDaytring(timestamp) {
    if (timestamp)
      return Moment(timestamp).format("DD")
    return Moment(new Date()).format("DD")
  }
  static getDatetimeString(timestamp, keepLocaltime = true, format = "YYYY-MM-DD HH:mm:ss") {
    if (timestamp)
      return Moment(timestamp).utc(keepLocaltime).format(format)
    return Moment(new Date()).utc(keepLocaltime).format(format)
  }

  static getLocaleDateString(timestamp, keepLocaltime = true) {
    if (timestamp) {
      // Removes 'Z' character, which indicates UTC timezone.
      timestamp = String(timestamp).replace("Z", "")
      return Moment(timestamp).utc(keepLocaltime).toDate().toLocaleDateString()
    }
    return Moment(new Date()).utc(keepLocaltime).toDate().toLocaleDateString()
  }
  static getLocaleString(timestamp, keepLocaltime = false) {
    if (timestamp)
      return Moment(timestamp).utc(keepLocaltime).toDate().toLocaleString()

    return Moment(new Date()).utc(keepLocaltime).toDate().toLocaleString()
  }

  static getMoment(timestamp, keepLocaltime = true) {
    if (timestamp)
      return Moment(timestamp).utc(keepLocaltime)
    return Moment(new Date()).utc(keepLocaltime)
  }
  static getTzMoment(timestamp, tz) {
    if (timestamp)
      return Moment.tz(timestamp, tz)
    return Moment.tz(new Date(), tz)
  }

  static getUTCDatetime(timestamp) {
    if (timestamp)
      return new Date(timestamp).toISOString().replace(/\..+/, '')
    return new Date().toISOString().replace(/\..+/, '')
  }

  static getCalendarTime(moment, now) {
    if (!now)
      now = Moment(new Date())

    let diff = moment.diff(now, "hours", true)

    console.log(`diff: ${diff}`)

    let lastMidnight = String(TimeManager.getDateString() + " 00:00:00")
    lastMidnight = Moment(moment)

    // console.log(`lastMidnight: ${lastMidnight}`)

    // console.log(`getLocaleString: ${TimeManager.getLocaleString(moment)}`)
    // console.log(`duration: ${duration_nowBefore.asHours()}`)

    return "Working on it"
  }

  static timestampDiff(t1, t2) {
    t1 = Date.parse(new Date(t1))
    if (t2)
      t2 = Date.parse(new Date(t2))
    else
      t2 = Date.parse(new Date().toISOString())

    return (t1 - t2) / 1000 / 60
  }
  static timestampDelta(t1, t2) {
    t1 = Date.parse(new Date(t1))
    if (t2)
      t2 = Date.parse(new Date(t2))
    else
      t2 = Date.parse(new Date().toISOString())

    return Math.abs(t1 - t2) / 1000 / 60
  }
  static timeDiff(t1, t2) {
    t1 = Date.parse(new Date("2001-01-01T" + t1))
    if (t2)
      t2 = Date.parse(new Date("2001-01-01T" + t2))
    else
      t2 = Date.parse(new Date("2001-01-01T00:00:00"))

    return (t1 - t2) / 1000 / 60
  }
  static tzConvert(tzTo, timestamp, isUTC = false, keepLocalTime = false) {
    if (timestamp)
      var utcTime = Moment(timestamp).utc(isUTC)
    else
      var utcTime = Moment(new Date())
    var converted = utcTime.tz(tzTo, keepLocalTime)

    return converted
  }
}

export default TimeManager;