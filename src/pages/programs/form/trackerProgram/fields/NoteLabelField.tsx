import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useLabelValidator } from './useLabelValidator'

export function NoteLabelField() {
    const validate = useLabelValidator('noteLabel')

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="noteLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Note"')}
                helpText={i18n.t(
                    'Used to customize the label for a note or comment added to an enrollment or event'
                )}
                dataTest="formfields-noteLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
