import i18n from '@dhis2/d2-i18n'
import { FieldGroup, RadioFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field, useField } from 'react-final-form'
import { getConstantTranslation } from '../../../lib'
import { ProgramRuleVariable } from '../../../types/generated'

const SOURCE_TYPES = [
    {
        value: ProgramRuleVariable.programRuleVariableSourceType
            .DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE,
        label: getConstantTranslation(
            ProgramRuleVariable.programRuleVariableSourceType
                .DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE
        ),
    },
    {
        value: ProgramRuleVariable.programRuleVariableSourceType
            .DATAELEMENT_NEWEST_EVENT_PROGRAM,
        label: getConstantTranslation(
            ProgramRuleVariable.programRuleVariableSourceType
                .DATAELEMENT_NEWEST_EVENT_PROGRAM
        ),
    },
    {
        value: ProgramRuleVariable.programRuleVariableSourceType
            .DATAELEMENT_CURRENT_EVENT,
        label: getConstantTranslation(
            ProgramRuleVariable.programRuleVariableSourceType
                .DATAELEMENT_CURRENT_EVENT
        ),
    },
    {
        value: ProgramRuleVariable.programRuleVariableSourceType
            .DATAELEMENT_PREVIOUS_EVENT,
        label: getConstantTranslation(
            ProgramRuleVariable.programRuleVariableSourceType
                .DATAELEMENT_PREVIOUS_EVENT
        ),
    },
    {
        value: ProgramRuleVariable.programRuleVariableSourceType
            .CALCULATED_VALUE,
        label: getConstantTranslation(
            ProgramRuleVariable.programRuleVariableSourceType.CALCULATED_VALUE
        ),
    },
    {
        value: ProgramRuleVariable.programRuleVariableSourceType.TEI_ATTRIBUTE,
        label: getConstantTranslation(
            ProgramRuleVariable.programRuleVariableSourceType.TEI_ATTRIBUTE
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
