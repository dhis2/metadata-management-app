import i18n from '@dhis2/d2-i18n'
import { Field, NoticeBox } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import { NavLink, useParams } from 'react-router-dom'
import { ModelTransferFrom } from '../../../components'
import { SECTIONS_MAP } from '../../../lib'
import { DisplayableModel } from '../../../types/models'
import css from './CategoryCombo.module.css'
import { CategoryComboFormValues } from './categoryComboSchema'
import { useIdenticalCategoryCombosQuery } from './useIdenticalCategoryCombosQuery'

type CategoriesValue = Pick<CategoryComboFormValues, 'categories'>['categories']

const query = {
    resource: 'categories',
    params: {
        fields: [
            'id',
            'displayName',
            'categoryOptions~size~rename(categoryOptionsSize)',
        ],
        order: 'displayName:asc',
        filter: ['name:ne:default'],
    },
}

const fieldName = 'categories'
const numberFormat = new Intl.NumberFormat()

export function CategoriesField() {
    const catComboId = useParams()?.id

    const { input, meta } = useField<
        Pick<CategoryComboFormValues, 'categories'>['categories']
    >(fieldName, {
        multiple: true,
        validateFields: [],
    })

    const generatedCocsCount =
        input.value?.reduce((acc, cat) => acc * cat.categoryOptionsSize, 1) || 0
    return (
        <div className={css.categoriesFieldWrapper}>
            <Field
                dataTest="formfields-modeltransfer"
                error={meta.invalid}
                validationText={(meta.touched && meta.error?.toString()) || ''}
                name={fieldName}
            >
                <ModelTransferFrom
                    selected={input.value}
                    onChange={({ selected }) => {
                        input.onChange(selected)
                        input.onBlur()
                    }}
                    query={query}
                    maxSelections={200}
                    transferSection={SECTIONS_MAP.category}
                />
            </Field>
            <div className={css.categoriesNoticesWrapper}>
                {!catComboId && generatedCocsCount > 1 && (
                    <NoticeBox warning={generatedCocsCount > 250}>
                        {i18n.t(
                            '{{count}} category option combinations will be generated.',
                            {
                                count: numberFormat.format(generatedCocsCount),
                            }
                        )}
                    </NoticeBox>
                )}
                <CategoriesFieldWarnings
                    catComboId={catComboId}
                    selectedCategories={input.value}
                />
            </div>
        </div>
    )
}

const CategoriesFieldWarnings = ({
    selectedCategories,
    catComboId,
}: {
    selectedCategories: CategoriesValue
    catComboId?: string
}) => {
    const isMoreThanRecommended = selectedCategories.length > 4
    const identicalCatCombosResult = useIdenticalCategoryCombosQuery({
        categoryComboId: catComboId,
        selectedCategories,
        enabled: !isMoreThanRecommended,
    })
    const isIdenticalCatCombos =
        identicalCatCombosResult.isSuccess &&
        identicalCatCombosResult.data?.pager.total > 0

    if (!isMoreThanRecommended && !isIdenticalCatCombos) {
        return null
    }

    return (
        <>
            {isIdenticalCatCombos && (
                <IdenticalCategoryComboWarning
                    categoryCombos={
                        identicalCatCombosResult.data.categoryCombos
                    }
                />
            )}
            {isMoreThanRecommended && (
                <NoticeBox warning title={i18n.t('More than 4 Categories')}>
                    {i18n.t(
                        'A Category combination with more than 4 categories is not recommended.'
                    )}
                </NoticeBox>
            )}
        </>
    )
}

const IdenticalCategoryComboWarning = ({
    categoryCombos,
}: {
    categoryCombos: DisplayableModel[]
}) => {
    return (
        <NoticeBox warning title={i18n.t('Identical Category Combination')}>
            {i18n.t(
                `One or more Category combinations with the same categories already exist in the system.
        It is strongly discouraged to have more than one Category combination with the same categories.`
            )}
            <br />
            {i18n.t(
                'The following Category combinations have identical categories:'
            )}
            <ul className={css.identicalCategoriesList}>
                {categoryCombos.map((catCombo) => (
                    <li key={catCombo.id}>
                        <NavLink target="_blank" to={`../${catCombo.id}`}>
                            {catCombo.displayName}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </NoticeBox>
    )
}
