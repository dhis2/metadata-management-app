import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useLabelValidator } from './useLabelValidator'

export function NotesLabelField() {
    const validate = useLabelValidator('notesLabel')

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="notesLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Note" (plural)')}
                helpText={i18n.t('Example use: See all notes', {
                    nsSeparator: '~:~',
                })}
                dataTest="formfields-notesLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
