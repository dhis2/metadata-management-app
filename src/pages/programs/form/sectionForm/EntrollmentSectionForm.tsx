import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQuery } from '@tanstack/react-query'
import arrayMutators from 'final-form-arrays'
import React, { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { FormBase, FormBaseProps } from '../../../../components'
import { LoadingSpinner } from '../../../../components/loading/LoadingSpinner'
import {
    DEFAULT_FIELD_FILTERS,
    SchemaName,
    SchemaSection,
    useBoundResourceQueryFn,
    usePatchModel,
    createFormError,
    createJsonPatchOperations,
    useCreateModel,
} from '../../../../lib'
import {
    DisplayableModel,
    PickWithFieldFilters,
    Section,
} from '../../../../types/models'
import { EnrollmentSectionFormContents } from './EnrollmentSectionFormContents'
import { initialSectionValues } from './sectionFormSchema'

export const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    'name',
    'description',
    'renderType[MOBILE[type],DESKTOP[type]]',
    'trackedEntityAttributes[id,displayName]',
] as const

export const enrollmentSectionSchemaSection = {
    name: SchemaName.programSection,
    namePlural: 'programSections',
    title: i18n.t('Section'),
    titlePlural: i18n.t('Sections'),
    parentSectionKey: 'programs',
} satisfies SchemaSection

export type SectionFormValues = PickWithFieldFilters<
    Section,
    typeof fieldFilters
> & {
    program: { id: string }
}

type PartialSectionFormValues = Partial<SectionFormValues>
type SubmittedSectionFormValues = PartialSectionFormValues & DisplayableModel

export type EnrollmentSectionFormProps = {
    enrollmentSection?: PartialSectionFormValues
    onCancel?: () => void
    sortOrder?: number
} & Pick<FormBaseProps<PartialSectionFormValues>, 'onSubmit'>

export const EnrollmentSectionForm = ({
    enrollmentSection,
    onSubmit,
    onCancel,
    sortOrder,
}: EnrollmentSectionFormProps) => {
    const programId = useParams().id as string

    const initialValues: PartialSectionFormValues | undefined = useMemo(() => {
        if (enrollmentSection) {
            return enrollmentSection
        }
        return { ...initialSectionValues, sortOrder }
    }, [enrollmentSection, sortOrder])

    const valueFormatter = useCallback(
        (values: PartialSectionFormValues) => {
            return {
                ...values,
                program: { id: programId },
            }
        },
        [programId]
    )
    return (
        <FormBase
            initialValues={{ ...initialValues, program: { id: programId } }}
            onSubmit={onSubmit}
            valueFormatter={valueFormatter}
            includeAttributes={false}
            mutators={{ ...arrayMutators }}
        >
            <EnrollmentSectionFormContents onCancel={onCancel} />
        </FormBase>
    )
}

type OnFormSubmit = FormBaseProps<PartialSectionFormValues>['onSubmit']
export const EditEnrollmentSectionForm = ({
    section,
    onCancel,
    onSubmitted,
}: {
    section: DisplayableModel
    onCancel: () => void
    onSubmitted: (values: SubmittedSectionFormValues) => void
}) => {
    const handlePatch = usePatchModel(
        section.id,
        enrollmentSectionSchemaSection.namePlural
    )
    const { show: showSuccess } = useAlert(
        i18n.t('Enrollment section form saved'),
        {
            success: true,
        }
    )

    const onFormSubmit: OnFormSubmit = async (values, form) => {
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

        onSubmitted?.({
            ...values,
            id: section.id,
            displayName: resolvedDisplayName,
        })
        return undefined
    }

    const queryFn = useBoundResourceQueryFn()
    const sectionValues = useQuery({
        queryFn: queryFn<SectionFormValues>,
        queryKey: [
            {
                resource: 'programSections',
                id: section.id,
                params: {
                    fields: fieldFilters.concat(),
                },
            },
        ],
    })

    if (sectionValues.isLoading) {
        return <LoadingSpinner />
    }

    return (
        <EnrollmentSectionForm
            enrollmentSection={sectionValues.data}
            onSubmit={onFormSubmit}
            onCancel={onCancel}
        />
    )
}

export const NewEnrollmentSectionForm = ({
    onCancel,
    onSubmitted,
    sortOrder,
}: {
    onCancel: () => void
    onSubmitted: (values: SubmittedSectionFormValues) => void
    sortOrder: number
}) => {
    const handleCreate = useCreateModel(
        enrollmentSectionSchemaSection.namePlural
    )
    const { show: showSuccess } = useAlert(
        i18n.t('Enrollment section form saved'),
        {
            success: true,
        }
    )

    const onFormSubmit: OnFormSubmit = async (values) => {
        const res = await handleCreate(values)
        if (res.error) {
            return createFormError(res.error)
        }

        showSuccess({ success: true })

        const newId = (res.data as { response: { uid: string } }).response.uid

        onSubmitted?.({
            ...values,
            id: newId,
            displayName: values?.displayName || values.name || '',
        })
        return undefined
    }

    return (
        <EnrollmentSectionForm
            enrollmentSection={undefined}
            onSubmit={onFormSubmit}
            onCancel={onCancel}
            sortOrder={sortOrder}
        />
    )
}

export const EditOrNewEnrollmentSectionForm = ({
    section,
    onCancel,
    onSubmitted,
    sectionsLength,
}: {
    section: DisplayableModel | null | undefined
    onCancel: () => void
    onSubmitted: (values: SubmittedSectionFormValues) => void
    sectionsLength: number
}) => {
    if (section === undefined) {
        return
    }
    if (section === null) {
        return (
            <NewEnrollmentSectionForm
                onSubmitted={onSubmitted}
                onCancel={onCancel}
                sortOrder={sectionsLength}
            />
        )
    }

    return (
        <EditEnrollmentSectionForm
            section={section}
            onCancel={onCancel}
            onSubmitted={onSubmitted}
        />
    )
}
