import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    CloneNoticeBox,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
    TriggerCloneValidation,
} from '../../components'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    DEFAULT_FIELD_FILTERS,
    SectionedFormProvider,
    SECTIONS_MAP,
    useOnSubmitNew,
    useBoundResourceQueryFn,
} from '../../lib'
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
    'shortName',
    'description',
    'style[color,icon]',
    'allowAuditLog',
    'minAttributesRequiredToSearch',
    'maxTeiCountToReturn',
    'featureType',
    'trackedEntityTypeAttributes[trackedEntityAttribute[id,displayName,unique,valueType],mandatory,searchable,displayInList]',
] as const

type TrackedEntityTypeFormValues = PickWithFieldFilters<
    TrackedEntityType,
    typeof fieldFilters
> & { id: string }

const section = SECTIONS_MAP.trackedEntityType

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'trackedEntityTypes',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const trackedEntityTypeQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<TrackedEntityTypeFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<TrackedEntityTypeFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(
        () =>
            trackedEntityTypeQuery.data
                ? omit(trackedEntityTypeQuery.data, 'id')
                : undefined,
        [trackedEntityTypeQuery.data]
    )

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validateTrackedEntityType}
            fetchError={!!trackedEntityTypeQuery.error}
        >
            {({ handleSubmit }) => (
                <SectionedFormProvider
                    formDescriptor={TrackedEntityTypeFormDescriptor}
                >
                    <SectionedFormLayout
                        sidebar={<DefaultSectionedFormSidebar />}
                    >
                        <form onSubmit={handleSubmit}>
                            <CloneNoticeBox section={section} />
                            <TrackedEntityTypeFormFields />
                            <TriggerCloneValidation />
                            <DefaultFormFooter cancelTo="/trackedEntityTypes" />
                        </form>
                        <SectionedFormErrorNotice />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
