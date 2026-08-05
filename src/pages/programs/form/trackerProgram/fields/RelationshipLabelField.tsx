import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useLabelValidator } from './useLabelValidator'

export function RelationshipLabelField() {
    const validate = useLabelValidator('relationshipLabel')

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="relationshipLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Relationship"')}
                helpText={i18n.t(
                    'Used to customize the label for a relationship between tracked entities'
                )}
                dataTest="formfields-relationshipLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
