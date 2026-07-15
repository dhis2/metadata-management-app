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
    useBoundResourceQueryFn,
    useLocationWithState,
} from '../../lib'
import { createFormError } from '../../lib/form/createFormError'
import { CategoryComboMergeFormFields } from './merge/CategoryComboMergeFormFields'
import {
    CategoryComboMergeFormValues,
    mergeFormSchema,
    validate,
} from './merge/categoryComboMergeSchema'

type CategoryComboDetails = {
    id: string
    categories: { id: string }[]
}

type CategoryCombosDetailsResponse = { categoryCombos: CategoryComboDetails[] }

export const useCategoriesCombosDetailsQuery = ({
    selectedIdsString,
}: {
    selectedIdsString: string
}) => {
    const queryFn = useBoundResourceQueryFn()

    return useQuery({
        queryKey: [
            {
                resource: 'categoryCombos',
                params: {
                    fields: ['id', 'categories[id]'],
                    filter: [`id:in:[${selectedIdsString}]`],
                    paging: false,
                },
            },
        ],
        enabled: !!selectedIdsString,
        queryFn: queryFn<CategoryCombosDetailsResponse>,
        select: useCallback((data: CategoryCombosDetailsResponse) => {
            return data.categoryCombos.reduce((acc, categoryCombo) => {
                acc[categoryCombo.id] = categoryCombo
                return acc
            }, {} as Record<string, CategoryComboDetails>)
        }, []),
    })
}

export const Component = () => {
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

    const [extraValidationResult, setExtraValidationResult] =
        useState<boolean>(true)

    const { data: categoryComboDetails } = useCategoriesCombosDetailsQuery({
        selectedIdsString: selectedIds.join(','),
    })

    const extraValidate: (values: {
        target: string
        sources: string[]
    }) => string | undefined = useCallback(
        (values) => {
            if (!values.target || !values.sources || !categoryComboDetails) {
                return undefined
            }

            const targetCategories = categoryComboDetails[values.target]
            const targetCategoryIds = targetCategories.categories
                .map((c) => c.id)
                .sort()
                .join(',')

            for (const s of values.sources) {
                const sourceCategoryIds = categoryComboDetails[s].categories
                    .map((c) => c.id)
                    .sort()
                    .join(',')

                if (sourceCategoryIds !== targetCategoryIds) {
                    setExtraValidationResult(false)
                    return i18n.t(
                        'Categories of source and target category combinations do not match'
                    )
                }
            }

            setExtraValidationResult(true)
            return undefined
        },
        [categoryComboDetails, setExtraValidationResult]
    )

    const onSubmit = async (values: CategoryComboMergeFormValues) => {
        try {
            const data = mergeFormSchema.parse(values)
            await dataEngine.mutate({
                resource: 'categoryCombos/merge',
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
                            <Title>
                                {i18n.t(
                                    'Configure category combinations merge'
                                )}
                            </Title>
                        }
                        mergeCompleteElement={
                            <MergeComplete>
                                <p>
                                    {i18n.t(
                                        'The category combinations merge operation is complete.'
                                    )}
                                </p>
                                <p>
                                    {i18n.t(
                                        'All selected category combinations were merged successfully.'
                                    )}
                                </p>
                            </MergeComplete>
                        }
                        extraValidation={extraValidate}
                    >
                        <CategoryComboMergeFormFields
                            selectedIds={selectedIds}
                            hideConfirmation={!extraValidationResult}
                        />
                    </DefaultMergeFormContents>
                </StyledMergeForm>
            )}
        </Form>
    )
}
