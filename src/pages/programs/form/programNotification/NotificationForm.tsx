import { useAlert, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQuery } from '@tanstack/react-query'
import arrayMutators from 'final-form-arrays'
import isEqual from 'lodash/isEqual'
import React, { useMemo } from 'react'
import { useField, useFormState } from 'react-final-form'
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
import { LoadingSpinner } from '../../../../components/loading/LoadingSpinner'
import {
    createFormError,
    createJsonPatchOperations,
    DEFAULT_FIELD_FILTERS,
    SchemaName,
    SchemaSection,
    SectionedFormProvider,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
    useCreateModel,
    usePatchModel,
} from '../../../../lib'
import {
    DisplayableModel,
    PickWithFieldFilters,
    ProgramNotificationTemplate,
} from '../../../../types/models'
import { DisplayableModelAndStageId } from '../common/ProgramNotificationsFormContents'
import { programNotificationFormDescriptor } from './programNotificationFormDescriptor'
import { ProgramNotificationsFormFields } from './ProgramNotificationsFormFields'
import { initialValues, validate } from './programNotificationTemplateSchema'

export const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    'name',
    'code',
    'subjectTemplate',
    'messageTemplate',
    'notificationRecipient',
    'notificationTrigger',
    'relativeScheduledDays',
    'deliveryChannels',
    'recipientUserGroup[id,displayName]',
    'notifyUsersInHierarchyOnly',
    'notifyParentOrganisationUnitOnly',
    'recipientProgramAttribute[id,displayName]',
    'recipientDataElement[id,displayName]',
    'sendRepeatable',
] as const

export const notificationSchemaSection = {
    name: SchemaName.programNotificationTemplate,
    namePlural: 'programNotificationTemplates',
    title: i18n.t('Notification'),
    titlePlural: i18n.t('Notifications'),
    parentSectionKey: 'programs',
} satisfies SchemaSection

export type NotificationFormValues = PickWithFieldFilters<
    ProgramNotificationTemplate,
    typeof fieldFilters
> & {
    program: { id: string }
    programStage?: { id: string }
}

type PartialNotificationFormValues = Partial<NotificationFormValues>
export type SubmittedNotificationFormValues = PartialNotificationFormValues &
    DisplayableModel

const NotificationFormDrawerFooter = ({
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
                    submitLabel={i18n.t('Save notification and close')}
                    saveLabel={i18n.t('Save notification')}
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
                        'Saving a notification does not save other changes to the program'
                    )}
                />
            }
        >
            {formContent}
        </DrawerLayout>
    )
}

type BaseOnSubmit = FormBaseProps<PartialNotificationFormValues>['onSubmit']

type OnSubmitWithClose = (
    values: Parameters<BaseOnSubmit>[0],
    form: Parameters<BaseOnSubmit>[1],
    options?: Parameters<BaseOnSubmit>[2],
    closeOnSubmit?: boolean
) => ReturnType<BaseOnSubmit>

export type NotificationFormProps = {
    isTrackerProgram: boolean
    programStageId: string | undefined
    notification?: PartialNotificationFormValues
    onCancel?: () => void
    onSubmit: OnSubmitWithClose
}

