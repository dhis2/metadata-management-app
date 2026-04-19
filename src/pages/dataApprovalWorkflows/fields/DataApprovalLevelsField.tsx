import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { ModelMultiSelectFormField } from '../../../components'

export function DataApprovalLevelsField() {
    return (
        <ModelMultiSelectFormField
            name="dataApprovalLevels"
            label={i18n.t('Data approval levels')}
            dataTest="formfields-dataapprovallevels"
            inputWidth="400px"
            query={{
                resource: 'dataApprovalLevels',
                params: {
                    fields: ['id', 'displayName'],
                    order: ['displayName'],
                },
            }}
        />
    )
}
