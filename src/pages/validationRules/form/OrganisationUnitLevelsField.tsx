import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useField } from 'react-final-form'
import { ModelMultiSelectField } from '../../../components'
import css from './ValidationRuleFormFields.module.css'

export const OrganisationUnitLevelsField = () => {
    const { input, meta } = useField('organisationUnitLevels', {
        multiple: true,
        format: (levels: number[]) => {
            return levels?.map((l) => ({
                id: l.toString(),
                displayName: l.toString(),
                level: l,
            }))
        },
        parse: (levels) => {
            return levels?.map((l) => Number.parseInt(l.id, 10))
        },
        validateFields: [],
    })

    return (
        <div className={css.fieldContainer}>
            <ModelMultiSelectField
                input={input}
                meta={meta}
                name="organisationUnitLevels"
                label={i18n.t('Organisation unit levels to run validation for')}
                dataTest="formfields-organisationunitlevels"
                query={{
                    resource: 'organisationUnitLevels',
                    params: {
                        fields: ['displayName', 'level'],
                        order: ['level'],
                    },
                }}
                transform={(values) =>
                    values.map((value) => ({
                        ...value,
                        id: value.level.toString(),
                    }))
                }
            />
        </div>
    )
}
