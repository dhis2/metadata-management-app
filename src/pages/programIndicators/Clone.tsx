import { useQuery } from '@tanstack/react-query'
import { omit } from 'lodash'
import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
    TriggerCloneValidation,
    CloneNoticeBox,
} from '../../components'
import { DefaultFormFooter } from '../../components/form/DefaultFormFooter'
import { SectionedFormProvider, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { generateDhis2Id } from '../../lib/models/uid'
import { useBoundResourceQueryFn } from '../../lib/query/useBoundQueryFn'
import { fieldFilters, ProgramIndicatorValues } from './form/fieldFilters'
import { ProgramIndicatorFormDescriptor } from './form/formDescriptor'
import { ProgramIndicatorsFormFields } from './form/ProgramIndicatorFormFields'
import { validate } from './form/programIndicatorsFormSchema'

const section = SECTIONS_MAP.programIndicator

export const Component = () => {
    const queryFn = useBoundResourceQueryFn()
    const [searchParams] = useSearchParams()
    const clonedModelId = searchParams.get('clonedId') as string

    const programIndicators = useQuery({
        queryFn: queryFn<ProgramIndicatorValues>,
        queryKey: [
            {
                resource: 'programIndicators',
                id: clonedModelId,
                params: {
                    fields: fieldFilters.concat(),
                },
            },
        ] as const,
    })

    const onSubmit = useOnSubmitNew<Omit<ProgramIndicatorValues, 'id'>>({
        section,
    })

    const initialValues = useMemo(() => {
        if (!programIndicators.data) {
            return undefined
        }
        const originalData = omit(programIndicators.data, 'id')
        const result = originalData.analyticsPeriodBoundaries
            ? {
                  ...originalData,
                  analyticsPeriodBoundaries:
                      originalData.analyticsPeriodBoundaries.map(
                          (boundary) => ({
                              ...(boundary as Record<string, unknown>),
                              id: generateDhis2Id(),
                          })
                      ),
              }
            : originalData
        return result as unknown as Omit<ProgramIndicatorValues, 'id'>
    }, [programIndicators.data])

    return (
        <FormBase
            onSubmit={onSubmit}
            initialValues={initialValues}
            validate={validate}
            subscription={{}}
            fetchError={!!programIndicators.error}
        >
            {({ handleSubmit }) => (
                <SectionedFormProvider
                    formDescriptor={ProgramIndicatorFormDescriptor}
                >
                    <SectionedFormLayout
                        sidebar={<DefaultSectionedFormSidebar />}
                    >
                        <form onSubmit={handleSubmit}>
                            <CloneNoticeBox section={section} />
                            <ProgramIndicatorsFormFields />
                            <TriggerCloneValidation />
                            <DefaultFormFooter cancelTo="/programIndicators" />
                        </form>
                        <SectionedFormErrorNotice />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
