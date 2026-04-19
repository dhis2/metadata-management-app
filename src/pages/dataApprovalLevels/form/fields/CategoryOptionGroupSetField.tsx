import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { ModelSingleSelectRefreshableFormField } from '../../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'

export function CategoryOptionGroupSetField() {
    return (
        <ModelSingleSelectRefreshableFormField
            name="categoryOptionGroupSet"
            label={i18n.t('Category option group set')}
            dataTest="formfields-categoryoptiongroupset"
            query={{
                resource: 'categoryOptionGroupSets',
                params: {
                    fields: ['id', 'displayName'],
                    order: 'displayName:iasc',
                },
            }}
            refreshResource="categoryOptionGroupSets"
            clearable
        />
    )
}
