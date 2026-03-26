import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import arrayMutators from 'final-form-arrays'
import isEqual from 'lodash/isEqual'
import React, { useMemo } from 'react'
import { useFormState } from 'react-final-form'
import { useParams } from 'react-router-dom'
import {
    DrawerFormFooter,
    DrawerLayout,
    FormBase,
    FormBaseProps,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../../../components'
import { DrawerSectionedFormSidebar } from '../../../../components/drawer/DrawerSectionedFormSidebar'
import { Section } from '../../../../components/formCreators/SectionFormList'
import { LoadingSpinner } from '../../../../components/loading/LoadingSpinner'
import { useHandleOnSubmitEditFormDeletions } from '../../../../components/sectionedForm/useHandleOnSubmitEditFormDeletions'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    createFormError,
    createJsonPatchOperations,
    DEFAULT_FIELD_FILTERS,
    getAllAttributeValues,
    SchemaName,
    SchemaSection,
    SectionedFormProvider,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
    useCreateModel,
    useCustomAttributesQuery,
    usePatchModel,
} from '../../../../lib'
import {
    DisplayableModel,
    PickWithFieldFilters,
    ProgramStage,
} from '../../../../types/models'
import { StageFormContents } from './StageFormContents'
import { StageFormDescriptor } from './stageFormDescriptor'
import { initialStageValue } from './stageSchema'

export const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'description',
    'style[color,icon]',
    'enableUserAssignment',
    'featureType',
    'validationStrategy',
    'preGenerateUID',
    'executionDateLabel',
    'dueDateLabel',
    'programStageLabel',
    'eventLabel',
    'programStageSections[id,displayName]',
    'programStageDataElements[id,dataElement[id,displayName,valueType,optionSet],compulsory,displayInReports,allowFutureDate,skipAnalytics,skipSynchronization,renderType,sortOrder]',
    'dataEntryForm[id,displayName,htmlCode]',
    'repeatable',
    'standardInterval',
    'generatedByEnrollmentDate',
    'autoGenerateEvent',
    'openAfterEnrollment',
    'reportDateToUse',
    'minDaysFromStart',
    'hideDueDate',
    'periodType',
    'nextScheduleDate[id,displayName,valueType]',
    'blockEntryForm',
    'allowGenerateNextVisit',
    'remindCompleted',
] as const

export const stageSchemaSection = {
    name: SchemaName.programStage,
    namePlural: 'programStages',
    title: i18n.t('Stage'),
    titlePlural: i18n.t('Stages'),
    parentSectionKey: 'programs',
} satisfies SchemaSection

export type StageFormValuesFromFilters = PickWithFieldFilters<
    ProgramStage,
    typeof fieldFilters
> & {
    program: { id: string }
}

export type StageFormValues = Omit<
    StageFormValuesFromFilters,
    'programStageSections' | 'dataEntryForm'
> & {
    programStageSections: Section[]
    dataEntryForm: StageFormValuesFromFilters['dataEntryForm'] & {
        deleted?: boolean
    }
}

type PartialStageFormValues = Partial<StageFormValues>
export type SubmittedStageFormValues = PartialStageFormValues & DisplayableModel

const StageFormDrawerFooter = ({
    form,
    setCloseOnSubmit,
    onCancel,
    formContent,
}: {
    form: { submit: () => void }
    setCloseOnSubmit: (value: boolean) => void
    onCancel: () => void
    formContent: React.ReactNode
}) => {
    const { submitting } = useFormState({
        subscription: { submitting: true },
    })
    return (
        <DrawerLayout
            footer={
                <DrawerFormFooter
                    submitLabel={i18n.t('Save stage and close')}
                    saveLabel={i18n.t('Save stage')}
                    cancelLabel={i18n.t('Cancel')}
                    submitting={submitting ?? false}
                    onSubmitClick={() => {
                        setCloseOnSubmit(true)
                        form.submit()
                    }}
                    onSaveClick={() => {
                        setCloseOnSubmit(false)
                        form.submit()
                    }}
                    onCancelClick={onCancel}
                    infoMessage={i18n.t(
                        'Saving a stage does not save other changes to the program'
                    )}
                />
            }
        >
            {formContent}
        </DrawerLayout>
    )
}

type BaseOnSubmit = FormBaseProps<PartialStageFormValues>['onSubmit']

type OnSubmitWithClose = (
    values: Parameters<BaseOnSubmit>[0],
    form: Parameters<BaseOnSubmit>[1],
    options?: Parameters<BaseOnSubmit>[2],
    closeOnSubmit?: boolean
) => ReturnType<BaseOnSubmit>

export type StageFormProps = {
    stage?: PartialStageFormValues
    onCancel?: () => void
    onSubmit: OnSubmitWithClose
}

