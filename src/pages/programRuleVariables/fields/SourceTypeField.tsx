import i18n from '@dhis2/d2-i18n'
import { FieldGroup, RadioFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field, useField } from 'react-final-form'
import { getConstantTranslation } from '../../../lib'
import { ProgramRuleVariableSourceType } from '../../../types/generated'

const SOURCE_TYPES = [
    {
        value: ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE,
        label: getConstantTranslation(
            ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE
        ),
    },
    {
        value: ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM,
        label: getConstantTranslation(
            ProgramRuleVariableSourceType.DATAELEMENT_NEWEST_EVENT_PROGRAM
        ),
    },
    {
        value: ProgramRuleVariableSourceType.DATAELEMENT_CURRENT_EVENT,
        label: getConstantTranslation(
            ProgramRuleVariableSourceType.DATAELEMENT_CURRENT_EVENT
        ),
    },
    {
        value: ProgramRuleVariableSourceType.DATAELEMENT_PREVIOUS_EVENT,
        label: getConstantTranslation(
            ProgramRuleVariableSourceType.DATAELEMENT_PREVIOUS_EVENT
        ),
    },
    {
        value: ProgramRuleVariableSourceType.CALCULATED_VALUE,
        label: getConstantTranslation(
            ProgramRuleVariableSourceType.CALCULATED_VALUE
        ),
    },
    {
        value: ProgramRuleVariableSourceType.TEI_ATTRIBUTE,
        label: getConstantTranslation(
            ProgramRuleVariableSourceType.TEI_ATTRIBUTE
        ),
    },
]

export function SourceTypeField({
    onChange,
}: Readonly<{ onChange?: () => void }>) {
    const { meta } = useField('programRuleVariableSourceType', {
        subscription: { error: true, touched: true },
    })

    const error = meta.error && meta.touched

    return (
        <FieldGroup
            label={i18n.t('Source type')}
            required
            error={!!error}
            validationText={error ? meta.error : undefined}
            dataTest="sourceType-field"
        >
            {SOURCE_TYPES.map((option) => (
                <Field<string | undefined>
                    key={option.value}
                    name="programRuleVariableSourceType"
                    component={RadioFieldFF}
                    label={option.label}
                    type="radio"
                    value={option.value}
                    onChange={() => {
                        onChange?.()
                    }}
                />
            ))}
        </FieldGroup>
    )
}
