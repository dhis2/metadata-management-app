import i18n from '@dhis2/d2-i18n'
import { CalendarInput, CalendarInputProps } from '@dhis2/ui'
import React, { useState } from 'react'
import { useField } from 'react-final-form'
import { selectedLocale, useSystemSetting } from '../../../lib'

type DateFieldProps = Omit<
    CalendarInputProps,
    'name' | 'calendar' | 'onDateSelect' | 'date'
> & {
    name: string
    // this is not exposed in CalendarInputProps - but it should be
    label?: string
    required?: boolean
}
type ValidationProps = {
    error: boolean
    validationText?: string
    valid: boolean
    validationCode?: string
}
export function DateField({
    name,
    label,
    required,
    ...calendarInputProps
}: DateFieldProps) {
    const calendar = useSystemSetting('keyCalendar')
    const locale = selectedLocale
    const [validation, setValidation] = useState<ValidationProps>({
        error: false,
        valid: true,
    })

    const { input } = useField<string | undefined>(name, {
        format: (value) => (value ? value.substring(0, 10) : ''),
    })

    const handleChange: CalendarInputProps['onDateSelect'] = (
        payload: {
            calendarDateString: string
            validation?: ValidationProps
        } | null
    ) => {
        if (!payload?.calendarDateString && required) {
            setValidation({
                error: true,
                valid: false,
                validationCode: 'EMPTY',
                validationText: i18n.t('Required'),
            })
        } else {
            setValidation(payload?.validation || { error: false, valid: true })
        }
        input.onChange(payload?.calendarDateString || '')
        input.onBlur()
    }

    return (
        <div>
            <CalendarInput
                inputWidth={'400px'}
                date={input.value}
                name={name}
                required={required}
                calendar={calendar as CalendarInputProps['calendar']}
                onDateSelect={handleChange}
                timeZone={'utc'}
                locale={locale}
                format={'YYYY-MM-DD'}
                onBlur={(_, e) => input.onBlur(e)}
                clearable
                label={label}
                {...validation}
                valid={validation?.valid && input?.value !== ''}
                {...calendarInputProps}
            />
        </div>
    )
}
