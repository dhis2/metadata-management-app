import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import React, { useMemo } from 'react'
import { Form } from 'react-final-form'
import {
    DefaultMergeFormContents,
    MergeComplete,
    StyledMergeForm,
    Title,
} from '../../components/merge'
import { getDefaultsOld, useLocationWithState } from '../../lib'
import { createFormError } from '../../lib/form/createFormError'
import { CategoryMergeFormFields } from './merge/CategoryMergeFormFields'
import {
    CategoryMergeFormValues,
    mergeFormSchema,
    validate,
} from './merge/CategoryMergeSchema'

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
                    >
                        <CategoryMergeFormFields selectedIds={selectedIds} />
                    </DefaultMergeFormContents>
                </StyledMergeForm>
            )}
        </Form>
    )
}
