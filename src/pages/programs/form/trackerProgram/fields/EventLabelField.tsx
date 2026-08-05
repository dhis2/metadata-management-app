import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useLabelValidator } from './useLabelValidator'

export function EventLabelField() {
    const validate = useLabelValidator('eventLabel')

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="eventLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Event"')}
                helpText={i18n.t('Example use: Schedule a new event', {
                    nsSeparator: '~:~',
                })}
                dataTest="formfields-eventLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
