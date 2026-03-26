import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Box, Button, NoticeBox, SingleSelectFieldFF } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useRef } from 'react'
import { Field, useForm, useFormState } from 'react-final-form'
import {
    FormBase,
    FormBaseProps,
    FormFooterWrapper,
    SectionedFormErrorNotice,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../../components'
import { LoadingSpinner } from '../../../../components/loading/LoadingSpinner'
import {
    createFormError,
    createJsonPatchOperations,
    SchemaName,
    SchemaSection,
    useBoundResourceQueryFn,
    useCreateModel,
    usePatchModel,
} from '../../../../lib'
import {
    FEATURES,
    useFeatureAvailable,
} from '../../../../lib/featuresApiSupport'
import { useClearFormFields } from '../../../../lib/form/useClearFormFields'
import { ProgramRuleAction } from '../../../../types/generated'
import { PriorityField } from '../../fields'
import { ActionTypeFieldsContent } from './ActionTypeFieldsContent'
import { ACTION_FIELDS_TO_CLEAR, ACTION_TYPE_OPTIONS } from './constants'
import styles from './ProgramRuleActionForm.module.css'
import { toProgramRuleActionApiPayload } from './transformers'
import type {
    ProgramRuleActionListItem,
    ProgramRuleActionFormValues,
} from './types'
import { validateProgramRuleAction } from './validation'

const actionFieldFilters = [
    'id',
    'programRuleActionType',
    'priority',
    'content',
    'data',
    'location',
    'templateUid',
    'dataElement[id,displayName]',
    'trackedEntityAttribute[id,displayName]',
    'programRuleVariable[id,displayName]',
    'programStage[id,displayName]',
    'programStageSection[id,displayName]',
    'option[id,displayName]',
    'optionGroup[id,displayName]',
] as const

export const actionsSchemaSection = {
    name: SchemaName.programRuleAction,
    namePlural: 'programRuleActions',
    title: i18n.t('Action'),
    titlePlural: i18n.t('Actions'),
    parentSectionKey: 'programs',
} satisfies SchemaSection

export const ProgramRuleActionForm = ({
    programId,
    programType,
    action,
    onCancel,
    onSubmit,
}: Readonly<{
    programId?: string
    programType?: string
    action: ProgramRuleActionListItem | null
    onCancel: () => void
    onSubmit: FormBaseProps<ProgramRuleActionFormValues>['onSubmit']
}>) => {
    const initialValues = action ?? ({} as ProgramRuleActionFormValues)

    return (
        <FormBase
            key={action?.id ?? 'new'}
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validateProgramRuleAction}
            validateOnBlur={false}
            includeAttributes={false}
        >
            <ProgramRuleActionFormBody
                action={action}
                onCancel={onCancel}
                programId={programId}
                programType={programType}
            />
        </FormBase>
    )
}

export const EditProgramRuleActionForm = ({
    action,
    programId,
    programType,
    onCancel,
    onSubmitted,
}: {
    action: ProgramRuleActionListItem
    programId?: string
    programType?: string
    onCancel: () => void
    onSubmitted: (values: ProgramRuleActionListItem) => void
}) => {
    const queryFn = useBoundResourceQueryFn()
    const handlePatch = usePatchModel(
        action.id,
        actionsSchemaSection.namePlural
    )

    const { show: showSuccess } = useAlert(
        i18n.t('Program rule action saved'),
        { success: true }
    )

    const actionValues = useQuery({
        queryFn: queryFn<ProgramRuleActionFormValues>,
        queryKey: [
            {
                resource: 'programRuleActions',
                id: action.id,
                params: {
                    fields: actionFieldFilters.concat(),
                },
            },
        ],
    })

    const onFormSubmit: FormBaseProps<ProgramRuleActionFormValues>['onSubmit'] =
        async (values, form) => {
            const jsonPatchOperations = createJsonPatchOperations({
                values: values,
                dirtyFields: form.getState().dirtyFields,
                originalValue: form.getState().initialValues,
            })
            const response = await handlePatch(jsonPatchOperations)
            if (response.error) {
                return createFormError(response.error)
            }

            showSuccess({ success: true })
            onSubmitted({
                ...values,
                id: action.id,
            } as ProgramRuleActionListItem)
            return undefined
        }

    if (actionValues.isLoading) {
        return <LoadingSpinner />
    }

    const actionData = actionValues.data ?? action

    return (
        <ProgramRuleActionForm
            programId={programId}
            programType={programType}
            action={actionData as ProgramRuleActionListItem}
            onCancel={onCancel}
            onSubmit={onFormSubmit}
        />
    )
}

