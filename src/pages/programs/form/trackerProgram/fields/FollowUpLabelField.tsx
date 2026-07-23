import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useSchemaSectionHandleOrThrow, useValidator } from '../../../../../lib'

export function FollowUpLabelField() {
    const schemaSection = useSchemaSectionHandleOrThrow()
    const validate = useValidator({
        schemaSection,
        property: 'followUpLabel',
    })

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="followUpLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Follow-up"')}
                helpText={i18n.t(
                    'Used to customize the label for follow-up events or activities'
                )}
                dataTest="formfields-followUpLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
