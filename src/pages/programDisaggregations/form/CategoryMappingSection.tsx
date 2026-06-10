import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button, IconInfo16, IconWarningFilled16 } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo, useState } from 'react'
import { useField, useForm, useFormState } from 'react-final-form'
import { useFieldArray } from 'react-final-form-arrays'
import {
    CollapsibleCard,
    CollapsibleCardHeader,
    CollapsibleCardTitle,
} from '../../../components'
import { LoadingSpinner } from '../../../components/loading/LoadingSpinner'
import {
    generateDhis2Id,
    useBoundResourceQueryFn,
    DEFAULT_CATEGORY,
} from '../../../lib'
import { DisplayableModel } from '../../../types/models'
import {
    categoriesFieldFilter,
    CategoriesSelector,
    CategoryFromSelect,
} from './CategoriesSelector'
import { CategoryMapping } from './CategoryMapping'
import css from './CategoryMappingSection.module.css'
import {
    CategoryMapping as CategoryMappingSchema,
    ProgramDisaggregationFormValues,
    ProgramIndicatorCategory,
    ProgramIndicatorMappingsRecord,
} from './programDisaggregationSchema'

// the type of dataDimensionType in generated is an enum, which can be annoying to use...
type DataDimensionType = 'ATTRIBUTE' | 'DISAGGREGATION'

const getEmptyOptionValues = (categoryOptions: DisplayableModel[]) => {
    return categoryOptions?.reduce(
        (
            optionObject: CategoryMappingSchema['options'],
            option: DisplayableModel
        ) => {
            optionObject[option.id] = {
                optionId: option.id,
                filter: '',
            }
            return optionObject
        },
        {} as CategoryMappingSchema['options']
    )
}

const createNewOptionMapping = (
    category: CategoryFromSelect,
    name?: string
) => ({
    categoryId: category.id,
    id: generateDhis2Id(),
    mappingName: name ?? `Standard ${category.name} mapping`,
    options: getEmptyOptionValues(category.categoryOptions),
    deleted: false,
    category,
})

