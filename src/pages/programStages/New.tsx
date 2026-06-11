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
import {
    initialStageValue,
    StageFormContents,
    StageFormDescriptor,
} from './form'
import { StageProgramField } from './StageProgramField'

const section = SECTIONS_MAP.programStage

export const Component = () => {
    return (
        <FormBase
            onSubmit={useOnSubmitNew({ section })}
            initialValues={initialStageValue}
            subscription={{}}
            mutators={{ ...arrayMutators }}
        >
            {({ handleSubmit }) => (
                <SectionedFormProvider formDescriptor={StageFormDescriptor}>
                    <SectionedFormLayout
                        sidebar={<DefaultSectionedFormSidebar />}
                    >
                        <form onSubmit={handleSubmit}>
                            <StageFormContents
                                programField={<StageProgramField />}
                            />
                            <DefaultFormFooter />
                        </form>
                        <SectionedFormErrorNotice />
                    </SectionedFormLayout>
                </SectionedFormProvider>
            )}
        </FormBase>
    )
}
