import i18n from '@dhis2/d2-i18n'
import { useQuery } from '@tanstack/react-query'
import arrayMutators from 'final-form-arrays'
import React, { useCallback, useMemo } from 'react'
import { useForm, useFormState } from 'react-final-form'
import { useParams } from 'react-router-dom'
import {
    DrawerFormFooter,
    DrawerLayout,
    FormBase,
    FormBaseProps,
    SectionedFormErrorNotice,
    SectionedFormSection,
    SectionedFormSections,
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
    CustomAttributesSection,
} from '../../../../components'
import {
    NameFieldWithAdditionalUniquenessConstraint,
    DescriptionField,
    ColorAndIconField,
} from '../../../../components/form/fields'
import { LoadingSpinner } from '../../../../components/loading/LoadingSpinner'
import {
    SchemaName,
    SchemaSection,
    useBoundResourceQueryFn,
    usePatchModel,
    createFormError,
    createJsonPatchOperations,
    useCreateModel,
    ATTRIBUTE_VALUES_FIELD_FILTERS,
} from '../../../../lib'
import { Option } from '../../../../types/generated'
import { PickWithFieldFilters } from '../../../../types/models'
import { OptionCodeField } from './OptionCodeField'
import { initialOptionValues } from './optionSchema'
import { DrawerState } from './OptionsListTable'

export const OptionFormContents = ({
    editCodeDisabled,
    onCancel,
}: {
    editCodeDisabled: boolean
    onCancel?: (s: DrawerState) => void
}) => {
    const form = useForm()
    const optionId = useParams().id as string
    const { submitting, values } = useFormState({
        subscription: { submitting: true, values: true },
    })

    const handleCancel = () => {
        onCancel?.({ open: false, id: undefined })
    }

    const formFieldsContent = (
        <>
            <SectionedFormSections>
                <SectionedFormSection name="optionEdit">
                    <StandardFormSectionTitle>
                        {i18n.t('Option')}
                    </StandardFormSectionTitle>
                    <StandardFormSectionDescription>
                        {i18n.t('Set up the information for this option.')}
                    </StandardFormSectionDescription>
                    <StandardFormField>
                        <NameFieldWithAdditionalUniquenessConstraint
                            schemaSection={optionSchemaSection}
                            modelId={values.id}
                            additionalNameUniquenessConstraint={
                                optionId
                                    ? `optionSet.id:eq:${optionId}`
                                    : undefined
                            }
                        />
                    </StandardFormField>
                    <StandardFormField>
                        <OptionCodeField
                            schemaSection={optionSchemaSection}
                            modelId={values.id}
                            required={true}
                            disabled={editCodeDisabled}
                            additionalCodeUniquenessConstraint={
                                optionId
                                    ? `optionSet.id:eq:${optionId}`
                                    : undefined
                            }
                        />
                    </StandardFormField>

                    <StandardFormField>
                        <DescriptionField />
                    </StandardFormField>
                    <StandardFormField>
                        <ColorAndIconField />
                    </StandardFormField>
                </SectionedFormSection>
                <CustomAttributesSection schemaSection={optionSchemaSection} />
            </SectionedFormSections>
            <SectionedFormErrorNotice />
        </>
    )

    if (!onCancel) {
        return null
    }
    return (
        <DrawerLayout
            footer={
                <DrawerFormFooter
                    submitLabel={i18n.t('Save option')}
                    cancelLabel={i18n.t('Cancel')}
                    submitting={submitting ?? false}
                    onSubmitClick={() => form.submit()}
                    onCancelClick={handleCancel}
                    infoMessage={i18n.t(
                        'Saving an option does not save other changes to the option set'
                    )}
                />
            }
        >
            {formFieldsContent}
        </DrawerLayout>
    )
}

export const fieldFilters = [
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'code',
    'description',
    'style[color,icon]',
    'id',
] as const

const optionSchemaSection = {
    name: SchemaName.option,
    namePlural: 'options',
    title: i18n.t('Option'),
    titlePlural: i18n.t('Options'),
    parentSectionKey: 'other',
} satisfies SchemaSection

export type OptionFormValues = PickWithFieldFilters<
    Option,
    typeof fieldFilters
