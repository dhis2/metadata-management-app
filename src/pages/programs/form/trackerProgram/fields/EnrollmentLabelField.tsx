import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useSchemaSectionHandleOrThrow, useValidator } from '../../../../../lib'

export function EnrollmentLabelField() {
    const schemaSection = useSchemaSectionHandleOrThrow()
    const validate = useValidator({
        schemaSection,
        property: 'enrollmentLabel',
    })

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="enrollmentLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Enrollment"')}
                helpText={i18n.t(
                    'Example use: See all data in this enrollment',
                    {
                        nsSeparator: '~:~',
                    }
                )}
                dataTest="formfields-enrollmentLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
