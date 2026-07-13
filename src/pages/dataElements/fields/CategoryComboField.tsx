import i18n from '@dhis2/d2-i18n'
import React, { useEffect } from 'react'
import { useForm, useFormState } from 'react-final-form'
import { ModelSingleSelectRefreshableFormField } from '../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'
import { DEFAULT_CATEGORYCOMBO_SELECT_OPTION, SECTIONS_MAP } from '../../../lib'
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
    const { change } = useForm()
    const { values } = useFormState({ subscription: { values: true } })
    const domainTypeIsTracker = values.domainType === 'TRACKER'
    const disabled = domainTypeIsTracker

    useEffect(() => {
        if (domainTypeIsTracker) {
            change('categoryCombo', DEFAULT_CATEGORYCOMBO_SELECT_OPTION)
        }
    }, [change, domainTypeIsTracker])

    return (
        <ModelSingleSelectRefreshableFormField
            required
            name="categoryCombo"
            dataTest="formfields-categorycombo"
            label={i18n.t('Category combination')}
            helpText={i18n.t('Choose how this data element is disaggregated.')}
            disabled={disabled}
            query={CATEGORY_COMBOS_QUERY}
            transform={addDefaultCategoryComboTransform}
            section={SECTIONS_MAP.categoryCombo}
        />
    )
}
