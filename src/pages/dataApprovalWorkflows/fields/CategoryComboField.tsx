import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { ModelSingleSelectRefreshableFormField } from '../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'
import {
    DEFAULT_CATEGORYCOMBO_SELECT_OPTION,
    required as requiredValidator,
} from '../../../lib'
import { DisplayableModel } from '../../../types/models'

const CATEGORY_COMBOS_QUERY = {
    resource: 'categoryCombos',
    params: {
        fields: ['id', 'displayName'],
        filter: ['isDefault:eq:false'],
        order: ['displayName'],
    },
}

const addDefaultCategoryComboTransform = <TCatCombo extends DisplayableModel>(
    catCombos: TCatCombo[]
) => [DEFAULT_CATEGORYCOMBO_SELECT_OPTION, ...catCombos]

export function CategoryComboField() {
    return (
        <ModelSingleSelectRefreshableFormField
            required
            name="categoryCombo"
            dataTest="formfields-categorycombo"
            label={i18n.t('Category combination')}
            validate={requiredValidator}
            query={CATEGORY_COMBOS_QUERY}
            transform={addDefaultCategoryComboTransform}
            refreshResource="categoryCombos"
        />
    )
}
