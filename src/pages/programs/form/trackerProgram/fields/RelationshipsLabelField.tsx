import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useSchemaSectionHandleOrThrow, useValidator } from '../../../../../lib'

export function RelationshipsLabelField() {
    const schemaSection = useSchemaSectionHandleOrThrow()
    const validate = useValidator({
        schemaSection,
        property: 'relationshipsLabel',
    })

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="relationshipsLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Relationships"')}
                helpText={i18n.t('Example use: See all relationships', {
                    nsSeparator: '~:~',
                })}
                dataTest="formfields-relationshipsLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
