import { useAlert, useDataEngine } from '@dhis2/app-runtime'
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
    generateDhis2Id,
    getSectionPath,
    SectionedFormProvider,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
    useCreateModel,
    useNavigateWithSearchState,
} from '../../lib'
// import { toProgramRuleActionApiPayload } from './form/actions/transformers'
// import type { ProgramRuleActionListItem } from './form/actions/types'
import { fieldFilters, DataSetValues } from './Edit'
import { fieldFilters as sectionFieldFilters } from './form/dataEntryForm/sectionForm/DataSetSectionForm'
import { DataSetFormContents } from './form/DataSetFormContents'
import { validate } from './form/dataSetFormSchema'
import { DataSetFormDescriptor } from './form/formDescriptor'
// import { ProgramRuleFormFields } from './form/ProgramRuleFormFields'
// import { validate } from './form/programRuleSchema'
import { dataSetValueFormatter } from './New'

const section = SECTIONS_MAP.dataSet

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'dataSets',
        id: clonedModelId,
        params: {
            fields: [
                ...fieldFilters,
                `sections[${sectionFieldFilters.join(',')}]`,
            ],
        },
    }
    const dataSetQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<DataSetValues>,
    })

    const createDataSet = useCreateModel(section.namePlural)
    const createDataSetSection = useCreateModel('sections')
    const dataEngine = useDataEngine()
    const queryClient = useQueryClient()
    const navigate = useNavigateWithSearchState()
    const saveAlert = useAlert(
        ({ message }: { message: string }) => message,
        (options: { success?: boolean; error?: boolean }) => options
    )

    const initialValues = useMemo(
        () => (dataSetQuery.data ? omit(dataSetQuery.data, 'id') : undefined),
        [dataSetQuery.data]
    )
    const dataSetSections = useMemo(
        () => initialValues?.sections,
        [initialValues]
    )

    const onSubmit = useCallback(
        async (
            values: Omit<DataSetValues, 'id' | 'sections'>,
            _form: unknown,
            options?: { submitAction?: 'save' | 'saveAndExit' }
        ) => {
            const allValues = values as Record<string, unknown>
            const dataEntryForm = allValues.dataEntryForm
                ? {
                      ...allValues.dataEntryForm,
                      id: generateDhis2Id(),
                      name: allValues.name,
                  }
                : undefined

            const dataSetValuesWithoutFormInfo = omit(allValues, [
                'sections',
                'dataEntryForm',
            ])

            // save the data set (without sections or custom form)
            const dataSetResponse = await createDataSet(
                dataSetValuesWithoutFormInfo
            )
            if (dataSetResponse.error) {
                return createFormError(dataSetResponse.error)
            }

            const responseData = dataSetResponse.data as {
                response?: { uid?: string }
            }

            const newDataSetId = responseData?.response?.uid
            // in the event that the new rule ID is not available, return to list
            if (!newDataSetId) {
                saveAlert.show({
                    message: i18n.t(
                        'Data set created but ID cannot be determined'
                    ),
                    success: false,
                })
                navigate(`/${getSectionPath(section)}`)
                return
            }

            // then handle saving of sections
            let someSectionsFailed = false
            let dataEntryFormFailed = false
            if (newDataSetId && dataSetSections?.length) {
                const sectionsResults = await Promise.allSettled(
                    dataSetSections.map((section) =>
                        createDataSetSection({
                            ...omit(section, 'id'),
                            dataSet: { id: newDataSetId },
                        })
                    )
                )
                someSectionsFailed = sectionsResults.some(
                    (r) =>
                        r.status === 'rejected' ||
                        (r.status === 'fulfilled' && r.value.error)
                )
            }

            // then handle saving of custom form

            if (dataEntryForm) {
                try {
                    await dataEngine.mutate({
                        resource: `dataSets/${newDataSetId}/form`,
                        type: 'create',
                        data: dataEntryForm,
                    })
                } catch (e) {
                    console.error(e)
                    dataEntryFormFailed = true
                }
            }

            saveAlert.show(
                someSectionsFailed || dataEntryFormFailed
                    ? {
                          message: dataEntryFormFailed
                              ? i18n.t('Data entry form failed to save')
                              : i18n.t('Some data set sections failed to save'),
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
            } else if (submitAction === 'save' && newDataSetId) {
                navigate(`/${getSectionPath(section)}/${newDataSetId}`)
            }
        },
        [
            createDataSet,
            createDataSetSection,
            queryClient,
            navigate,
            saveAlert,
            dataSetSections,
            dataEngine,
        ]
    )

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            section={section}
            includeAttributes={false}
            validate={validate}
            fetchError={!!dataSetQuery.error}
            subscription={{}}
            mutators={{ ...arrayMutators }}
            valueFormatter={dataSetValueFormatter}
        >
            {({ handleSubmit }) => (
                <SectionedFormProvider formDescriptor={DataSetFormDescriptor}>
                    <SectionedFormLayout
                        sidebar={<DefaultSectionedFormSidebar />}
                    >
                        <DrawerRoot />
                        <form onSubmit={handleSubmit}>
                            <CloneNoticeBox section={section} />
                            <DataSetFormContents />
                            <TriggerCloneValidation />
                            <DefaultFormFooter
                                cancelTo={`/${getSectionPath(section)}`}
                            />
                        </form>
                        <SectionedFormErrorNotice />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
