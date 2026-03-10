import { useLayoutEffect, useState } from 'react'
import { footer } from '@/config.json'
import { getDiffInDays } from '@/utils/date'
import SunCalc from 'suncalc'

/**
 * 天文学时间状态判断依据:
 * - 子夜 (MIDNIGHT): 从 00:00 开始
 * - 深夜 (DEEP_NIGHT): 从 00:30 或太阳最低点(取较晚的时间)开始
 * - 遥夕 (NIGHT): 从曙光前2小时开始，若无数据则从04:00开始
 * - 拂晓 (ASTRONOMICAL_DAWN): 从天文学黎明(nightEnd)开始
 * - 曙光 (NAUTICAL_DAWN): 从航海黎明开始
 * - 破晓 (CIVIL_DAWN): 从民用黎明(dawn)开始
 * - 日出 (SUNRISE): 从日出时刻开始
 * - 晨间黄金时刻 (MORNING_GOLDEN_HOUR): 从日出结束时刻开始
 * - 晨光 (MORNING): 从晨间黄金时刻结束开始
 * - 晴曛 (DAYTIME): 从太阳正午前2小时开始
 * - 中天 (NOON): 从太阳正午时刻开始
 * - 晏昼 (AFTERNOON): 从太阳正午后1小时开始
 * - 傍晚黄金时刻 (EVENING_GOLDEN_HOUR): 从傍晚黄金时刻开始
 * - 傍晚 (EVENING): 从日落开始前开始
 * - 日落 (SUNSET): 从日落时刻开始
 * - 黄昏 (CIVIL_DUSK): 从民用黄昏开始
 * - 薄暮 (NAUTICAL_DUSK): 从航海黄昏开始
 * - 暮光 (ASTRONOMICAL_DUSK): 从航海黄昏和天文学黄昏的中间点开始
 * - 夜幕 (NIGHT_BEGIN): 从天文学黄昏开始
 * - 遥夕 (NIGHT): 从22:00或天文学黄昏(取较晚的时间)开始
 */

// 定义天文学时间状态名称
const TIME_STATE_NAMES = {
    MIDNIGHT: '子夜',
    DEEP_NIGHT: '深夜',
    NIGHT: '遥夕',
    ASTRONOMICAL_DAWN: '拂晓',
    NAUTICAL_DAWN: '曙光',
    CIVIL_DAWN: '破晓',
    SUNRISE: '日出',
    MORNING_GOLDEN_HOUR: '晨间黄金时刻',
    MORNING: '晨光',
    DAYTIME: '晴曛',
    NOON: '中天',
    AFTERNOON: '晏昼',
    EVENING: '傍晚',
    EVENING_GOLDEN_HOUR: '傍晚黄金时刻',
    SUNSET: '日落',
    CIVIL_DUSK: '黄昏',
    NAUTICAL_DUSK: '薄暮',
    ASTRONOMICAL_DUSK: '暮光',
    NIGHT_BEGIN: '夜幕',
}

// 定义天文学时间状态类型
type AstronomicalTimeState = (typeof TIME_STATE_NAMES)[keyof typeof TIME_STATE_NAMES]

// 定义时间阶段接口
interface TimeStage {
    name: AstronomicalTimeState
    startTime: Date
}

export function RunningDays(): React.JSX.Element {
    const DEFAULT_TIME_STATE: AstronomicalTimeState = TIME_STATE_NAMES.MIDNIGHT
    const [days, setDays] = useState<number>(0)
    const [timeState, setTimeState] = useState<AstronomicalTimeState>(DEFAULT_TIME_STATE)

    useLayoutEffect(() => {
        // 计算网站运行天数
        const diffDays = getDiffInDays(new Date(footer.startTime))
        setDays(diffDays)

        // 1. 将访问者时间转换为网站运营者所在时区的时间
        const localNow = new Date()
        const siteNow = convertToSiteTimezone(localNow, footer.startTime)

        // 2. 获取网站配置的经纬度
        const { latitude, longitude } = getSiteLocation()

        // 3. 计算当日所有时段的开始时间
        const timeStages = calculateTimeStages(siteNow, latitude, longitude)

        // 4. 确定当前所在的时间状态
        const currentState = determineCurrentTimeState(siteNow, timeStages)
        setTimeState(currentState)
    }, [])

    if (days < 0) {
        return <span>Ops! 网站还没有发布</span>
    }

    return (
        <span className="inline-flex items-center whitespace-nowrap">
            {days} 次{timeState}
        </span>
    )
}

