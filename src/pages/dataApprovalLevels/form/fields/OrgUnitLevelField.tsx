import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { useField } from 'react-final-form'
import { ModelSingleSelectField } from '../../../../components/metadataFormControls/ModelSingleSelect'
import { required as requiredValidator } from '../../../../lib'

export function OrgUnitLevelField() {
    const { input, meta } = useField('orgUnitLevel', {
        validateFields: [],
        validate: requiredValidator,
        format: (level) =>
            level == null
                ? undefined
                : { id: level.toString(), displayName: '' },
        parse: (selected) =>
            selected ? Number.parseInt(selected.id, 10) : undefined,
    })

    return (
        <ModelSingleSelectField
            required
            input={input}
            meta={meta}
            label={i18n.t('Organisation unit level')}
            dataTest="formfields-orgunitlevel"
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
                    id: (
                        value as unknown as { level: number }
                    ).level.toString(),
                }))
            }
        />
    )
}
