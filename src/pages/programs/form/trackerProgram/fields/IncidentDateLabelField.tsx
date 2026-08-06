import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useLabelValidator } from './useLabelValidator'

export function IncidentDateLabelField() {
    const validate = useLabelValidator('incidentDateLabel')

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="incidentDateLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Incident date"')}
                helpText={i18n.t(
                    'Used as an additional registration date for enrollments'
                )}
                dataTest="formfields-incidentDateLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
