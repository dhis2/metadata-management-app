import arrayMutators from 'final-form-arrays'
import React from 'react'
import {
    DefaultFormFooter,
    DefaultSectionedFormSidebar,
    FormBase,
    SectionedFormErrorNotice,
    SectionedFormLayout,
} from '../../components'
import { SectionedFormProvider, SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import { trackerProgramInitialValues, trackerProgramValidate } from './form'
import { TrackerProgramFormContents } from './form/trackerProgram/TrackerProgramFormContents'
import { TrackerProgramFormDescriptor } from './form/trackerProgram/trackerProgramFormDescriptor'

const section = SECTIONS_MAP.program

export const NewTrackerProgram = ({
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
            initialValues={trackerProgramInitialValues}
            validate={trackerProgramValidate}
            subscription={{}}
            mutators={{ ...arrayMutators }}
            section={section}
        >
            {({ handleSubmit }) => {
                return (
                    <SectionedFormProvider
                        formDescriptor={TrackerProgramFormDescriptor}
                    >
                        <SectionedFormLayout
                            sidebar={<DefaultSectionedFormSidebar />}
                            footer={footer}
                        >
                            <form onSubmit={handleSubmit}>
                                <TrackerProgramFormContents />
                                {!footer && <DefaultFormFooter />}
                            </form>
                            <SectionedFormErrorNotice />
                        </SectionedFormLayout>
                    </SectionedFormProvider>
                )
            }}
        </FormBase>
    )
}