// 将本地时间转换为网站时区时间
function convertToSiteTimezone(localTime: Date, siteTimeStr: string): Date {
    // 默认使用UTC
    let timezoneOffset = '+00:00'

    // 从 startTime 中提取时区信息
    try {
        if (siteTimeStr.match(/[+-]\d{2}:\d{2}$/)) {
            timezoneOffset = siteTimeStr.slice(-6) // 例如 "+08:00"
        } else if (siteTimeStr.match(/Z$/)) {
            timezoneOffset = '+00:00' // UTC时间
        }
    } catch (error) {
        console.warn('无法从startTime中提取时区信息，使用默认UTC时区', error)
    }

    // 解析时区偏移（分钟）
    let totalOffsetMinutes = 0
    try {
        const hours = parseInt(timezoneOffset.slice(1, 3))
        const minutes = parseInt(timezoneOffset.slice(4, 6))
        const sign = timezoneOffset[0] === '+' ? 1 : -1
        totalOffsetMinutes = sign * (hours * 60 + minutes)
    } catch (error) {
        console.warn('解析时区偏移失败，使用默认UTC时区', error)
    }

    // 计算本地时区与网站时区的差异（分钟）
    const localOffsetMinutes = localTime.getTimezoneOffset() * -1
    const diffMinutes = totalOffsetMinutes - localOffsetMinutes

    // 转换时间
    return new Date(localTime.getTime() + diffMinutes * 60 * 1000)
}

// 获取网站配置的经纬度
function getSiteLocation() {
    const DEFAULT_LATITUDE = 0.0
    const DEFAULT_LONGITUDE = 0.0

    const latitude =
        typeof footer.latitude === 'number'
            ? footer.latitude
            : typeof footer.latitude === 'string'
                ? parseFloat(footer.latitude)
                : DEFAULT_LATITUDE

    const longitude =
        typeof footer.longitude === 'number'
            ? footer.longitude
            : typeof footer.longitude === 'string'
                ? parseFloat(footer.longitude)
                : DEFAULT_LONGITUDE

    return { latitude, longitude }
}

