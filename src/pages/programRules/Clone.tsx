import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import arrayMutators from 'final-form-arrays'
import { omit } from 'lodash'
import React, { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    DrawerRoot,
    CloneNoticeBox,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
    TriggerCloneValidation,
} from '../../components'
import {
    createFormError,
    getSectionPath,
    SectionedFormProvider,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
    useCreateModel,
    useNavigateWithSearchState,
} from '../../lib'
import { toProgramRuleActionApiPayload } from './form/actions/transformers'
import type { ProgramRuleActionListItem } from './form/actions/types'
import { fieldFilters, ProgramRuleFormValues } from './form/fieldFilters'
import { ProgramRuleFormDescriptor } from './form/formDescriptor'
import { ProgramRuleFormFields } from './form/ProgramRuleFormFields'
import { validate } from './form/programRuleSchema'

const section = SECTIONS_MAP.programRule

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'programRules',
        id: clonedModelId,
        params: { fields: [...fieldFilters] },
    }
    const programRuleQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<ProgramRuleFormValues>,
    })

    const createRule = useCreateModel(section.namePlural)
    const createAction = useCreateModel('programRuleActions')
    const queryClient = useQueryClient()
    const navigate = useNavigateWithSearchState()
    const saveAlert = useAlert(
        ({ message }: { message: string }) => message,
        (options: { success?: boolean; error?: boolean }) => options
    )

    const onSubmit = useCallback(
        async (
            values: Omit<ProgramRuleFormValues, 'id'>,
            _form: unknown,
            options?: { submitAction?: 'save' | 'saveAndExit' }
        ) => {
            const allValues = values as Record<string, unknown>
            const programRuleActions = allValues.programRuleActions as
                | ProgramRuleActionListItem[]
                | undefined
            const ruleValues = omit(allValues, 'programRuleActions')

            const ruleResponse = await createRule(ruleValues)
            if (ruleResponse.error) {
                return createFormError(ruleResponse.error)
            }

            const responseData = ruleResponse.data as {
                response?: { uid?: string }
            }

            const newRuleId = responseData?.response?.uid
            // in the event that the new rule ID is not available, return to list
            if (!newRuleId) {
                saveAlert.show({
                    message: i18n.t(
                        'Program rule created but ID cannot be determined'
                    ),
                    success: false,
                })
                navigate(`/${getSectionPath(section)}`)
                return
            }

            let someActionsFailed = false
            if (newRuleId && programRuleActions?.length) {
                const actionResults = await Promise.allSettled(
                    programRuleActions.map((action) =>
                        createAction(
                            toProgramRuleActionApiPayload(
                                omit(action, 'id'),
                                newRuleId
                            )
                        )
                    )
                )
                someActionsFailed = actionResults.some(
                    (r) =>
                        r.status === 'rejected' ||
                        (r.status === 'fulfilled' && r.value.error)
                )
            }

            saveAlert.show(
                someActionsFailed
                    ? {
                          message: i18n.t(
                              'Some program rule actions failed to save'
                          ),
                          error: true,
                      }
                    : {
                          message: i18n.t('Created successfully'),
                          success: true,
                      }
            )
            queryClient.invalidateQueries({
                queryKey: [{ resource: section.namePlural }],
            })

            const submitAction = options?.submitAction ?? 'saveAndExit'
            if (submitAction === 'saveAndExit') {
                navigate(`/${getSectionPath(section)}`)
            } else if (submitAction === 'save' && newRuleId) {
                navigate(`/${getSectionPath(section)}/${newRuleId}`)
            }
        },
        [createRule, createAction, queryClient, navigate, saveAlert]
    )

    const initialValues = useMemo(
        () =>
            programRuleQuery.data
                ? omit(programRuleQuery.data, 'id')
                : undefined,
        [programRuleQuery.data]
    )

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            modelName={section.name}
            includeAttributes={false}
            validate={validate}
            fetchError={!!programRuleQuery.error}
            subscription={{}}
            mutators={{ ...arrayMutators }}
        >
            {({ handleSubmit }) => (
                <SectionedFormProvider
                    formDescriptor={ProgramRuleFormDescriptor}
                >
                    <SectionedFormLayout
                        sidebar={<DefaultSectionedFormSidebar />}
                    >
                        <DrawerRoot />
                        <form onSubmit={handleSubmit}>
                            <CloneNoticeBox section={section} />
                            <ProgramRuleFormFields />
                            <TriggerCloneValidation />
                            <DefaultFormFooter cancelTo="/programRules" />
                        </form>
                        <SectionedFormErrorNotice />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
