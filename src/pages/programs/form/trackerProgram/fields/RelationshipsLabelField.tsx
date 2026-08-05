import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import { StandardFormField } from '../../../../../components'
import { useLabelValidator } from './useLabelValidator'

export function RelationshipsLabelField() {
    const validate = useLabelValidator('relationshipsLabel')

    return (
        <StandardFormField>
            <Field
                component={InputFieldFF}
                name="relationshipsLabel"
                inputWidth="400px"
                label={i18n.t('Custom label for "Relationship" (plural)')}
                helpText={i18n.t('Example use: See all relationships', {
                    nsSeparator: '~:~',
                })}
                dataTest="formfields-relationshipsLabel"
                validate={validate}
            />
        </StandardFormField>
    )
}