// 计算当日所有时段的开始时间
function calculateTimeStages(siteNow: Date, latitude: number, longitude: number): TimeStage[] {
    try {
        // 设置一天的起始点（0点整）
        const midnight = new Date(siteNow)
        midnight.setHours(0, 0, 0, 0)

        // 使用SunCalc计算各个天文学时间点
        const times = SunCalc.getTimes(siteNow, latitude, longitude)

        // 创建时间阶段数组
        const timeStages: TimeStage[] = [
            // 固定时间的阶段
            {
                name: TIME_STATE_NAMES.MIDNIGHT,
                startTime: new Date(midnight.getTime()),
            },
        ]

        const solarMidnight = new Date(times.nadir)

        // DEEP_NIGHT - 使用太阳最低点时间与00:30比较较晚的一个
        const deepNightTime = new Date(midnight.getTime() + 30 * 60 * 1000) // 00:30
        timeStages.push({
            name: TIME_STATE_NAMES.DEEP_NIGHT,
            startTime: new Date(Math.max(solarMidnight.getTime(), deepNightTime.getTime())),
        })

        // NIGHT - 使用曙光前2小时的定义
        if (times.nauticalDawn instanceof Date && !isNaN(times.nauticalDawn.getTime())) {
            const nightTime = new Date(times.nauticalDawn.getTime() - 2 * 60 * 60 * 1000)
            timeStages.push({
                name: TIME_STATE_NAMES.NIGHT,
                startTime: nightTime,
            })
        } else {
            // 如果没有天文学数据，使用固定时间4:00
            timeStages.push({
                name: TIME_STATE_NAMES.NIGHT,
                startTime: new Date(midnight.getTime() + 4 * 60 * 60 * 1000), // 04:00
            })
        }

        // 添加基于太阳位置的时间阶段
        if (times.nightEnd instanceof Date && !isNaN(times.nightEnd.getTime())) {
            timeStages.push({
                name: TIME_STATE_NAMES.ASTRONOMICAL_DAWN,
                startTime: times.nightEnd,
            })
        }

        if (times.nauticalDawn instanceof Date && !isNaN(times.nauticalDawn.getTime())) {
            timeStages.push({
                name: TIME_STATE_NAMES.NAUTICAL_DAWN,
                startTime: times.nauticalDawn,
            })
        }

        if (times.dawn instanceof Date && !isNaN(times.dawn.getTime())) {
            timeStages.push({
                name: TIME_STATE_NAMES.CIVIL_DAWN,
                startTime: times.dawn,
            })
        }

        if (times.sunrise instanceof Date && !isNaN(times.sunrise.getTime())) {
            timeStages.push({
                name: TIME_STATE_NAMES.SUNRISE,
                startTime: times.sunrise,
            })
        }

        if (times.sunriseEnd instanceof Date && !isNaN(times.sunriseEnd.getTime())) {
            timeStages.push({
                name: TIME_STATE_NAMES.MORNING_GOLDEN_HOUR,
                startTime: times.sunriseEnd,
            })
        }

        if (times.goldenHourEnd instanceof Date && !isNaN(times.goldenHourEnd.getTime())) {
            timeStages.push({
                name: TIME_STATE_NAMES.MORNING,
                startTime: times.goldenHourEnd,
            })
        }

        if (times.solarNoon instanceof Date && !isNaN(times.solarNoon.getTime())) {
            timeStages.push({
                name: TIME_STATE_NAMES.DAYTIME,
                startTime: new Date(times.solarNoon.getTime() - 2 * 60 * 60 * 1000),
            })

            timeStages.push({
                name: TIME_STATE_NAMES.NOON,
                startTime: times.solarNoon,
            })

            timeStages.push({
                name: TIME_STATE_NAMES.AFTERNOON,
                startTime: new Date(times.solarNoon.getTime() + 1 * 60 * 60 * 1000),
            })
        }

        if (times.goldenHour instanceof Date && !isNaN(times.goldenHour.getTime())) {
            timeStages.push({
                name: TIME_STATE_NAMES.EVENING_GOLDEN_HOUR,
                startTime: times.goldenHour,
            })
        }

        if (times.sunsetStart instanceof Date && !isNaN(times.sunsetStart.getTime())) {
            timeStages.push({
                name: TIME_STATE_NAMES.EVENING,
                startTime: times.sunsetStart,
            })
        }

        if (times.sunset instanceof Date && !isNaN(times.sunset.getTime())) {
            timeStages.push({
                name: TIME_STATE_NAMES.SUNSET,
                startTime: times.sunset,
            })
        }

        if (times.dusk instanceof Date && !isNaN(times.dusk.getTime())) {
            timeStages.push({
                name: TIME_STATE_NAMES.CIVIL_DUSK,
                startTime: times.dusk,
            })
        }

        if (times.nauticalDusk instanceof Date && !isNaN(times.nauticalDusk.getTime())) {
            timeStages.push({
                name: TIME_STATE_NAMES.NAUTICAL_DUSK,
                startTime: times.nauticalDusk,
            })
        }

        if (times.night instanceof Date && !isNaN(times.night.getTime())) {
            if (times.nauticalDusk instanceof Date && !isNaN(times.nauticalDusk.getTime())) {
                timeStages.push({
                    name: TIME_STATE_NAMES.ASTRONOMICAL_DUSK,
                    startTime: new Date(
                        times.nauticalDusk.getTime() +
                        (times.night.getTime() - times.nauticalDusk.getTime()) / 2,
                    ),
                })
            }

            timeStages.push({
                name: TIME_STATE_NAMES.NIGHT_BEGIN,
                startTime: times.night,
            })
        }

        // 添加最后的黑夜时段，使用天文学夜晚和22:00做比较
        timeStages.push({
            name: TIME_STATE_NAMES.NIGHT,
            startTime: new Date(
                Math.max(
                    times.night ? times.night.getTime() : 0,
                    midnight.getTime() + 22 * 60 * 60 * 1000, // 22:00
                ),
            ),
        })

        // 过滤无效的时间阶段并按开始时间排序
        return timeStages
            .filter((stage) => stage.startTime instanceof Date && !isNaN(stage.startTime.getTime()))
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    } catch (error) {
        console.error('计算天文学时间状态出错:', error)
        return []
    }
}

// 确定当前所在的时间状态
function determineCurrentTimeState(siteNow: Date, timeStages: TimeStage[]): AstronomicalTimeState {
    if (timeStages.length === 0) {
        return TIME_STATE_NAMES.MIDNIGHT // 默认值
    }

    // 遍历所有时间阶段，找出最后一个开始时间早于当前时间的阶段
    let currentState = TIME_STATE_NAMES.MIDNIGHT

    for (let i = 0; i < timeStages.length; i++) {
        const currentStage = timeStages[i]
        const nextStage = i < timeStages.length - 1 ? timeStages[i + 1] : null

        // 确定结束时间（下一阶段的开始时间或下一天的同一阶段开始时间）
        const endTime = nextStage
            ? nextStage.startTime
            : new Date(currentStage.startTime.getTime() + 24 * 60 * 60 * 1000)

        // 检查当前时间是否在此阶段内
        if (siteNow >= currentStage.startTime && siteNow < endTime) {
            currentState = currentStage.name
            break // 找到了匹配的时间段，可以提前退出循环
        }
    }

    return currentState
}
