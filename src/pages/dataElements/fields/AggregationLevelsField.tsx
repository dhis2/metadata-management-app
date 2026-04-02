import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useField } from 'react-final-form'
import { ModelMultiSelectField } from '../../../components'

export function AggregationLevelsField() {
    const { input, meta } = useField('aggregationLevels', {
        multiple: true,
        format: (levels: number[]) => {
            return levels?.map((l) => ({
                id: l.toString(),
                displayName: l.toString(),
                level: l,
            }))
        },
        parse: (levels) => {
            return levels?.map((l) => parseInt(l.id, 10))
        },
        validateFields: [],
    })

    return (
        <ModelMultiSelectField
            input={input}
            meta={meta}
            name="aggregationLevels"
            label={i18n.t('Aggregation level(s)')}
            dataTest="formfields-aggregationlevels"
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
    )
}
