import React, { useMemo } from 'react'
import { DateFieldFF, DateFieldProps } from './DateFieldFF'
import css from './DateTimeField.module.css'
import { TimeInput } from './TimeInput'

const defaultTime = '12:00'

export const DateTimeFieldFF = (props: DateFieldProps) => {
    const originalInput = props.input
    const [datePart, timePart] = (originalInput.value ?? '').split('T')

    const input = useMemo(() => {
        const handleChange = (calendarDateString: string, newTime?: string) => {
            if (!calendarDateString) {
                if (newTime) {
                    originalInput.onChange('T' + newTime)
                } else if (newTime === '') {
                    originalInput.onChange('')
                    originalInput.onBlur()
                } else {
                    originalInput.onChange(timePart ? `T${timePart}` : '')
                    originalInput.onBlur()
                }
                return
            }
            const resolvedTime = newTime ?? timePart ?? defaultTime
            const dateTime = `${calendarDateString}T${resolvedTime}`
            originalInput.onChange(dateTime)
            originalInput.onBlur()
        }
        return {
            ...originalInput,
            value: datePart,
            onChange: handleChange,
        }
    }, [timePart, originalInput, datePart])

    return (
        <div className={css.wrapper}>
            <DateFieldFF
                className={css.dateField}
                inputWidth="100%"
                meta={props.meta}
                input={input}
                label={props.label}
                valid={false}
            />
            <TimeInput
                className={css.timeInput}
                width="100%"
                value={timePart || ''}
                onChange={(payload) => {
                    input.onChange(datePart, payload.value)
                }}
                onBlur={() => input.onBlur()}
                clearable
            />
        </div>
    )
}
