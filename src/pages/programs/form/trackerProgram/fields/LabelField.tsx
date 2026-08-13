import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useSchemaSectionHandleOrThrow, useValidator } from '../../../../../lib'

export function LabelField({
    name,
    label,
    helpText,
}: Readonly<{
    name: string
    label: string
    helpText?: string
}>) {
    const schemaSection = useSchemaSectionHandleOrThrow()
    const validate = useValidator({ schemaSection, property: name })

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name={name}
                inputWidth="400px"
                label={label}
                helpText={helpText}
                dataTest={`formfields-${name}`}
                validate={validate}
            />
        </StandardFormField>
    )
}