/* Gather categories that are relevant
    categoryMappings is a complex object on the backend, and we thus cannot get all the information we need in a single request.
    To avoid a lot of fetching of category data, we try to gather information of the categories from a combination
    of different sources:
    1. Categories that are already mapped in the form (categoryMappings)
    2. Categories that are part of the selected categoryCombo in a program indicator mapping
        This is used for suggested categories
    3. Categories that are newly added to the form (in categoryMapppings - but full category is saved and available)

    Categories in 1 needs to be fetched, because we only have the ids in categoryMappings
    Categories in 2 and 3 are stored in the form state when added.
*/
const useCategories = ({
    dataDimensionType = 'ATTRIBUTE',
}: {
    dataDimensionType: DataDimensionType
}) => {
    const queryFn = useBoundResourceQueryFn()
    const { initialValues } = useFormState<ProgramDisaggregationFormValues>({
        subscription: { initialValues: true },
    })
    // the reason keeping own state for this instead of subscribing to 'categoryMappings', is that
    // categoryMappings will update on every change to any key of categoryMappings (eg. on every onChange of a filter)
    const [categoriesWithMappings, setCategoriesWithMappings] = useState<
        CategoryFromSelect[]
    >([])

    const programIndicatorsRecord = useField<ProgramIndicatorMappingsRecord>(
        'programIndicatorMappings',
        { subscription: { value: true } }
    )?.input?.value

    const initialMappedCategoryIds = useMemo(
        () =>
            Object.keys(initialValues.categoryMappings ?? {}).sort((a, b) =>
                a.localeCompare(b)
            ),
        [initialValues.categoryMappings]
    )

    // fetch initial categories data
    const { data: initialCategories, ...queryResult } = useQuery({
        queryKey: [
            {
                resource: 'categories',
                params: {
                    paging: false,
                    fields: categoriesFieldFilter.concat(),
                    filter: [
                        'name:neq:default',
                        `id:in:[${initialMappedCategoryIds.map((id) => id)}]`,
                    ],
                },
            },
        ],
        queryFn: queryFn<{ categories: CategoryFromSelect }>,
        enabled: initialMappedCategoryIds.length > 0,
        staleTime: 1000 * 60,
        select: (data) => data.categories,
    })

    const calculatedCategories = useMemo(() => {
        const programIndicatorCategories = Object.values(
            programIndicatorsRecord
        )?.flatMap((piValue) => {
            const piComboKey =
                dataDimensionType === 'DISAGGREGATION'
                    ? 'categoryCombo'
                    : 'attributeCombo'
            return piValue?.[piComboKey]?.categories ?? []
        })

        const allCategories = categoriesWithMappings.concat(
            initialCategories ?? []
        )

        const categoriesWithMappingsList = allCategories.filter(
            (cat): cat is CategoryFromSelect =>
                !!cat && cat?.dataDimensionType === dataDimensionType
        )

        const categoriesWithMappingsMap = new Map(
            categoriesWithMappingsList.map((category) => [
                category.id,
                category,
            ])
        )

        const addedCategories = categoriesWithMappingsList.filter(
            (c) => initialValues.categoryMappings?.[c.id] === undefined
        )

        // A suggested category is a category that is part of a selected categoryCombo
        // in a program indicator mapping, but not already mapped in the form.

        // keep track of categories included to avoid duplicates
        const alreadyIncludedInSuggestedCategories = new Set<string>()

        const suggestedCategories = programIndicatorCategories.filter(
            (category): category is ProgramIndicatorCategory => {
                const include =
                    category !== undefined &&
                    !categoriesWithMappingsMap.has(category.id) &&
                    category.id !== DEFAULT_CATEGORY.id
                if (alreadyIncludedInSuggestedCategories.has(category.id)) {
                    return false
                }
                alreadyIncludedInSuggestedCategories.add(category.id)
                return include
            }
        )
        return {
            suggestedCategories,
            categoriesWithMappingsMap,
            categoriesWithMappingsList,
            addedCategories,
        }
    }, [
        categoriesWithMappings,
        initialValues.categoryMappings,
        initialCategories,
        programIndicatorsRecord,
        dataDimensionType,
    ])

    return {
        ...queryResult,
        ...calculatedCategories,
        setCategoriesWithMappings,
    }
}
export const CategoryMappingSection = ({
    dataDimensionType,
}: {
    dataDimensionType: DataDimensionType
}) => {
    const formApi = useForm()

    const {
        suggestedCategories,
        categoriesWithMappingsMap,
        categoriesWithMappingsList,
        isLoading,
        isStale,
        addedCategories,
        setCategoriesWithMappings,
    } = useCategories({
        dataDimensionType,
    })

    const { show: showNotification } = useAlert((message) => message)

    const addSingleCategory = (category: CategoryFromSelect) => {
        if (categoriesWithMappingsMap.has(category.id)) {
            return
        }
        formApi.change(`categoryMappings.${category.id}`, [
            createNewOptionMapping(category),
        ])
        setCategoriesWithMappings((prev) => [category, ...prev])
    }

    const addCategories = (categories: CategoryFromSelect[]) => {
        const diff = categories.filter(
            (category) => !categoriesWithMappingsMap.has(category.id)
        )
        if (diff.length === 0) {
            showNotification(i18n.t('No new categories to add'))
            return
        }
        diff.forEach((category) => {
            addSingleCategory(category)
        })

        if (diff.length === categories.length) {
            showNotification(
                i18n.t('{{newlyAddedCount}} categories added', {
                    newlyAddedCount: diff.length,
                })
            )
        } else {
            showNotification(
                i18n.t(
                    '{{newlyAddedCount}} categories added ({{alreadyAddedCount}} already in the list)',
                    {
                        newlyAddedCount: diff.length,
                        alreadyAddedCount: categories.length - diff.length,
                    }
                )
            )
        }
    }

    return (
        <div>
            <CategoriesSelector
                addCategories={addCategories}
                categoriesWithMappings={categoriesWithMappingsList.map(
                    (c) => c.id
                )}
                dimensionType={dataDimensionType}
            />
            {isLoading && !isStale && <LoadingSpinner />}
            {suggestedCategories.map((category) => (
                <SuggestedCategory
                    key={category.id}
                    category={category as unknown as CategoryFromSelect}
                    addCategory={() =>
                        addCategories([
                            category as unknown as CategoryFromSelect,
                        ])
                    }
                />
            ))}
            <div className={css.collapsibleCardWrapper}>
                {categoriesWithMappingsList.map((category) => (
                    <CategoryMappingList
                        key={category.id}
                        category={category}
                        initiallyExpanded={addedCategories.some(
                            (c) => c.id === category.id
                        )}
                    />
                ))}
            </div>
        </div>
    )
}

