import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import arrayMutators from 'final-form-arrays'
import { omit } from 'lodash'
import React, { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    DrawerRoot,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import { Section } from '../../components/formCreators/SectionFormList'
import { useHandleOnSubmitEditFormDeletions } from '../../components/sectionedForm/useHandleOnSubmitEditFormDeletions'
import {
    createFormError,
    createJsonPatchOperations,
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    DEFAULT_FIELD_FILTERS,
    parseErrorResponse,
    SectionedFormProvider,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
    useOnSubmitEdit,
} from '../../lib'
import { EnhancedOnSubmit } from '../../lib/form/useOnSubmit'
import { DataEngine, JsonPatchOperation } from '../../types'
import { PickWithFieldFilters, Program } from '../../types/generated'
import {
    eventProgramInitialValues as programFormInitialValues,
    eventProgramValidate,
} from './form'
import { EventProgramFormContents } from './form/eventProgram/EventProgramFormContents'
import { EventProgramFormDescriptor } from './form/eventProgram/eventProgramFormDescriptor'
import {
    StageFormValues,
    stageSchemaSection,
} from './form/programStage/StageForm'
import { ProgramStageListItem } from './form/trackerProgram/ProgramStagesFormContents'

const fieldFilters = [
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    ...DEFAULT_FIELD_FILTERS,
    'programType',
    'name',
    'shortName',
    'code',
    'description',
    'version',
    'featureType',
    'categoryCombo[id,displayName]',
    'style[color,icon]',
    'incidentDateLabel',
    'programStages[id,name,displayName,enableUserAssignment,blockEntryForm,preGenerateUID,validationStrategy,notificationTemplates[id,name,displayName,access],dataEntryForm[id,displayName,htmlCode],programStageDataElements[id,dataElement[id,displayName,valueType,optionSet],compulsory,allowProvidedElsewhere,displayInReports,allowFutureDate,skipAnalytics,skipSynchronization,renderType,sortOrder],programStageSections[id,displayName,dataElements[id]]]',
    'organisationUnits[id,displayName,path]',
    'sharing',
    'expiryDays',
    'expiryPeriodType',
    'completeEventsExpiryDays',
    'openDaysAfterCoEndDate',
] as const

export type ProgramsFromFilters = PickWithFieldFilters<
    Program,
    typeof fieldFilters
>

export type ProgramValues = Omit<ProgramsFromFilters, 'sections'> & {
    sections: Section[]
    programStages: ProgramStageListItem[]
    dataEntryForm: DataEntryForm | null
}

type DataEntryForm = {
    id: string
    displayName: string
    htmlCode: string
}

const section = SECTIONS_MAP.program

export const programValueFormatter = <TValues extends Partial<ProgramValues>>(
    values: TValues
) => {
    return omit(values, 'programSections')
}

const handleStageNotificationDeletions = async ({
    stages,
    dataEngine,
}: {
    stages: ProgramStageListItem[]
    dataEngine: DataEngine
}): Promise<string[]> => {
    // stage notification templates marked for deletion
    const notificationTemplatesToDelete = stages.flatMap(
        (stage) =>
            stage.notificationTemplates?.filter(
                (template) => template.deleted
            ) ?? []
    )

    if (notificationTemplatesToDelete.length === 0) {
        return []
    }

    const notificationTemplateDeletionResults = await Promise.allSettled(
        notificationTemplatesToDelete.map((template) =>
            dataEngine.mutate({
                resource: 'programNotificationTemplates',
                id: template.id,
                type: 'delete',
            })
        )
    )

    const notificationDeletedFailures = notificationTemplateDeletionResults
        .filter((result) => result.status === 'rejected')
        .map(
            (_failure, index) =>
                notificationTemplatesToDelete?.[index]?.displayName ?? ''
        )

    return notificationDeletedFailures
}

export const useOnSubmitProgramEdit = (modelId: string) => {
    const submitEdit: EnhancedOnSubmit<ProgramValues> = useOnSubmitEdit({
        section,
        modelId,
    })
    const dataEngine = useDataEngine()
    const queryClient = useQueryClient()

    const handleStagePatch = useCallback(
        async (operations: JsonPatchOperation[], id: string) => {
            try {
                const response = await dataEngine.mutate(
                    {
                        resource: stageSchemaSection.namePlural,
                        id: id,
                        type: 'json-patch',
                        data: ({ operations }: Record<string, string>) =>
                            operations,
                    } as const,
                    {
                        variables: { operations },
                    }
                )
                return { data: response }
            } catch (error) {
                return { error: parseErrorResponse(error) }
            }
        },
        [dataEngine]
    )

    const handleDeletions = useHandleOnSubmitEditFormDeletions(
        SECTIONS_MAP.programStage,
        'programStageSections',
        dataEngine,
        queryClient
    )

    return useMemo<EnhancedOnSubmit<ProgramValues>>(
        () => async (values, form, options) => {
            const stages: ProgramStageListItem[] = values.programStages
            // const notificationTemplates: ProgramNotificationListItem[] =
            //     formValues.notificationTemplates

            const stageNotificationTemplateDeleteFailures =
                await handleStageNotificationDeletions({
                    stages,
                    dataEngine,
                })

            if (stageNotificationTemplateDeleteFailures.length > 0) {
                await queryClient.invalidateQueries({
                    queryKey: [{ resource: 'programNotificationTemplates' }],
                })
                return createFormError({
                    message: i18n.t(
                        'There was an error updating notification templates for some stages: {{stagesNames}}',
                        {
                            stagesNames:
                                stageNotificationTemplateDeleteFailures.join(
                                    ', '
                                ),
                            nsSeparator: '~-~',
                        }
                    ),
                })
            }
            const stageValues = values
                .programStages?.[0] as Partial<StageFormValues>
            const sections = stageValues.programStageSections || []
            const dataEntryForm = stageValues.dataEntryForm

            const { error } = await handleDeletions(sections, dataEntryForm)

            if (error) {
                return error
            }

            const stageFieldPrefix = 'programStages[0].'
            const stageDirtyFields = Object.fromEntries(
                Object.keys(form.getState().dirtyFields)
                    .filter((field) => field.startsWith(stageFieldPrefix))
                    .map((field) => [
                        field.slice(stageFieldPrefix.length),
                        true,
                    ])
            )

            if (Object.keys(stageDirtyFields).length > 0) {
                const trimmedStageValues = {
                    ...stageValues,
                    programStageSections:
                        stageValues.programStageSections?.filter(
                            (s) => !s.deleted
                        ),
                    dataEntryForm:
                        stageValues.dataEntryForm &&
                        !stageValues.dataEntryForm.deleted
                            ? stageValues.dataEntryForm
                            : null,
                }

                const stageJsonPatchOperations = createJsonPatchOperations({
                    values: trimmedStageValues,
                    dirtyFields: stageDirtyFields,
                    originalValue: form.getState().initialValues.programStages,
                })
                const response = await handleStagePatch(
                    stageJsonPatchOperations,
                    stageValues.id!
                )
                if (response.error) {
                    return createFormError(response.error)
                }
            }

            const trimmedValues = {
                ...values,
                programStages: stages.map((stage) => ({ id: stage.id })),
                // notificationTemplates: notificationTemplates.filter(
                //     (nTemplate) => !nTemplate.deleted
                // ),
            } as ProgramValues

            return submitEdit(trimmedValues, form, options)
        },
        [submitEdit, handleStagePatch, dataEngine, queryClient, handleDeletions]
    )
}

export const EditEventProgram = () => {
    const queryFn = useBoundResourceQueryFn()
    const modelId = useParams().id as string

    const program = useQuery({
        queryFn: queryFn<ProgramValues>,
        queryKey: [
            {
                resource: 'programs',
                id: modelId,
                params: {
                    fields: fieldFilters.concat(),
                },
            },
        ] as const,
    })

    const onSubmit = useOnSubmitProgramEdit(modelId)

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={program?.data ?? programFormInitialValues}
            subscription={{}}
            mutators={{ ...arrayMutators }}
            validate={eventProgramValidate}
        >
            {({ handleSubmit }) => {
                return (
                    <SectionedFormProvider
                        formDescriptor={EventProgramFormDescriptor}
                    >
                        <SectionedFormLayout
                            sidebar={<DefaultSectionedFormSidebar />}
                        >
                            <form onSubmit={handleSubmit}>
                                <EventProgramFormContents />
                                <DefaultFormFooter />
                            </form>
                            <DrawerRoot />
                            <SectionedFormErrorNotice />
                        </SectionedFormLayout>
                    </SectionedFormProvider>
                )
            }}
        </FormBase>
    )
}
