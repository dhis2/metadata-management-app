import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    DefaultSectionedFormSidebar,
    CloneNoticeBox,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
    TriggerCloneValidation,
} from '../../components'
import { DefaultFormFooter } from '../../components/form/DefaultFormFooter'
import {
    FEATURES,
    SectionedFormProvider,
    SECTIONS_MAP,
    useFeatureAvailable,
    useOnSubmitNew,
} from '../../lib'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { fieldFilters } from './form/fieldFilters'
import { TrackedEntityAttributeFormDescriptor } from './form/formDescriptor'
import { TrackedEntityAttributeFormContents } from './form/TrackedEntityAttributeFormContents'
import {
    TrackedEntityAttributeFormValues,
    validate,
} from './form/TrackedEntityAttributeFormSchema'

const section = SECTIONS_MAP.trackedEntityAttribute

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string
    const isSearchPerformanceAvailable = useFeatureAvailable(
        FEATURES.searchPerformance
    )
    const formDescriptor = useMemo(() => {
        if (isSearchPerformanceAvailable) {
            return TrackedEntityAttributeFormDescriptor
        }
        return {
            ...TrackedEntityAttributeFormDescriptor,
            sections: TrackedEntityAttributeFormDescriptor.sections.filter(
                (s) => s.name !== 'searchPerformance'
            ),
        }
    }, [isSearchPerformanceAvailable])

    const query = {
        resource: 'trackedEntityAttributes',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const trackedEntityAttributeQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<TrackedEntityAttributeFormValues>,
    })

    const onSubmit = useOnSubmitNew<
        Omit<TrackedEntityAttributeFormValues, 'id'>
    >({
        section,
    })

    const initialValues = useMemo(
        () =>
            trackedEntityAttributeQuery.data
                ? omit(trackedEntityAttributeQuery.data, 'id')
                : undefined,
        [trackedEntityAttributeQuery.data]
    )

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            fetchError={!!trackedEntityAttributeQuery.error}
        >
            {({ handleSubmit }) => (
                <SectionedFormProvider formDescriptor={formDescriptor}>
                    <SectionedFormLayout
                        sidebar={<DefaultSectionedFormSidebar />}
                    >
                        <form onSubmit={handleSubmit}>
                            <CloneNoticeBox section={section} />
                            <TrackedEntityAttributeFormContents />
                            <TriggerCloneValidation />
                            <DefaultFormFooter />
                        </form>
                        <SectionedFormErrorNotice />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
