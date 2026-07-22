import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useSchemaSectionHandleOrThrow, useValidator } from '../../../../../lib'

export function NotesLabelField() {
    const schemaSection = useSchemaSectionHandleOrThrow()
    const validate = useValidator({
        schemaSection,
        property: 'notesLabel',
    })

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
