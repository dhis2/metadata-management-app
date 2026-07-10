import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQuery } from '@tanstack/react-query'
import React, { useCallback, useMemo, useState } from 'react'
import { Form } from 'react-final-form'
import {
    DefaultMergeFormContents,
    MergeComplete,
    StyledMergeForm,
    Title,
} from '../../components/merge'
import {
    getDefaultsOld,
    useLocationWithState,
    useBoundResourceQueryFn,
} from '../../lib'
import { createFormError } from '../../lib/form/createFormError'
import { CategoryMergeFormFields } from './merge/CategoryMergeFormFields'
import {
    CategoryMergeFormValues,
    mergeFormSchema,
    validate,
} from './merge/CategoryMergeSchema'

type CategoryDetails = {
    id: string
    categoryCombo: { id: string }
    categoryOptions: { id: string }[]
}
type CategoriesDetailsResponse = { categories: CategoryDetails[] }

export const useCategoriesDetailsQuery = ({
    selectedIdsString,
}: {
    selectedIdsString: string
}) => {
    const queryFn = useBoundResourceQueryFn()

    return useQuery({
        queryKey: [
            {
                resource: 'categories',
                params: {
                    fields: ['id', 'categoryCombo[id]', 'categoryOptions[id]'],
                    filter: [`id:in:[${selectedIdsString}]`],
                    paging: false,
                },
            },
        ],
        enabled: !!selectedIdsString,
        queryFn: queryFn<CategoriesDetailsResponse>,
        select: useCallback((data: CategoriesDetailsResponse) => {
            return data.categories.reduce((acc, category) => {
                acc[category.id] = category
                return acc
            }, {} as Record<string, CategoryDetails>)
        }, []),
    })
}

export const Component = () => {
    const [extraValidationResult, setExtraValidationResult] =
        useState<boolean>(true)
    const location = useLocationWithState<{ selectedModels: Set<string> }>()

    const dataEngine = useDataEngine()
    const selectedIds: string[] = useMemo(
        () => Array.from(location.state?.selectedModels ?? []),
        [location.state?.selectedModels]
    )
    const initialValues = useMemo(
        () => ({
            ...getDefaultsOld(mergeFormSchema),
            target: undefined,
            sources: [],
        }),
        []
    )

    const { data: categoryDetails } = useCategoriesDetailsQuery({
        selectedIdsString: selectedIds.join(','),
    })

    const extraValidate: (values: {
        target: string
        sources: string[]
    }) => string | undefined = useCallback(
        (values) => {
            if (!values.target || !values.sources || !categoryDetails) {
                return undefined
            }
            // keep target as poin of reference
            const targetCategory = categoryDetails[values.target]
            const targetCategoryOptions = targetCategory.categoryOptions
                .map((co) => co.id)
                .sort()
                .join(',')
            for (const category of values.sources) {
                const sourceCategory = categoryDetails[category]
                const sourceCategoryOptions = sourceCategory.categoryOptions
                    .map((co) => co.id)
                    .sort()
                    .join(',')

                // if category options are not the same
                if (sourceCategoryOptions !== targetCategoryOptions) {
                    setExtraValidationResult(false)
                    return i18n.t(
                        'Category options of source and target categories do not match'
                    )
                }
                // if category combos are not the same
                if (
                    sourceCategory.categoryCombo.id !==
                    targetCategory.categoryCombo.id
                ) {
                    setExtraValidationResult(false)
                    return i18n.t(
                        'Category combos of source and target categories do not match'
                    )
                }
            }
            // if category combo of any items do not match
            setExtraValidationResult(true)
            return undefined
        },
        [categoryDetails, setExtraValidationResult]
    )

    const onSubmit = async (values: CategoryMergeFormValues) => {
        try {
            const data = mergeFormSchema.parse(values)
            await dataEngine.mutate({
                resource: 'categories/merge',
                type: 'create',
                data,
            })
            return undefined
        } catch (e) {
            console.error(e)
            return createFormError(e)
        }
    }

    return (
        <Form
            initialValues={initialValues}
            onSubmit={onSubmit}
            validate={validate}
            subscription={{
                values: false,
                submitting: true,
                submitSucceeded: true,
            }}
        >
            {({ handleSubmit }) => (
                <StyledMergeForm onSubmit={handleSubmit}>
                    <DefaultMergeFormContents
                        title={
                            <Title>{i18n.t('Configure category merge')}</Title>
                        }
                        mergeCompleteElement={
                            <MergeComplete>
                                <p>
                                    {i18n.t(
                                        'The category merge operation is complete.'
                                    )}
                                </p>
                                <p>
                                    {i18n.t(
                                        'All selected categories were merged successfully.'
                                    )}
                                </p>
                            </MergeComplete>
                        }
                        extraValidation={extraValidate}
                    >
                        <CategoryMergeFormFields
                            selectedIds={selectedIds}
                            hideConfirmation={!extraValidationResult}
                        />
                    </DefaultMergeFormContents>
                </StyledMergeForm>
            )}
        </Form>
    )
}
