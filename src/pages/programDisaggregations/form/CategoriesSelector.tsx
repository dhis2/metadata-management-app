import i18n from '@dhis2/d2-i18n'
import React, { useCallback } from 'react'
import { ModelSingleSelect } from '../../../components/metadataFormControls/ModelSingleSelect'
import {
    Category,
    CategoryCombo,
    PickWithFieldFilters,
} from '../../../types/generated'
import css from './CategoriesSelector.module.css'

export const categoriesFieldFilter = [
    'id',
    'displayName',
    'name',
    'dataDimensionType',
    'categoryOptions[id,displayName]',
] as const
export const categoryComboFieldFilter = [
    'id',
    'displayName',
    'dataDimensionType',
    'categories[id,displayName,name,dataDimensionType,categoryOptions[id,displayName]]',
] as const
export type CategoryComboFromSelect = PickWithFieldFilters<
    CategoryCombo,
    typeof categoryComboFieldFilter
>
export type CategoryFromSelect = PickWithFieldFilters<
    Category,
    typeof categoriesFieldFilter
>

export const CategoriesSelector = ({
    categoriesWithMappings,
    addCategories,
    dimensionType = 'DISAGGREGATION',
}: {
    categoriesWithMappings: string[]
    addCategories: (categories: CategoryFromSelect[]) => void
    dimensionType?: 'DISAGGREGATION' | 'ATTRIBUTE'
}) => {
    return (
        <div className={css.selectorWrapper}>
            <div className={css.selectorContainer}>
                <ModelSingleSelect<CategoryFromSelect & { disabled?: boolean }>
                    query={{
                        resource: 'categories',
                        params: {
                            fields: categoriesFieldFilter.concat(),
                            filter: [
                                'name:neq:default',
                                `dataDimensionType:eq:${dimensionType}`,
                            ],
                        },
                    }}
                    transform={useCallback(
                        (categories: CategoryFromSelect[]) =>
                            categories.map((category) => ({
                                ...category,
                                disabled: categoriesWithMappings.includes(
                                    category.id
                                ),
                            })),
                        [categoriesWithMappings]
                    )}
                    placeholder={i18n.t('Add a category')}
                    onChange={(payload) => {
                        if (payload) {
                            addCategories([payload])
                        }
                    }}
                />
            </div>
            <div className={css.selectorContainer}>
                <ModelSingleSelect<CategoryComboFromSelect>
                    query={{
                        resource: 'categoryCombos',
                        params: {
                            fields: categoryComboFieldFilter.concat(),
                            filter: [
                                'name:neq:default',
                                `dataDimensionType:eq:${dimensionType}`,
                            ],
                        },
                    }}
                    transform={useCallback(
                        (categoryCombos: CategoryComboFromSelect[]) =>
                            categoryCombos.map((categoryCombo) => ({
                                ...categoryCombo,
                                disabled: categoryCombo.categories
                                    .map((c) => c.id)
                                    .every((cid) =>
                                        categoriesWithMappings.includes(cid)
                                    ),
                            })),
                        [categoriesWithMappings]
                    )}
                    placeholder={i18n.t('Add categories from a category combo')}
                    onChange={(payload) => {
                        if (payload) {
                            addCategories(payload.categories)
                        }
                    }}
                />
            </div>
        </div>
    )
}
