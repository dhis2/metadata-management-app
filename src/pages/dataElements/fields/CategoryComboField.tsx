import i18n from '@dhis2/d2-i18n'
import React, { useCallback, useEffect } from 'react'
import { useForm, useFormState } from 'react-final-form'
import { useHref } from 'react-router'
import { EditableInputWrapper } from '../../../components'
import {
    ModelSingleSelectFormField,
    useRefreshModelSingleSelect,
} from '../../../components/metadataFormControls/ModelSingleSelect'
import { DEFAULT_CATEGORYCOMBO_SELECT_OPTION } from '../../../lib'
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
    const newCategoryComboLink = useHref('/categoryCombos/new')
    const refresh = useRefreshModelSingleSelect({ resource: 'categoryCombos' })

    useEffect(() => {
        if (domainTypeIsTracker) {
            change('categoryCombo', DEFAULT_CATEGORYCOMBO_SELECT_OPTION)
        }
    }, [change, domainTypeIsTracker])

    const inputWrapper = useCallback(
        (select: React.ReactElement) => (
            <EditableInputWrapper
                onRefresh={() => refresh()}
                onAddNew={() => window.open(newCategoryComboLink, '_blank')}
            >
                {select}
            </EditableInputWrapper>
        ),
        [refresh, newCategoryComboLink]
    )

    return (
        <ModelSingleSelectFormField
            required
            name="categoryCombo"
            dataTest="formfields-categorycombo"
            label={i18n.t('Category combination')}
            helpText={i18n.t('Choose how this data element is disaggregated.')}
            disabled={disabled}
            query={CATEGORY_COMBOS_QUERY}
            transform={addDefaultCategoryComboTransform}
            inputWrapper={inputWrapper}
        />
    )
}
