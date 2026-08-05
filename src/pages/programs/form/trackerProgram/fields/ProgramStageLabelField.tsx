import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useLabelValidator } from './useLabelValidator'

export function ProgramStageLabelField() {
    const validate = useLabelValidator('programStageLabel')

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="programStageLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Program stage"')}
                helpText={i18n.t(
                    'Example use: See all data in this program stage',
                    {
                        nsSeparator: '~:~',
                    }
                )}
                dataTest="formfields-programStageLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