export const NotificationForm = ({
    isTrackerProgram,
    programStageId,
    notification,
    onSubmit,
    onCancel,
}: NotificationFormProps) => {
    const programId = useParams().id as string
    const initialNotificationValues: PartialNotificationFormValues | undefined =
        useMemo(() => {
            return {
                ...(notification ?? initialValues),
                program: { id: programId },
                ...(isTrackerProgram
                    ? {}
                    : { programStage: { id: programStageId } }),
            } as PartialNotificationFormValues
        }, [notification, programId, isTrackerProgram, programStageId])

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
            initialValues={initialNotificationValues}
            onSubmit={(values, form, options) =>
                onSubmit(values, form, options, closeOnSubmitRef.current)
            }
            includeAttributes={false}
            mutators={{ ...arrayMutators }}
            validate={validate}
        >
            {({ handleSubmit, form }) => {
                const formContent = (
                    <SectionedFormProvider
                        formDescriptor={programNotificationFormDescriptor}
                    >
                        <SectionedFormLayout
                            sidebar={
                                <DrawerSectionedFormSidebar
                                    selectedSection={selectedSection}
                                />
                            }
                        >
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <ProgramNotificationsFormFields
                                        setSelectedSection={setSelectedSection}
                                        isTrackerProgram={isTrackerProgram}
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
                    <NotificationFormDrawerFooter
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

export const EditNotificationForm = ({
    isTrackerProgram,
    programStageId,
    notification,
    onCancel,
    onSubmitted,
}: {
    isTrackerProgram: boolean
    programStageId: string | undefined
    notification: DisplayableModelAndStageId
    onCancel: () => void
    onSubmitted: (
        values: SubmittedNotificationFormValues,
        closeOnSubmit: boolean
    ) => void
}) => {
    const handlePatch = usePatchModel(
        notification.id,
        notificationSchemaSection.namePlural
    )

    const queryFn = useBoundResourceQueryFn()
    const { show: showSuccess } = useAlert(i18n.t('Notification form saved'), {
        success: true,
    })

    const notificationValues = useQuery({
        queryFn: queryFn<NotificationFormValues>,
        queryKey: [
            {
                resource: 'programNotificationTemplates',
                id: notification.id,
                params: {
                    fields: fieldFilters.concat(),
                },
            },
        ],
    })

    const onFormSubmit: OnSubmitWithClose = async (
        values,
        form,
        c,
        closeOnSubmit?: boolean
    ) => {
        const jsonPatchOperations = createJsonPatchOperations({
            values,
            dirtyFields: form.getState().dirtyFields,
            originalValue: form.getState().initialValues,
        })
        const response = await handlePatch(jsonPatchOperations)
        if (response.error) {
            return createFormError(response.error)
        }

        showSuccess({ success: true })

        const updatedName = jsonPatchOperations.find(
            (op) => op.path === '/name' && op.op === 'replace'
        )?.value as string | undefined
        const resolvedDisplayName =
            updatedName || values?.displayName || values.name || ''

        onSubmitted?.(
            {
                ...values,
                id: notification.id,
                displayName: resolvedDisplayName,
            },
            closeOnSubmit ?? true
        )
        return undefined
    }

    if (notificationValues.isLoading) {
        return <LoadingSpinner />
    }

    return (
        <NotificationForm
            notification={{
                ...notificationValues.data,
                programStage:
                    notification.stageId !== undefined
                        ? { id: notification.stageId }
                        : undefined,
            }}
            onSubmit={onFormSubmit}
            onCancel={onCancel}
            isTrackerProgram={isTrackerProgram}
            programStageId={programStageId}
        />
    )
}

export const NewNotificationForm = ({
    onCancel,
    onSubmitted,
    programNotificationList,
    stagesNotificationList,
    isTrackerProgram,
    programStageId,
}: {
    onCancel: () => void
    onSubmitted: (
        values: SubmittedNotificationFormValues,
        closeOnSubmit: boolean
    ) => void
    programNotificationList: { id: string }[]
    stagesNotificationList: Record<string, { id: string }[]>
    isTrackerProgram: boolean
    programStageId: string | undefined
}) => {
    const handleCreate = useCreateModel(notificationSchemaSection.namePlural)
    const engine = useDataEngine()

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

        if (values.program?.id) {
            const patchOperations = {
                type: 'json-patch',
                resource: values.programStage
                    ? SECTIONS_MAP.programStage.namePlural
                    : SECTIONS_MAP.program.namePlural,
                id: values.programStage
                    ? values.programStage.id
                    : values.program.id,
                data: [
                    {
                        op: 'replace',
                        path: '/notificationTemplates',
                        value: values.programStage
                            ? [
                                  ...stagesNotificationList[
                                      values.programStage.id
                                  ],
                                  { id: newId },
                              ]
                            : [...programNotificationList, { id: newId }],
                    },
                ],
            } as const
            try {
                await engine.mutate(patchOperations)
            } catch (error) {
                return createFormError(error)
            }
        }

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
        <NotificationForm
            notification={undefined}
            onSubmit={onFormSubmit}
            onCancel={onCancel}
            isTrackerProgram={isTrackerProgram}
            programStageId={programStageId}
        />
    )
}

export const EditOrNewNotificationForm = ({
    notification,
    onCancel,
    onSubmitted,
    programNotificationList,
    stagesNotificationList,
    isTrackerProgram,
}: {
    notification: DisplayableModelAndStageId | null | undefined
    onCancel: () => void
    onSubmitted: (
        values: SubmittedNotificationFormValues,
        closeOnSubmit: boolean
    ) => void
    programNotificationList: { id: string }[]
    stagesNotificationList: Record<string, { id: string }[]>
    isTrackerProgram: boolean
}) => {
    const { input } = useField('programStages')
    const programStageId = isTrackerProgram ? undefined : input?.value?.[0]?.id

    if (notification === undefined) {
        return null
    }

    if (notification === null) {
        return (
            <NewNotificationForm
                onSubmitted={onSubmitted}
                onCancel={onCancel}
                programNotificationList={programNotificationList}
                stagesNotificationList={stagesNotificationList}
                isTrackerProgram={isTrackerProgram}
                programStageId={programStageId}
            />
        )
    }

    return (
        <EditNotificationForm
            notification={notification}
            onCancel={onCancel}
            onSubmitted={onSubmitted}
            isTrackerProgram={isTrackerProgram}
            programStageId={programStageId}
        />
    )
}
