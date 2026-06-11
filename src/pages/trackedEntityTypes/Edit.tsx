import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    DEFAULT_FIELD_FILTERS,
    SectionedFormProvider,
    SECTIONS_MAP,
    useOnSubmitEdit,
    useBoundResourceQueryFn,
} from '../../lib'
import { EnhancedOnSubmit } from '../../lib/form/useOnSubmit'
import { PickWithFieldFilters, TrackedEntityType } from '../../types/generated'
import {
    TrackedEntityTypeFormDescriptor,
    TrackedEntityTypeFormFields,
    validateTrackedEntityType,
} from './form'
const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'trackedEntityTypesLabel',
    'shortName',
    'description',
    'style[color,icon]',
    'allowAuditLog',
    'minAttributesRequiredToSearch',
    'maxTeiCountToReturn',
    'featureType',
    'trackedEntityTypeAttributes[trackedEntityAttribute[id,displayName,unique,valueType],mandatory,searchable,displayInList]',
] as const

export type TrackedEntityTypeFormValues = PickWithFieldFilters<
    TrackedEntityType,
    typeof fieldFilters
> & { id: string }

type Program = {
    id: string
    displayName: string
}

export const Component = () => {
    const section = SECTIONS_MAP.trackedEntityType
    const queryFn = useBoundResourceQueryFn()
    const modelId = useParams().id as string
    const submitEdit = useOnSubmitEdit<TrackedEntityTypeFormValues>({
        modelId,
        section,
    })
    const saveAlert = useAlert(
        ({ message }) => message,
        (options) => options
    )

    const query = {
        resource: 'trackedEntityTypes',
        id: modelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const trackedEntityType = useQuery({
        queryKey: [query],
        queryFn: queryFn<TrackedEntityTypeFormValues>,
    })

    const programsQuery = useQuery({
        queryKey: [
            {
                resource: 'programs',
                params: {
                    fields: 'id,displayName',
                    filter: `trackedEntityType.id:eq:${modelId}`,
                    paging: false,
                },
            },
        ] as const,
        queryFn: queryFn<{ programs?: Program[] }>,
        enabled: !!modelId,
    })

    const onSubmit = useMemo<EnhancedOnSubmit<TrackedEntityTypeFormValues>>(
        () => async (values, form, options) => {
            const dirtyFields = form.getState().dirtyFields

            const hasAttributeChanges = Object.keys(dirtyFields).some((key) =>
                key.startsWith('trackedEntityTypeAttributes')
            )

            if (!hasAttributeChanges) {
                return submitEdit(values, form, options)
            }

            const programs = programsQuery.data?.programs || []
            if (programs.length) {
                const programNames = programs
                    .map((p: Program) => p.displayName)
                    .join(', ')
                saveAlert.show({
                    message: i18n.t(
                        'After changing the tracked entity type attributes, you may need to update the following program(s): {{programNames}}.',
                        {
                            programNames,
                            interpolation: { escapeValue: false },
                            nsSeparator: '~:~',
                        }
                    ),
                    warning: true,
                })
            }

            return submitEdit(values, form, options)
        },
        [submitEdit, saveAlert, programsQuery.data]
    )

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={trackedEntityType.data}
            validate={validateTrackedEntityType}
        >
            {({ handleSubmit }) => {
                return (
                    <SectionedFormProvider
                        formDescriptor={TrackedEntityTypeFormDescriptor}
                    >
                        <SectionedFormLayout
                            sidebar={<DefaultSectionedFormSidebar />}
                        >
                            <form onSubmit={handleSubmit}>
                                <TrackedEntityTypeFormFields />
                                <DefaultFormFooter cancelTo="/trackedEntityTypes" />
                            </form>
                            <SectionedFormErrorNotice />
                        </SectionedFormLayout>
                    </SectionedFormProvider>
                )
            }}
        </FormBase>
    )
}