export const NewProgramRuleActionForm = ({
    programId,
    programType,
    programRuleId,
    onCancel,
    onSubmitted,
}: {
    programId?: string
    programType?: string
    programRuleId: string
    onCancel: () => void
    onSubmitted: (values: ProgramRuleActionListItem) => void
}) => {
    const handleCreate = useCreateModel('programRuleActions')

    const onFormSubmit: FormBaseProps<ProgramRuleActionFormValues>['onSubmit'] =
        async (values) => {
            const res = await handleCreate(
                toProgramRuleActionApiPayload(values, programRuleId)
            )
            if (res.error) {
                return createFormError(res.error)
            }
            const newId = (res.data as { response: { uid: string } }).response
                .uid
            onSubmitted({
                ...values,
                id: newId,
            } as ProgramRuleActionListItem)
            return undefined
        }

    return (
        <ProgramRuleActionForm
            programId={programId}
            programType={programType}
            action={null}
            onCancel={onCancel}
            onSubmit={onFormSubmit}
        />
    )
}

export const EditOrNewProgramRuleActionForm = ({
    action,
    programId,
    programType,
    programRuleId,
    onCancel,
    onSubmitted,
}: {
    action: ProgramRuleActionListItem | null | undefined
    programId?: string
    programType?: string
    programRuleId: string
    onCancel: () => void
    onSubmitted: (values: ProgramRuleActionListItem) => void
}) => {
    if (action === undefined) {
        return null
    }

    if (action === null) {
        return (
            <NewProgramRuleActionForm
                programId={programId}
                programType={programType}
                programRuleId={programRuleId}
                onCancel={onCancel}
                onSubmitted={onSubmitted}
            />
        )
    }

    return (
        <EditProgramRuleActionForm
            action={action}
            programId={programId}
            programType={programType}
            onCancel={onCancel}
            onSubmitted={onSubmitted}
        />
    )
}

function ProgramRuleActionFormBody({
    action,
    onCancel,
    programId,
    programType,
}: Readonly<{
    action: ProgramRuleActionListItem | null
    onCancel: () => void
    programId?: string
    programType?: string
}>) {
    const form = useForm()
    const clearActionFields = useClearFormFields(
        form,
        ...ACTION_FIELDS_TO_CLEAR
    )
    const { values } = useFormState({ subscription: { values: true } })
    const actionType = (values as ProgramRuleActionFormValues)
        .programRuleActionType
    const previousActionTypeRef = useRef<string | undefined>(undefined)

    const isEventProgram = programType === 'WITHOUT_REGISTRATION'

    const filteredActionTypeOptions = React.useMemo(() => {
        if (!isEventProgram) {
            return ACTION_TYPE_OPTIONS
        }
        return ACTION_TYPE_OPTIONS.filter(
            (option) => option.value !== 'SCHEDULEEVENT'
        )
    }, [isEventProgram])

    useEffect(() => {
        if (
            previousActionTypeRef.current !== undefined &&
            previousActionTypeRef.current !== actionType
        ) {
            clearActionFields()
        }
        previousActionTypeRef.current = actionType
    }, [actionType, clearActionFields])

    const isEdit = !!action
    const priorityFieldAvailable = useFeatureAvailable(
        FEATURES.programRuleActionPriority
    )

    return (
        <div className={styles.sectionsWrapper}>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {isEdit ? i18n.t('Edit action') : i18n.t('Add action')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t('Configure the program rule action.')}
                </StandardFormSectionDescription>
                {(actionType ===
                    ProgramRuleAction.programRuleActionType.SCHEDULEMESSAGE ||
                    actionType ===
                        ProgramRuleAction.programRuleActionType.SENDMESSAGE) &&
                    !isEdit && (
                        <NoticeBox
                            title={i18n.t(
                                'This program rule action will not be editable after saving.'
                            )}
                            className={styles.nonEditableNoticeBox}
                        />
                    )}

                <StandardFormField>
                    <Field name="programRuleActionType">
                        {({ input, meta }) => (
                            <Box width="400px" minWidth="100px">
                                <SingleSelectFieldFF
                                    input={input}
                                    meta={meta}
                                    label={i18n.t('Action type (required)')}
                                    options={filteredActionTypeOptions}
                                    required
                                    filterable
                                />
                            </Box>
                        )}
                    </Field>
                </StandardFormField>

                {priorityFieldAvailable && (
                    <StandardFormField>
                        <PriorityField />
                    </StandardFormField>
                )}

                {programId && (
                    <ActionTypeFieldsContent
                        programId={programId}
                        isEdit={isEdit}
                        actionType={actionType}
                    />
                )}
            </StandardFormSection>

            <SectionedFormErrorNotice />

            <FormFooterWrapper>
                <Button primary type="submit">
                    {isEdit ? i18n.t('Save action') : i18n.t('Add action')}
                </Button>
                <Button secondary onClick={onCancel}>
                    {i18n.t('Cancel')}
                </Button>
            </FormFooterWrapper>
        </div>
    )
}
