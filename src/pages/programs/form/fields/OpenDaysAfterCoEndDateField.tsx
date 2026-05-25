import i18n from '@dhis2/d2-i18n'
import { Checkbox, InputFieldFF } from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { useField } from 'react-final-form'
import type { FieldMetaState } from 'react-final-form'
import setupClasses from '../common/SetupFormContents.module.css'
import { formatNumericInput, parseNumericInput } from './numericInputParsing'

function isEnabled(value: unknown): boolean {
    if (value == null || value === '') {
        return false
    }
    const numericValue = Number(value)
    return !Number.isNaN(numericValue) && numericValue !== 0
}

export function OpenDaysAfterCoEndDateField({
    categoryCombinationDisplayName,
}: Readonly<{
    categoryCombinationDisplayName: string
}>) {
    const { input, meta } = useField('openDaysAfterCoEndDate', {
        parse: parseNumericInput,
        format: formatNumericInput,
    })
    const [checked, setChecked] = useState(() => isEnabled(input.value))

    useEffect(() => {
        if (isEnabled(input.value)) {
            setChecked(true)
        }
    }, [input.value])

    const onToggle = (isChecked: boolean) => {
        setChecked(isChecked)
        input.onChange(isChecked ? 0 : undefined)
        input.onBlur()
    }

    return (
        <div className={setupClasses.setupCheckboxBlock}>
            <Checkbox
                label={i18n.t(
                    'Close data entry a number of days after end date of {{categoryCombinationDisplayName}}',
                    { categoryCombinationDisplayName }
                )}
                onChange={({ checked: isChecked }) => onToggle(isChecked)}
                checked={checked}
            />
            {checked && (
                <div className={setupClasses.expiryDaysRow}>
                    <InputFieldFF
                        input={input}
                        meta={meta as FieldMetaState<string | undefined>}
                        inputWidth="150px"
                        label={i18n.t('Number of days')}
                        dataTest="formfields-openDaysAfterCoEndDate"
                    />
                </div>
            )}
        </div>
    )
}
