import { Field } from '@dhis2/ui'
import React, { useCallback, useMemo } from 'react'
import { DateFieldFF, DateFieldProps } from './DateFieldFF'
import css from './DateTimeField.module.css'
import { TimeInput } from './TimeInput'

const DEFAULT_TIME = '12:00'

export const DateTimeFieldFF = ({
    input: originalInput,
    meta,
    label,
}: DateFieldProps) => {
    const [datePart, timePart] = (originalInput.value ?? '').split('T')

    const handleDateChange = useCallback(
        (calendarDateString: string) => {
            const newValue = calendarDateString
                ? `${calendarDateString}T${timePart ?? DEFAULT_TIME}`
                : timePart
                ? `T${timePart}`
                : ''
            originalInput.onChange(newValue)
            originalInput.onBlur()
        },
        [originalInput, timePart]
    )

    const handleTimeChange = useCallback(
        (newTime: string) => {
            const newValue = datePart
                ? `${datePart}T${newTime}`
                : newTime
                ? `T${newTime}`
                : ''
            originalInput.onChange(newValue)
            originalInput.onBlur()
        },
        [originalInput, datePart]
    )

    const dateInput = useMemo(
        () => ({
            ...originalInput,
            value: datePart,
            onChange: handleDateChange,
        }),
        [originalInput, datePart, handleDateChange]
    )

    const formError = meta?.touched ? meta?.error : undefined
    const timeError = datePart && !timePart ? formError : undefined
    const dateError = timeError ? undefined : formError

    return (
        <div className={css.wrapper}>
            <DateFieldFF
                className={css.dateField}
                inputWidth="100%"
                meta={{ ...meta, error: dateError }}
                input={dateInput}
                label={label}
                valid={false}
            />
            <Field
                className={css.timeInput}
                error={!!timeError}
                validationText={timeError}
            >
                <TimeInput
                    width="100%"
                    value={timePart || ''}
                    onChange={(payload) =>
                        handleTimeChange(payload.value ?? '')
                    }
                    onBlur={() => originalInput.onBlur()}
                    clearable
                    error={!!timeError}
                />
            </Field>
        </div>
    )
}
