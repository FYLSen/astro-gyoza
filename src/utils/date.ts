// 获取两个日期的相对时间
export function getRelativeTime(startDate: Date, endDate = new Date()) {
  const diffSeconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
  if (diffSeconds < 0) {
    return null
  }
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 10) {
    return '刚刚'
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`
  }
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} 小时前`
  }
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 10) {
    return `${diffDays} 天前`
  }
  return null
}

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
}

export function calculateTimeDifference(current: Date, target: Date): TimeDifference {
  let years = current.getFullYear() - target.getFullYear()
  let months = current.getMonth() - target.getMonth()
  let days = current.getDate() - target.getDate()
  let hours = current.getHours() - target.getHours()
  let minutes = current.getMinutes() - target.getMinutes()

  if (minutes < 0) {
    hours--
    minutes += 60
  }
  if (hours < 0) {
    days--
    hours += 24
  }
  if (days < 0) {
    months--
    const lastMonth = new Date(current.getFullYear(), current.getMonth(), 0)
    days += lastMonth.getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }

  return { years, months, days, hours, minutes }
}

/**
 * 获取格式化的时间单位文本
 * @param diff 时间差对象
 * @returns 格式化后的文本，如："1年2月3天4小时5分钟"
 */
export function formatTimeDifferenceText(diff: TimeDifference): string {
  const parts: string[] = []

  if (diff.years > 0) {
    parts.push(`${diff.years}年`)
    parts.push(`${diff.months}月`)
    parts.push(`${diff.days}天`)
  } else if (diff.months > 0) {
    parts.push(`${diff.months}月`)
    parts.push(`${diff.days}天`)
  } else if (diff.days > 0) {
    parts.push(`${diff.days}天`)
  }
  parts.push(`${diff.hours}小时`)
  parts.push(`${diff.minutes}分钟`)

  return parts.join('')
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
