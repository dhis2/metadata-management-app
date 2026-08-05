import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useLabelValidator } from './useLabelValidator'

export function FollowUpLabelField() {
    const validate = useLabelValidator('followUpLabel')

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="followUpLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Follow-up"')}
                helpText={i18n.t(
                    'Used to customize the label for a follow-up event or activity'
                )}
                dataTest="formfields-followUpLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