export const StageForm = ({ stage, onSubmit, onCancel }: StageFormProps) => {
    const programId = useParams().id as string
    const customAttributes = useCustomAttributesQuery({
        enabled: true,
    })
    const initialValues: PartialStageFormValues | undefined = useMemo(() => {
        const initialValues = stage ?? {
            ...initialStageValue,
            program: { id: programId },
        }

        const attributeValues = getAllAttributeValues(
            initialValues?.attributeValues ?? [],
            customAttributes.data ?? []
        )
        return { ...initialValues, attributeValues } as PartialStageFormValues
    }, [stage, programId, customAttributes])

    const closeOnSubmitRef = React.useRef(false)
    const setCloseOnSubmit = (value: boolean) => {
        closeOnSubmitRef.current = value
    }
    const [selectedSection, setSelectedSection] = React.useState<
        string | undefined
    >()

    return (
        <FormBase
            initialValuesEqual={isEqual}
            initialValues={initialValues}
            onSubmit={(values, form, options) =>
                onSubmit(values, form, options, closeOnSubmitRef.current)
            }
            includeAttributes={false}
            mutators={{ ...arrayMutators }}
        >
            {({ handleSubmit, form }) => {
                const formContent = (
                    <SectionedFormProvider formDescriptor={StageFormDescriptor}>
                        <SectionedFormLayout
                            sidebar={
                                <DrawerSectionedFormSidebar
                                    selectedSection={selectedSection}
                                />
                            }
                        >
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <StageFormContents
                                        isSubsection
                                        setSelectedSection={setSelectedSection}
                                    />
                                    <SectionedFormErrorNotice />
                                </div>
                            </form>
                            <SectionedFormErrorNotice />
                        </SectionedFormLayout>
                    </SectionedFormProvider>
                )

                if (!onCancel) {
                    return null
                }
                return (
                    <StageFormDrawerFooter
                        form={form}
                        setCloseOnSubmit={setCloseOnSubmit}
                        onCancel={onCancel}
                        formContent={formContent}
                    />
                )
            }}
        </FormBase>
    )
}

export const EditStageForm = ({
    stage,
    onCancel,
    onSubmitted,
}: {
    stage: DisplayableModel
    onCancel: () => void
    onSubmitted: (
        values: SubmittedStageFormValues,
        closeOnSubmit: boolean
    ) => void
}) => {
    const handlePatch = usePatchModel(stage.id, stageSchemaSection.namePlural)

    const queryFn = useBoundResourceQueryFn()
    const dataEngine = useDataEngine()
    const queryClient = useQueryClient()
    const { show: showSuccess } = useAlert(i18n.t('Stage form saved'), {
        success: true,
    })

    const stageValues = useQuery({
        queryFn: queryFn<StageFormValues>,
        queryKey: [
            {
                resource: 'programStages',
                id: stage.id,
                params: {
                    fields: fieldFilters.concat(),
                },
            },
        ],
    })

    const handleDeletions = useHandleOnSubmitEditFormDeletions(
        SECTIONS_MAP.programStage,
        'programStageSections',
        dataEngine,
        queryClient
    )

    const onFormSubmit: OnSubmitWithClose = async (
        values,
        form,
        c,
        closeOnSubmit?: boolean
    ) => {
        const formValues = form.getState().values
        const sections = formValues.programStageSections ?? []
        const dataEntryForm = formValues.dataEntryForm

        const { customFormDeleteResult, error } = await handleDeletions(
            sections,
            dataEntryForm
        )

        if (error) {
            return error
        }
        const nonDeletedProgramStageSections = sections.filter(
            (section) => !section.deleted
        )
        const trimmedValues = {
            ...values,
            programStageSections: nonDeletedProgramStageSections,
            dataEntryForm:
                customFormDeleteResult &&
                customFormDeleteResult?.[0]?.status !== 'rejected'
                    ? null
                    : values.dataEntryForm,
        } as Partial<StageFormValues>

        const jsonPatchOperations = createJsonPatchOperations({
            values: trimmedValues,
            dirtyFields: form.getState().dirtyFields,
            originalValue: form.getState().initialValues,
        })
        const response = await handlePatch(jsonPatchOperations)
        if (response.error) {
            return createFormError(response.error)
        }

        showSuccess({ success: true })
        if (
            nonDeletedProgramStageSections.length !==
            formValues.programStageSections?.length
        ) {
            form.change('programStageSections', nonDeletedProgramStageSections)
        }
        if (formValues.dataEntryForm?.deleted) {
            form.change('dataEntryForm', undefined)
        }

        const updatedName = jsonPatchOperations.find(
            (op) => op.path === '/name' && op.op === 'replace'
        )?.value as string | undefined
        const resolvedDisplayName =
            updatedName || values?.displayName || values.name || ''

        onSubmitted?.(
            {
                ...trimmedValues,
                id: stage.id,
                displayName: resolvedDisplayName,
            },
            closeOnSubmit ?? true
        )
        return undefined
    }

    if (stageValues.isLoading) {
        return <LoadingSpinner />
    }

    return (
        <StageForm
            stage={stageValues.data}
            onSubmit={onFormSubmit}
            onCancel={onCancel}
        />
    )
}

export const NewStageForm = ({
    onCancel,
    onSubmitted,
}: {
    onCancel: () => void
    onSubmitted: (
        values: SubmittedStageFormValues,
        closeOnSubmit: boolean
    ) => void
}) => {
    const handleCreate = useCreateModel(stageSchemaSection.namePlural)
    const onFormSubmit: OnSubmitWithClose = async (
        values,
        b,
        c,
        closeOnSubmit?: boolean
    ) => {
        const res = await handleCreate(values)
        if (res.error) {
            return createFormError(res.error)
        }
        const newId = (res.data as { response: { uid: string } }).response.uid
        onSubmitted?.(
            {
                ...values,
                id: newId,
                displayName: values?.displayName || values.name || '',
            },
            closeOnSubmit ?? true
        )
        return undefined
    }

    return (
        <StageForm
            stage={undefined}
            onSubmit={onFormSubmit}
            onCancel={onCancel}
        />
    )
}

export const EditOrNewStageForm = ({
    stage,
    onCancel,
    onSubmitted,
}: {
    stage: DisplayableModel | null | undefined
    onCancel: () => void
    onSubmitted: (
        values: SubmittedStageFormValues,
        closeOnSubmit: boolean
    ) => void
}) => {
    if (stage === undefined) {
        return null
    }

    if (stage === null) {
        return <NewStageForm onSubmitted={onSubmitted} onCancel={onCancel} />
    }

    return (
        <EditStageForm
            stage={stage}
            onCancel={onCancel}
            onSubmitted={onSubmitted}
        />
    )
}
