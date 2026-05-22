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
    SectionedFormProvider,
    SECTIONS_MAP,
    useOnSubmitNew,
    useBoundResourceQueryFn,
} from '../../lib'
import {
    RelationshipTypeFormDescriptor,
    RelationshipTypeFormFields,
    RelationshipTypeFormValues,
    fieldFilters,
    validateRelationshipType,
} from './form'

const section = SECTIONS_MAP.relationshipType

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const query = {
        resource: 'relationshipTypes',
        id: clonedModelId,
        params: {
            fields: fieldFilters.concat(),
        },
    }
    const relationshipTypeQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<RelationshipTypeFormValues>,
    })

    const onSubmit = useOnSubmitNew<Omit<RelationshipTypeFormValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(
        () =>
            relationshipTypeQuery.data
                ? omit(relationshipTypeQuery.data, 'id')
                : undefined,
        [relationshipTypeQuery.data]
    )

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validateRelationshipType}
            fetchError={!!relationshipTypeQuery.error}
            subscription={{}}
        >
            {({ handleSubmit }) => (
                <SectionedFormProvider
                    formDescriptor={RelationshipTypeFormDescriptor}
                >
                    <SectionedFormLayout
                        sidebar={<DefaultSectionedFormSidebar />}
                    >
                        <form onSubmit={handleSubmit}>
                            <CloneNoticeBox section={section} />
                            <RelationshipTypeFormFields />
                            <TriggerCloneValidation />
                            <DefaultFormFooter cancelTo="/relationshipTypes" />
                        </form>
                        <SectionedFormErrorNotice />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
