import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useSchemaSectionHandleOrThrow, useValidator } from '../../../../../lib'

export function EventsLabelField() {
    const schemaSection = useSchemaSectionHandleOrThrow()
    const validate = useValidator({
        schemaSection,
        property: 'eventsLabel',
    })

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="eventsLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Events"')}
                helpText={i18n.t('Example use: See all events', {
                    nsSeparator: '~:~',
                })}
                dataTest="formfields-eventsLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
