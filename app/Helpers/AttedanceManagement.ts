import WebOption from "App/Models/WebOption"
import { DateTime, DurationObject } from "luxon"
import DataAttendence from "App/Models/DataAttendence"

interface DefaultAttedanceHistory {
    date: string | DateTime
    info: string | null
    duration: string
    wasIn: boolean
    wasOut: boolean
    dateIn: string
    dateOut: string
}

interface IUserDataStatus {
    found: boolean
    wasIn: boolean
    wasOut: boolean
    dateIn: DateTime | null
    dateOut: DateTime | null

    dateInEarly: boolean
    dateInLate: boolean
    dateOutEarly: boolean
    dateOutLate: boolean

    dateInEarlyText: string | null
    dateInLateText: string | null
    dateOutEarlyText: string | null
    dateOutLateText: string | null
}

interface IUserCheck {
    available: boolean
    isEarly: boolean
    isLate: boolean
    onNow: string | DateTime | null
    infoMin: string | DateTime | null
    infoMax: string | DateTime | null
}

export default class AttedanceManagement {

    private attadanceIn = {
        minH: 8,
        minM: 0,
        maxH: 9,
        maxM: 0
    }
    private attadanceOut = {
        minH: 16,
        minM: 0,
        maxH: 18,
        maxM: 0
    }
    private attadanceDay = {
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
        6: false,
        7: false
    }
    private defaultHistoryDays = 14

    // constructor() { }

    async getAttadanceConfig() {
        let getWebOptions: WebOption[] = []
        try {
            getWebOptions = await WebOption.query().whereIn('optionName', ['attedance-in', 'attedance-out', 'attedance-days'])
        } catch (error) {
            console.log('AttedanceManagement:getAttadanceConfig:WebOption', error)
        }
        if (getWebOptions.length > 0) {
            getWebOptions.forEach(item => {
                if (item.optionName.toString() === 'attedance-in') {
                    this.attadanceIn = JSON.parse(item.optionValue)
                }
                if (item.optionName.toString() === 'attedance-out') {
                    this.attadanceOut = JSON.parse(item.optionValue)
                }
                if (item.optionName.toString() === 'attedance-days') {
                    this.attadanceDay = JSON.parse(item.optionValue)
                }
            })
        }

        return this
    }

    checkIfTodayAvailable() {
        const getThisDay = DateTime.local().toFormat('E')

        return this.attadanceDay[getThisDay] ? this.attadanceDay[getThisDay] : false
    }

    checkIfAvailable() {
        const getThisDay = this.checkIfTodayAvailable()

        let enableAttadance = false
        if (getThisDay) {
            const getNow = DateTime.local()
            const getMinimum = DateTime.fromObject({hour: this.attadanceIn.minH, minute: this.attadanceIn.minM})
            const getMaximum = DateTime.fromObject({hour: this.attadanceOut.maxH, minute: this.attadanceOut.maxM})
        
            if (getNow > getMinimum && getNow < getMaximum) {
                enableAttadance = true
            }
        }

        return enableAttadance
    }

    checkValidateIn() {
        const getThisDay = this.checkIfTodayAvailable()

        let enableAttadance: IUserCheck = {
            available: false,
            isEarly: false,
            isLate: false,
            onNow: null,
            infoMax: null,
            infoMin: null
        }
        if (getThisDay) {
            enableAttadance.available = true

            const getNow = DateTime.local()
            const getMinimum = DateTime.fromObject({hour: this.attadanceIn.minH, minute: this.attadanceIn.minM})
            const getMaximum = DateTime.fromObject({hour: this.attadanceIn.maxH, minute: this.attadanceIn.maxM})

            enableAttadance.onNow = getNow
            enableAttadance.infoMin = getMinimum
            enableAttadance.infoMax = getMaximum

            if (getNow < getMinimum) {
                enableAttadance.isEarly = true
            }

            if (getNow > getMaximum) {
                enableAttadance.isLate = true
            }
        }

        return enableAttadance
    }

    checkValidateOut() {
        const getThisDay = this.checkIfTodayAvailable()

        let enableAttadance: IUserCheck = {
            available: false,
            isEarly: false,
            isLate: false,
            onNow: null,
            infoMax: null,
            infoMin: null
        }
        if (getThisDay) {
            enableAttadance.available = true

            const getNow = DateTime.local()
            const getMinimum = DateTime.fromObject({hour: this.attadanceOut.minH, minute: this.attadanceOut.minM})
            const getMaximum = DateTime.fromObject({hour: this.attadanceOut.maxH, minute: this.attadanceOut.maxM})

            enableAttadance.onNow = getNow
            enableAttadance.infoMin = getMinimum
            enableAttadance.infoMax = getMaximum

            if (getNow < getMinimum) {
                enableAttadance.isEarly = true
            }

            if (getNow > getMaximum) {
                enableAttadance.isLate = true
            }
        }

        return enableAttadance
    }

    convertDateObjectToString(dateObject: DurationObject) {
        let currentDate = ''
        let step = 0
        if (dateObject.hours && dateObject.hours > 0) {
            currentDate += `${dateObject.hours} ${dateObject.hours > 1 ? 'hours':'hour'}`
            step = 1
        }
        if (dateObject.minutes && dateObject.minutes > 0) {
            currentDate += `${step === 1 ? ' ':''}${dateObject.minutes} ${dateObject.minutes > 1 ? 'minutes':'minute'}`
            step = 2
        }
        if (dateObject.seconds && dateObject.seconds > 0) {
            currentDate += `${step === 2 || step === 1 ? ' ':''}${dateObject.seconds} ${dateObject.seconds > 1 ? 'seconds':'second'}`
        }
        return currentDate
    }

