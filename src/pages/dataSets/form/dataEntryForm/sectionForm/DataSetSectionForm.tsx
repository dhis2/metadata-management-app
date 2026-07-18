import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQuery } from '@tanstack/react-query'
import arrayMutators from 'final-form-arrays'
import React, { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { FormBase, FormBaseProps } from '../../../../../components'
import { LoadingSpinner } from '../../../../../components/loading/LoadingSpinner'
import {
    DEFAULT_FIELD_FILTERS,
    SchemaName,
    SchemaSection,
    useBoundResourceQueryFn,
    usePatchModel,
    createFormError,
    createJsonPatchOperations,
    useCreateModel,
} from '../../../../../lib'
import {
    DisplayableModel,
    PickWithFieldFilters,
    Section,
} from '../../../../../types/models'
import { DataSetSectionFormContents } from './DataSetSectionFormContents'
import { initialSectionValues } from './sectionFormSchema'

export const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    'name',
    'description',
    'code',
    'indicators[id,displayName]',
    'showRowTotals',
    'showColumnTotals',
    'disableDataElementAutoGroup',
    'displayOptions',
    'dataElements[id,displayName,categoryCombo[id]]',
    'greyedFields[dataElement, categoryOptionCombo]',
    'attributeValues[value,attribute[id]]',
] as const

const dataSetSectionSchemaSection = {
    name: SchemaName.section,
    namePlural: 'sections',
    title: i18n.t('Section'),
    titlePlural: i18n.t('Sections'),
    parentSectionKey: 'dataSet',
} satisfies SchemaSection

export type SectionFormValues = Omit<
    PickWithFieldFilters<Section, typeof fieldFilters>,
    'dataElements'
> & {
    dataSet: { id: string }
    displayOptions?: string
    dataElements?: {
        id: string
        displayName: string
        categoryCombo?: { id: string }
    }[]
}
type PartialSectionFormValues = Partial<SectionFormValues>
type SubmittedSectionFormValues = PartialSectionFormValues & DisplayableModel

export type DataSetSectionFormProps = {
    dataSetSection?: PartialSectionFormValues
    onCancel?: () => void
} & Pick<FormBaseProps<PartialSectionFormValues>, 'onSubmit'>

export const DataSetSectionForm = ({
    dataSetSection,
    onSubmit,
    onCancel,
}: DataSetSectionFormProps) => {
    const dataSetId = useParams().id as string
    const initialValues: PartialSectionFormValues | undefined = useMemo(() => {
        if (dataSetSection) {
            return {
                ...dataSetSection,
                displayOptions:
                    dataSetSection?.displayOptions &&
                    (typeof dataSetSection.displayOptions === 'string'
                        ? JSON.parse(dataSetSection.displayOptions)
                        : dataSetSection.displayOptions),
            }
        }
        return {
            ...initialSectionValues,
            displayOptions:
                initialSectionValues?.displayOptions &&
                (typeof initialSectionValues.displayOptions === 'string'
                    ? JSON.parse(initialSectionValues.displayOptions)
                    : initialSectionValues.displayOptions),
        }
    }, [dataSetSection])

    const valueFormatter = useCallback(
        (values: PartialSectionFormValues) => {
            return {
                ...values,
                dataSet: { id: dataSetId },
                displayOptions:
                    values.displayOptions &&
                    JSON.stringify(values.displayOptions),
            }
        },
        [dataSetId]
    )
    return (
        <FormBase
            initialValues={{ ...initialValues, dataSet: { id: dataSetId } }}
            onSubmit={onSubmit}
            valueFormatter={valueFormatter}
            section={dataSetSectionSchemaSection}
            mutators={{ ...arrayMutators }}
        >
            <DataSetSectionFormContents onCancel={onCancel} />
        </FormBase>
    )
}

type OnDataSetFormSubmit = FormBaseProps<PartialSectionFormValues>['onSubmit']
export const EditDataSetSectionForm = ({
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
        dataSetSectionSchemaSection.namePlural
    )
    const { show: showSuccess } = useAlert(
        i18n.t('Data set section form saved'),
        {
            success: true,
        }
    )

    const onFormSubmit: OnDataSetFormSubmit = async (values, form) => {
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
                resource: 'sections',
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
        <DataSetSectionForm
            dataSetSection={sectionValues.data}
            onSubmit={onFormSubmit}
            onCancel={onCancel}
        />
    )
}

export const NewDataSetSectionForm = ({
    onCancel,
    onSubmitted,
}: {
    onCancel: () => void
    onSubmitted: (values: SubmittedSectionFormValues) => void
}) => {
    const handleCreate = useCreateModel(dataSetSectionSchemaSection.namePlural)
    const { show: showSuccess } = useAlert(
        i18n.t('Data set section form saved'),
        {
            success: true,
        }
    )

    const onFormSubmit: OnDataSetFormSubmit = async (values) => {
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
        <DataSetSectionForm
            dataSetSection={undefined}
            onSubmit={onFormSubmit}
            onCancel={onCancel}
        />
    )
}

export const EditOrNewDataSetSectionForm = ({
    section,
    onCancel,
    onSubmitted: onSubmit,
}: {
    section: DisplayableModel | null | undefined
    onCancel: () => void
    onSubmitted: (values: SubmittedSectionFormValues) => void
}) => {
    if (section === undefined) {
        return
    }
    if (section === null) {
        return (
            <NewDataSetSectionForm onSubmitted={onSubmit} onCancel={onCancel} />
        )
    }

    return (
        <EditDataSetSectionForm
            section={section}
            onCancel={onCancel}
            onSubmitted={onSubmit}
        />
    )
}
