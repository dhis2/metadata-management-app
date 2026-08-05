import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useLabelValidator } from './useLabelValidator'

export function ProgramStagesLabelField() {
    const validate = useLabelValidator('programStagesLabel')

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="programStagesLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Program stage" (plural)')}
                helpText={i18n.t('Example use: See all program stages', {
                    nsSeparator: '~:~',
                })}
                dataTest="formfields-programStagesLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
