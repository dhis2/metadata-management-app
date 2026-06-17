import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { SCHEMA_SECTIONS, useValidator } from '../../../../../lib'

export function EventsLabelField() {
    const validate = useValidator({
        schemaSection: SCHEMA_SECTIONS.programStage,
        property: 'eventsLabel',
    })

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="eventsLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for event (plural)')}
                dataTest="formfields-eventsLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
