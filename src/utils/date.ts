// 获取一个格式化的日期，格式为：2024 年 1 月 1 日 星期一
export function getFormattedDate(date: Date) {
  const year = date.getFullYear() % 100
  const month = date.getMonth() + 1
  const day = date.getDate()
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()]

  return `${year} 年 ${month} 月 ${day} 日 ${week}`
}

// 数字前补 0
function padZero(number: number, len = 2) {
  return number.toString().padStart(len, '0')
}

// 获取格式化后的日期时间，格式：2024 年 01 月 01 日 12:00
export function getFormattedDateTime(date: Date) {
  const year = date.getFullYear()
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())
  const hours = padZero(date.getHours())
  const minutes = padZero(date.getMinutes())

  return `${year} 年 ${month} 月 ${day} 日 ${hours}:${minutes}`
}

// 获取格式化后的日期时间，格式：2024 年 01 月 01 日
export function getFormattedShortDate(date: Date) {
  const year = date.getFullYear()
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())

  return `${year} 年 ${month} 月 ${day} 日`
}

// 获取两个日期的相差的天数
export function getDiffInDays(startDate: Date, endDate = new Date()) {
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 86400))
}

// 获取一个短的日期，格式为：04-20
export function getShortDate(date: Date) {
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())

  return `${month}-${day}`
}

// 获取日期所在的年一共多少天
export function getDaysInYear(date: Date) {
  const year = date.getFullYear()
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    return 366
  }
  return 365
}

// 获取日期所在的年的开始日期
export function getStartOfYear(date: Date) {
  const year = date.getFullYear()
  return new Date(year, 0, 1)
}

// 获取日期所在的天的开始日期
export function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * 计算两个日期之间的详细时间差
 * @param current 当前日期
 * @param target 目标日期
 * @returns 包含年、月、日、小时、分钟的时间差对象
 */
export interface TimeDifference {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function calculateTimeDifference(current: Date, target: Date): TimeDifference {
  // 确保 current 大于 target
  if (current < target) {
    ;[current, target] = [target, current]
  }

  // 转换为 UTC 时间
  const currentUTC = new Date(
    Date.UTC(
      current.getUTCFullYear(),
      current.getUTCMonth(),
      current.getUTCDate(),
      current.getUTCHours(),
      current.getUTCMinutes(),
      current.getUTCSeconds(),
    ),
  )

  const targetUTC = new Date(
    Date.UTC(
      target.getUTCFullYear(),
      target.getUTCMonth(),
      target.getUTCDate(),
      target.getUTCHours(),
      target.getUTCMinutes(),
      target.getUTCSeconds(),
    ),
  )

  // 计算初始年月差值
  let years = currentUTC.getUTCFullYear() - targetUTC.getUTCFullYear()
  let months = currentUTC.getUTCMonth() - targetUTC.getUTCMonth()

  // 处理月份溢出
  let tempYear = targetUTC.getUTCFullYear() + years
  let tempMonth = targetUTC.getUTCMonth() + months

  if (tempMonth < 0) {
    tempYear--
    tempMonth += 12
  } else if (tempMonth > 11) {
    tempYear++
    tempMonth -= 12
  }

  const tempDate = new Date(
    Date.UTC(
      tempYear,
      tempMonth,
      targetUTC.getUTCDate(),
      targetUTC.getUTCHours(),
      targetUTC.getUTCMinutes(),
      targetUTC.getUTCSeconds(),
    ),
  )

  if (tempDate > currentUTC) {
    if (months === 0) {
      years--
      months = 11
    } else {
      months--
    }
  }

  const monthEndDate = new Date(
    Date.UTC(
      targetUTC.getUTCFullYear() + years,
      targetUTC.getUTCMonth() + months,
      targetUTC.getUTCDate(),
      targetUTC.getUTCHours(),
      targetUTC.getUTCMinutes(),
      targetUTC.getUTCSeconds(),
    ),
  )

  // 计算时间差
  let timeDiff = currentUTC.getTime() - monthEndDate.getTime()
  let days = Math.floor(timeDiff / (24 * 60 * 60 * 1000))
  timeDiff -= days * 24 * 60 * 60 * 1000

  let hours = Math.floor(timeDiff / (60 * 60 * 1000))
  timeDiff -= hours * 60 * 60 * 1000

  let minutes = Math.floor(timeDiff / (60 * 1000))
  timeDiff -= minutes * 60 * 1000

  let seconds = Math.floor(timeDiff / 1000)

  minutes += Math.floor(seconds / 60)
  seconds %= 60

  hours += Math.floor(minutes / 60)
  minutes %= 60

  days += Math.floor(hours / 24)
  hours %= 24

  return { years, months, days, hours, minutes, seconds }
}

interface TimeUnits {
  year: string
  month: string
  day: string
  hour: string
  minute: string
  second: string
  separator: string
}

const enUnits: TimeUnits = {
  year: ' year',
  month: ' month',
  day: ' day',
  hour: ' hour',
  minute: ' minute',
  second: ' second',
  separator: ' ',
}

const zhUnits: TimeUnits = {
  year: '年',
  month: '个月',
  day: '天',
  hour: '小时',
  minute: '分钟',
  second: '秒',
  separator: '',
}

export function formatTimeDifference(diff: TimeDifference, lang: string = 'zh'): string {
  const units = lang === 'zh' ? zhUnits : enUnits
  const parts: string[] = []

  if (diff.years > 0) {
    const suffix = lang === 'en' && diff.years > 1 ? 's' : ''
    parts.push(`${diff.years}${units.year}${suffix}`)
  }
  if (diff.months > 0) {
    const suffix = lang === 'en' && diff.months > 1 ? 's' : ''
    parts.push(`${diff.months}${units.month}${suffix}`)
  }
  if (diff.days > 0) {
    const suffix = lang === 'en' && diff.days > 1 ? 's' : ''
    parts.push(`${diff.days}${units.day}${suffix}`)
  }
  if (diff.hours > 0) {
    const suffix = lang === 'en' && diff.hours > 1 ? 's' : ''
    parts.push(`${diff.hours}${units.hour}${suffix}`)
  }
  if (diff.minutes > 0) {
    const suffix = lang === 'en' && diff.minutes > 1 ? 's' : ''
    parts.push(`${diff.minutes}${units.minute}${suffix}`)
  }
  if (diff.seconds > 0) {
    const suffix = lang === 'en' && diff.seconds > 1 ? 's' : ''
    parts.push(`${diff.seconds}${units.second}${suffix}`)
  }

  return parts.join(units.separator)
}

/**
 * 获取日期的时间单位
 * @param date 日期对象
 * @returns 包含年、月、日、时、分、秒的对象
 */
export function getTimeUnits(date: Date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  }
}
