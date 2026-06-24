import React from 'react'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import { SectionedFormProvider, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import {
    initialTrackedEntityTypeValues,
    validateTrackedEntityType,
    TrackedEntityTypeFormDescriptor,
    TrackedEntityTypeFormFields,
} from './form'

const section = SECTIONS_MAP.trackedEntityType

export const Component = ({
    onSubmitted,
    footer,
    redirectOnSubmitted = true,
}: {
    readonly onSubmitted?: () => void
    readonly footer?: React.ReactNode
    readonly redirectOnSubmitted?: boolean
} = {}) => {
    return (
        <FormBase
            onSubmit={useOnSubmitNew({
                section,
                onSubmitted,
                redirectOnSubmitted,
            })}
            initialValues={initialTrackedEntityTypeValues}
            validate={validateTrackedEntityType}
            subscription={{}}
            section={section}
        >
            {({ handleSubmit }) => {
                return (
                    <SectionedFormProvider
                        formDescriptor={TrackedEntityTypeFormDescriptor}
                    >
                        <SectionedFormLayout
                            sidebar={<DefaultSectionedFormSidebar />}
                            footer={footer}
                        >
                            <form onSubmit={handleSubmit}>
                                <TrackedEntityTypeFormFields />
                                {!footer && (
                                    <DefaultFormFooter cancelTo="/trackedEntityTypes" />
                                )}
                            </form>
                            <SectionedFormErrorNotice />
                        </SectionedFormLayout>
                    </SectionedFormProvider>
                )
            }}
        </FormBase>
    )
}
