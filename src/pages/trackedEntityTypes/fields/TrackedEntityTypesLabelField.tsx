import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../components'
import {
    SchemaSection,
    useGivenShemaOrSchemaSectionHandleOrThrow,
    useValidator,
} from '../../../lib'

export function TrackedEntityTypesLabelField({
    section,
}: {
    readonly section?: SchemaSection
}) {
    const schemaSection = useGivenShemaOrSchemaSectionHandleOrThrow({ section })
    const validate = useValidator({
        schemaSection,
        property: 'trackedEntityTypesLabel',
    })

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="trackedEntityTypesLabel"
                inputWidth="400px"
                label={i18n.t('Name (Plural)')}
                dataTest="formfields-trackedEntityTypesLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