    async checkUserToday(userId: number) {
        let dataStatus: IUserDataStatus = {
            found: false,
            wasIn: false,
            wasOut: false,
            dateIn: null,
            dateOut: null,

            dateInEarly: false,
            dateInLate: false,
            dateOutEarly: false,
            dateOutLate: false,

            dateInEarlyText: null,
            dateInLateText: null,
            dateOutEarlyText: null,
            dateOutLateText: null
        }
        const getStartDay = DateTime.fromObject({hour: 0, minute: 0, second: 0})
        const getLastDay = DateTime.fromObject({hour: 23, minute: 59, second: 59})

        let getAttend: DataAttendence[] = []
        try {
            getAttend = await DataAttendence.query().where('userId', userId).whereBetween('createdAt', [getStartDay.toString(), getLastDay.toString()])
        } catch (error) {
            console.log('AttedanceManagement:checkUserToday:DataAttendence', error)
        }

        if (getAttend.length === 0) {
            return dataStatus
        }

        const getMinIn = DateTime.fromObject({hour: this.attadanceIn.minH, minute: this.attadanceIn.minM})
        const getMaxIn = DateTime.fromObject({hour: this.attadanceIn.maxH, minute: this.attadanceIn.maxM})
        const getMinOut = DateTime.fromObject({hour: this.attadanceOut.minH, minute: this.attadanceOut.minM})
        const getMaxOut = DateTime.fromObject({hour: this.attadanceOut.maxH, minute: this.attadanceOut.maxM})

        dataStatus.found = true
        getAttend.forEach(item => {
            if (item.attendType === 1) {
                dataStatus.wasIn = true
                dataStatus.dateIn = item.createdAt

                if (item.createdAt < getMinIn) {
                    dataStatus.dateInEarly = true
                    dataStatus.dateInEarlyText = this.convertDateObjectToString(getMinIn.diff(item.createdAt, ['hours', 'minutes', 'seconds']).toObject())
                }
                if (item.createdAt > getMaxIn) {
                    dataStatus.dateInLate = true
                    dataStatus.dateInLateText = this.convertDateObjectToString(item.createdAt.diff(getMaxIn, ['hours', 'minutes', 'seconds']).toObject())
                }
            }
            if (item.attendType === 2) {
                dataStatus.wasOut = true
                dataStatus.dateOut = item.createdAt

                if (item.createdAt < getMinOut) {
                    dataStatus.dateOutEarly = true
                    dataStatus.dateOutEarlyText = this.convertDateObjectToString(getMinOut.diff(item.createdAt, ['hours', 'minutes', 'seconds']).toObject())
                }
                if (item.createdAt > getMaxOut) {
                    dataStatus.dateOutLate = true
                    dataStatus.dateOutLateText = this.convertDateObjectToString(item.createdAt.diff(getMaxOut, ['hours', 'minutes', 'seconds']).toObject())
                }
            }
        })

        return dataStatus
    }

    async attedanceInUser(userId: number, storageId: number) {
        try {
            await DataAttendence.create({
                attendType: 1,
                userId,
                storageId
            })
        } catch (error) {
            console.log('AttedanceManagement:attedanceInUser:DataAttendence', error)
            return false
        }

        return true
    }

    async attedanceOutUser(userId: number) {
        try {
            await DataAttendence.create({
                attendType: 2,
                userId
            })
        } catch (error) {
            console.log('AttedanceManagement:attedanceOutUser:DataAttendence', error)
            return false
        }

        return true
    }

    async attedanceList(userId: number, days: number = this.defaultHistoryDays) {
        const getNow = DateTime.local()
        return await DataAttendence.query().where('userId', userId).whereBetween('createdAt', [getNow.minus({days}).toString(), getNow.toString()])
    }

    async attedanceListTable(attedances: DataAttendence[]) {
        let attedanceList: DefaultAttedanceHistory[] = []
        for (const attedance of attedances) {
            if (attedance.attendType === 1) {
                const getDataOut = this.findDataOutIndexByCreatedAt(attedances, attedance.createdAt.toISODate())
                let dataTemp: DefaultAttedanceHistory = {
                    date: attedance.createdAt.toISODate(),
                    duration: '',
                    info: null,
                    wasIn: true,
                    wasOut: false,
                    dateIn: attedance.createdAt.toString(),
                    dateOut: ''
                }
                if (getDataOut) {
                    const getDiff = getDataOut.createdAt.diff(attedance.createdAt, ['hours', 'minutes', 'seconds']).toObject()
                    dataTemp.duration = this.convertDateObjectToString(getDiff)
                    dataTemp.wasOut = true
                    dataTemp.dateOut = getDataOut.createdAt.toString()
                    dataTemp.duration = this.convertDateObjectToString(getDiff)
                } else {
                    dataTemp.duration = '-'
                    dataTemp.info = 'Not yet attedanded out'
                }
                attedanceList.push(dataTemp)
            }
        }
        return attedanceList
    }

    findDataOutIndexByCreatedAt(attedances: DataAttendence[], findWhat: string = '') {
        for (const attedance of attedances) {
            if (attedance.attendType === 2) {
                if (attedance.createdAt.toISODate() === findWhat) {
                    return attedance
                }
            }
        }
        return undefined
    }
}
