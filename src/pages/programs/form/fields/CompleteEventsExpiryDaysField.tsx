import i18n from '@dhis2/d2-i18n'
import { Checkbox, InputFieldFF } from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { Field as FieldRFF, useField, useFormState } from 'react-final-form'
import setupClasses from '../common/SetupFormContents.module.css'

type CompleteEventsExpiryFormValues = {
    completeEventsExpiryDays?: unknown
}

function hasExpiryDays(value: unknown): boolean {
    if (value == null || value === '') {
        return false
    }
    const numericValue = Number(value)
    return !Number.isNaN(numericValue) && numericValue !== 0
}

export function CompleteEventsExpiryDaysField() {
    const { input } = useField('completeEventsExpiryDays')
    const { initialValues } = useFormState<CompleteEventsExpiryFormValues>({
        subscription: { initialValues: true },
    })
    const initialChecked = hasExpiryDays(
        initialValues?.completeEventsExpiryDays
    )
    const [checked, setChecked] = useState(initialChecked)

    useEffect(() => {
        setChecked(initialChecked)
    }, [initialChecked])

    const onToggle = (isChecked: boolean) => {
        setChecked(isChecked)
        if (isChecked && !hasExpiryDays(input.value)) {
            input.onChange(1)
        }
        if (!isChecked) {
            input.onChange(0)
        }
        input.onBlur()
    }

    return (
        <div className={setupClasses.setupCheckboxBlock}>
            <Checkbox
                label={i18n.t('Lock events a number of days after completion')}
                onChange={({ checked: isChecked }) => onToggle(isChecked)}
                checked={checked}
            />
            {checked && (
                <div className={setupClasses.expiryDaysRow}>
                    <FieldRFF
                        name="completeEventsExpiryDays"
                        component={InputFieldFF}
                        type="number"
                        min="1"
                        inputWidth="150px"
                        label={i18n.t('Number of days')}
                        dataTest="formfields-completeEventsExpiryDays"
                        format={(value: unknown) => value?.toString()}
                        parse={(value: unknown) => {
                            if (value == null) {
                                return null
                            }
                            if (value === '') {
                                return 0
                            }
                            return Number.parseInt(value as string, 10)
                        }}
                    />
                </div>
            )}
        </div>
    )
}
