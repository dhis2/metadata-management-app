import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useField } from 'react-final-form'
import { ModelMultiSelectField } from '../../../components'
import css from './PredictorFormFields.module.css'

export const OrganisationUnitLevelsField = () => {
    const { input, meta } = useField('organisationUnitLevels', {
        multiple: true,
        validateFields: [],
    })

    return (
        <div className={css.fieldContainer}>
            <ModelMultiSelectField
                input={input}
                meta={meta}
                name="organisationUnitLevels"
                label={i18n.t('Organisation unit levels')}
                dataTest="formfields-organisationunitlevels"
                query={{
                    resource: 'organisationUnitLevels',
                    params: {
                        fields: ['displayName', 'level', 'id'],
                        order: ['level'],
                    },
                }}
            />
        </div>
    )
}