type SuggestedCategoryProps = {
    category: CategoryFromSelect
    addCategory: (category: CategoryFromSelect) => void
}

const SuggestedCategory = ({
    category,
    addCategory,
}: SuggestedCategoryProps) => (
    <div className={css.categoryCardSuggested}>
        <div>
            <span className={css.categoryText}>
                {i18n.t('Category:', { nsSeparator: '~:~' })}
            </span>
            <span>&nbsp;</span>
            <span className={css.categoryName}>{category.displayName}</span>
        </div>
        <div className={css.suggestedExplanationText}>
            <span>
                <IconInfo16 />
            </span>
            {i18n.t('Suggested based on Program Indicator selections')}
        </div>
        <Button
            small
            onClick={() => {
                addCategory(category)
            }}
        >
            {i18n.t('Add category')}
        </Button>
    </div>
)

type DisaggregationCategoryProps = {
    category: CategoryFromSelect
    initiallyExpanded?: boolean
}
export const CategoryMappingList = ({
    category,
    initiallyExpanded = false,
}: DisaggregationCategoryProps) => {
    const array = useFieldArray(`categoryMappings.${category.id}`)
    const { input: categoryMappingsDeleted } =
        useField<string[]>('deletedCategories')
    const isDeleted = categoryMappingsDeleted.value.includes(category.id)
    const someMappingInvalid = useMemo(() => {
        return array.fields.value.some((catMappings: CategoryMappingSchema) =>
            Object.values(catMappings.options).some(
                (optionMapping) => optionMapping.invalid
            )
        )
    }, [array])
    const categoryDisplayName = category.displayName
    const showSoftDelete =
        array.fields.value.filter((val) => !val.deleted).length > 1

    if (isDeleted) {
        return (
            <div className={css.categoryCardDeleted}>
                <div className={css.deletedCategoryText}>
                    {i18n.t(
                        'All mappings for {{- categoryName}} will be removed on save',
                        { categoryName: categoryDisplayName }
                    )}
                </div>

                <Button
                    small
                    onClick={() => {
                        categoryMappingsDeleted.onChange(
                            categoryMappingsDeleted.value.filter(
                                (deletedId: string) => deletedId !== category.id
                            )
                        )
                    }}
                >
                    {i18n.t('Restore mappings')}
                </Button>
            </div>
        )
    }

    return (
        <CollapsibleCard
            initiallyExpanded={initiallyExpanded}
            style={{ backgroundColor: 'var(--colors-grey100)' }}
            headerElement={
                <CollapsibleCardHeader>
                    <CollapsibleCardTitle
                        prefix={i18n.t('Category:')}
                        title={categoryDisplayName}
                        icon={
                            someMappingInvalid ? (
                                <IconWarningFilled16 color="var(--colors-yellow600)" />
                            ) : null
                        }
                    />
                    <Button
                        small
                        secondary
                        destructive
                        onClick={() => {
                            categoryMappingsDeleted.onChange([
                                ...(categoryMappingsDeleted.value || []),
                                category.id,
                            ])
                        }}
                    >
                        {i18n.t('Remove category mappings')}
                    </Button>
                </CollapsibleCardHeader>
            }
        >
            {array.fields.map((fieldName) => (
                <div key={fieldName}>
                    <CategoryMapping
                        fieldName={fieldName}
                        categoryOptionArray={category.categoryOptions ?? []}
                        showSoftDelete={showSoftDelete}
                    />
                </div>
            ))}

            <Button
                small
                onClick={() => {
                    array.fields.push(
                        createNewOptionMapping(
                            category,
                            'Mapping ' + (array?.fields?.length ?? 0)
                        )
                    )
                }}
            >
                {i18n.t('Add mapping')}
            </Button>
        </CollapsibleCard>
    )
}
