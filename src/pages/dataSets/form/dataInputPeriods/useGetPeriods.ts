import { useConfig } from '@dhis2/app-runtime'
import {
    getNowInCalendar,
    generateFixedPeriods,
    createFixedPeriodFromPeriodId,
} from '@dhis2/multi-calendar-dates'
import { useMemo } from 'react'
import { useField } from 'react-final-form'
import { DataInputPeriod } from '../../../../types/generated'
import { periodTypesMapping, SupportedCalendar } from './periodTypesMapping'

export type ExpandedDIP = DataInputPeriod & {
    periodInformation: {
        id: string
        displayName: string
    }
}

const useGetCurrentYear = (calendar: SupportedCalendar) => {
    const { systemInfo } = useConfig() || {}
    const serverTimeZoneId = systemInfo?.serverTimeZoneId ?? 'UTC'
    const temporalCalendar = getNowInCalendar(calendar, serverTimeZoneId)

    // extra logic for Ethopian calendar as we want the era year
    const year = ['ethiopian', 'ethiopic'].includes(calendar)
        ? temporalCalendar.eraYear
        : temporalCalendar.year
    return year
}

export const useGetPeriods = ({
    selectedYear,
    locale = 'en',
    calendar = 'gregory',
}: {
    selectedYear?: string
    locale?: string
    calendar?: SupportedCalendar
}) => {
    const { input } = useField('periodType')
    const selectedPeriodType = periodTypesMapping[input.value] ?? input.value
    const currentYear = useGetCurrentYear(calendar)
    const annual = Boolean(selectedPeriodType.match(/^(YEARLY|FY[A-Z]{3})/))
    const yearRange = currentYear
        ? Array.from({ length: 16 }, (_, i) => String(-11 + i + currentYear))
        : []
    const generateYear = selectedYear ?? currentYear
    const periods = !selectedPeriodType
        ? []
        : annual
        ? generateFixedPeriods({
              year: Number(currentYear) + 5,
              yearsCount: 16,
              periodType:
                  periodTypesMapping[selectedPeriodType] ?? selectedPeriodType,
              calendar,
              locale,
          }).reverse()
        : generateFixedPeriods({
              year: Number(generateYear),
              periodType:
                  periodTypesMapping[selectedPeriodType] ?? selectedPeriodType,
              calendar,
              locale,
          })
    return {
        annual,
        periods,
        yearRange,
    }
}

export const useGetPeriodInformation = (
    dips: DataInputPeriod[],
    calendar: SupportedCalendar,
    locale: string
) => {
    const sortedDipIDs = dips.map((dip) => dip.period!.id).sort()
    const stringifiedDipIDs = JSON.stringify(sortedDipIDs)

    // create a map with details for each period
    const periodInformationMap = useMemo(() => {
        const piMap = new Map()
        sortedDipIDs.forEach((id) => {
            const periodInformation = createFixedPeriodFromPeriodId({
                periodId: id,
                locale,
                calendar,
            })
            piMap.set(id, periodInformation)
        })
        return piMap
        // sortedDipIDs is not stable, so we use stringifiedDipIDs in useMemo dependencies
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stringifiedDipIDs, calendar, locale])

    // return data input period with additional period information and sort
    return dips
        .map((dip) => {
            const periodInformation = periodInformationMap.get(dip.period!.id)
            return { periodInformation, ...dip }
        })
        .sort((a, b) =>
            a.periodInformation.startDate.localeCompare(
                b.periodInformation.startDate
            )
        )
}
