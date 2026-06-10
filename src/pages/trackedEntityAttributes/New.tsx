import React, { useMemo } from 'react'
import {
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import { DefaultFormFooter } from '../../components/form/DefaultFormFooter'
import {
    FEATURES,
    SectionedFormProvider,
    SECTIONS_MAP,
    useFeatureAvailable,
    useOnSubmitNew,
} from '../../lib'
import { initialValues, validate } from './form'
import { TrackedEntityAttributeFormDescriptor } from './form/formDescriptor'
import { TrackedEntityAttributeFormContents } from './form/TrackedEntityAttributeFormContents'

const section = SECTIONS_MAP.trackedEntityAttribute

export const Component = ({
    onSubmitted,
    footer,
    redirectOnSubmitted = true,
}: {
    readonly onSubmitted?: () => void
    readonly footer?: React.ReactNode
    readonly redirectOnSubmitted?: boolean
} = {}) => {
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

    return (
        <FormBase
            onSubmit={useOnSubmitNew({
                section,
                onSubmitted,
                redirectOnSubmitted,
            })}
            initialValues={initialValues}
            validate={validate}
            section={section}
        >
            {({ handleSubmit }) => {
                return (
                    <SectionedFormProvider formDescriptor={formDescriptor}>
                        <SectionedFormLayout
                            sidebar={<DefaultSectionedFormSidebar />}
                        >
                            <form onSubmit={handleSubmit}>
                                <TrackedEntityAttributeFormContents />
                                {footer ?? <DefaultFormFooter />}
                            </form>
                            <SectionedFormErrorNotice />
                        </SectionedFormLayout>
                    </SectionedFormProvider>
                )
            }}
        </FormBase>
    )
}
