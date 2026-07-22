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

export function TrackedEntityAttributesLabelField({
    section,
}: {
    readonly section?: SchemaSection
}) {
    const schemaSection = useGivenShemaOrSchemaSectionHandleOrThrow({ section })
    const validate = useValidator({
        schemaSection,
        property: 'trackedEntityAttributesLabel',
    })

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="trackedEntityAttributesLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Attribute" (plural)')}
                helpText={i18n.t('Example use: See all attributes', {
                    nsSeparator: '~:~',
                })}
                dataTest="formfields-trackedEntityAttributesLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
