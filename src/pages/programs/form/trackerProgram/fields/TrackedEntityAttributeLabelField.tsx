import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useSchemaSectionHandleOrThrow, useValidator } from '../../../../../lib'

export function TrackedEntityAttributeLabelField() {
    const schemaSection = useSchemaSectionHandleOrThrow()
    const validate = useValidator({
        schemaSection,
        property: 'trackedEntityAttributeLabel',
    })

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="trackedEntityAttributeLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Attribute"')}
                helpText={i18n.t(
                    'Used to customize the label for tracked entity attributes'
                )}
                dataTest="formfields-trackedEntityAttributeLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
