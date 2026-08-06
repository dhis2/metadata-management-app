import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useLabelValidator } from './useLabelValidator'

export function EnrollmentDateLabelField() {
    const validate = useLabelValidator('enrollmentDateLabel')

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="enrollmentDateLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Enrollment date"')}
                helpText={i18n.t(
                    'Used as the default registration date for enrollments'
                )}
                dataTest="formfields-enrollmentDateLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