> & {
    optionSet?: { id: string }
}

export type SubmittedOptionFormValues = Partial<OptionFormValues>

type OptionFormProps = {
    option?: SubmittedOptionFormValues
    onSubmit: FormBaseProps<SubmittedOptionFormValues>['onSubmit']
    onCancel: (s: DrawerState) => void
}

export const OptionForm = ({ option, onSubmit, onCancel }: OptionFormProps) => {
    const optionSetId = useParams().id as string

    const initialValues: SubmittedOptionFormValues | undefined = useMemo(() => {
        const startingInitialValues =
            option ?? (initialOptionValues as SubmittedOptionFormValues)
        return { ...startingInitialValues, optionSet: { id: optionSetId } }
    }, [option, optionSetId])

    const valueFormatter = useCallback(
        (values: SubmittedOptionFormValues) => {
            return {
                ...values,
                optionSet: { id: optionSetId },
            }
        },
        [optionSetId]
    )

    return (
        <FormBase
            modelName={optionSchemaSection.name}
            initialValues={initialValues}
            onSubmit={onSubmit}
            valueFormatter={valueFormatter}
            includeAttributes={true}
            mutators={{ ...arrayMutators }}
        >
            <OptionFormContents
                onCancel={onCancel}
                editCodeDisabled={!!option}
            />
        </FormBase>
    )
}

type OnOptionFormSubmit = FormBaseProps<SubmittedOptionFormValues>['onSubmit']
export const EditOptionForm = ({
    option,
    onCancel,
    onSubmitted,
}: {
    option: string | undefined
    onCancel: () => void
    onSubmitted: (values: SubmittedOptionFormValues) => void
}) => {
    const handlePatch = usePatchModel(
        option ?? '',
        optionSchemaSection.namePlural
    )

    const onFormSubmit: OnOptionFormSubmit = async (values, form) => {
        const jsonPatchOperations = createJsonPatchOperations({
            values,
            dirtyFields: form.getState().dirtyFields,
            originalValue: form.getState().initialValues,
        })
        const response = await handlePatch(jsonPatchOperations)
        if (response.error) {
            return createFormError(response.error)
        }

        onSubmitted?.(values)
        return undefined
    }

    const queryFn = useBoundResourceQueryFn()
    const optionValues = useQuery({
        queryFn: queryFn<OptionFormValues>,
        queryKey: [
            {
                resource: 'options',
                id: option,
                params: {
                    fields: fieldFilters.concat(),
                },
            },
        ],
    })

    if (!option) {
        return null
    }

    if (optionValues.isLoading) {
        return <LoadingSpinner />
    }

    return (
        <OptionForm
            option={optionValues.data}
            onSubmit={onFormSubmit}
            onCancel={onCancel}
        />
    )
}

export const NewOptionForm = ({
    onCancel,
    onSubmitted,
}: {
    onCancel: () => void
    onSubmitted: (values: SubmittedOptionFormValues) => void
}) => {
    const handleCreate = useCreateModel(optionSchemaSection.namePlural)

    const onFormSubmit: OnOptionFormSubmit = async (values) => {
        const res = await handleCreate(values)
        if (res.error) {
            return createFormError(res.error)
        }
        const newId = (res.data as { response: { uid: string } }).response.uid

        onSubmitted?.({
            ...values,
            id: newId,
        })
        return undefined
    }

    return (
        <OptionForm
            option={undefined}
            onSubmit={onFormSubmit}
            onCancel={onCancel}
        />
    )
}

export const EditOrNewOptionForm = ({
    option,
    onCancel,
    onSubmitted: onSubmit,
}: {
    option: string | undefined
    onCancel: (s: DrawerState) => void
    onSubmitted: (values: SubmittedOptionFormValues) => void
}) => {
    const handleCancel = () => {
        onCancel({ open: false, id: undefined })
    }

    if (option === undefined) {
        return <NewOptionForm onSubmitted={onSubmit} onCancel={handleCancel} />
    }

    return (
        <EditOptionForm
            option={option}
            onCancel={handleCancel}
            onSubmitted={onSubmit}
        />
    )
}
