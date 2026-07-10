import React from 'react'
import { SECTIONS_MAP, useOnSubmitNew, getSectionPath } from '../../lib'
import { ValidationNotificationTemplateFormValues } from './Edit'
import {
    ValidationNotificationTemplateFormFields,
    initialValues,
    validate,
} from './form'
import { SectionedFormWrapper } from './SectionedFormWrapper'

const section = SECTIONS_MAP.validationNotificationTemplate

export const Component = () => {
    return (
        <SectionedFormWrapper
            onSubmit={useOnSubmitNew({ section })}
            initialValues={
                initialValues as ValidationNotificationTemplateFormValues
            }
            validate={validate}
            cancelTo={`/${getSectionPath(section)}`}
        >
            <ValidationNotificationTemplateFormFields />
        </SectionedFormWrapper>
    )
}
