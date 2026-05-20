import i18n from '@dhis2/d2-i18n'
import { Checkbox, InputFieldFF, SingleSelectFieldFF } from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import { Field as FieldRFF, useField } from 'react-final-form'
import type { FieldMetaState } from 'react-final-form'
import { Program } from '../../../../types/generated'
import setupClasses from '../common/SetupFormContents.module.css'

const EXPIRY_PERIOD_TYPE_OPTIONS = Object.entries(Program.expiryPeriodType).map(
    ([, value]) => ({ label: value, value })
)

function isEnabled(value: unknown): boolean {
    if (value == null || value === '') {
        return false
    }
    const numericValue = Number(value)
    return !Number.isNaN(numericValue) && numericValue !== 0
}

export function ExpiryDaysWithPeriodTypeField() {
    const { input: expiryDaysInput } = useField('expiryDays')
    const { input: expiryPeriodTypeInput } = useField('expiryPeriodType')
    const [checked, setChecked] = useState(() =>
        isEnabled(expiryDaysInput.value)
    )

    useEffect(() => {
        if (isEnabled(expiryDaysInput.value)) {
            setChecked(true)
        }
    }, [expiryDaysInput.value])

    const onToggle = (isChecked: boolean) => {
        setChecked(isChecked)
        if (!isChecked) {
            expiryDaysInput.onChange(0)
            expiryPeriodTypeInput.onChange(null)
        }
        expiryDaysInput.onBlur()
    }

    return (
        <div className={setupClasses.setupCheckboxBlock}>
            <Checkbox
                label={i18n.t(
                    'Close data entry a number of days after a period ends'
                )}
                onChange={({ checked: isChecked }) => onToggle(isChecked)}
                checked={checked}
            />
            {checked && (
                <div className={setupClasses.expiryDaysRow}>
                    <FieldRFF
                        name="expiryDays"
                        component={InputFieldFF}
                        type="number"
                        min="0"
                        inputWidth="150px"
                        label={i18n.t('Number of days')}
                        dataTest="formfields-expiryDays"
                        format={(value: unknown) => value?.toString()}
                        parse={(value: unknown) => {
                            if (value === undefined || value === null) {
                                return null
                            }
                            if (value === '') {
                                return 0
                            }
                            return Number.parseInt(value as string, 10)
                        }}
                    />
                    <FieldRFF
                        name="expiryPeriodType"
                        render={({
                            input: expiryPeriodTypeInput,
                            meta: expiryPeriodTypeMeta,
                        }) => (
                            <SingleSelectFieldFF
                                input={expiryPeriodTypeInput}
                                meta={
                                    expiryPeriodTypeMeta as FieldMetaState<
                                        string | undefined
                                    >
                                }
                                inputWidth="200px"
                                label={i18n.t('Expiry period type')}
                                dataTest="formfields-expiryPeriodType"
                                options={EXPIRY_PERIOD_TYPE_OPTIONS}
                            />
                        )}
                    />
                </div>
            )}
        </div>
    )
}
