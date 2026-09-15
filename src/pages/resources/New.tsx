import i18n from '@dhis2/d2-i18n'
import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP } from '../../lib'
import {
    ResourceFormFields,
    ResourceSubmitValues,
    resourceNewInitialValues,
    useOnSubmitResource,
    validateResourceForm,
} from './form'

const section = SECTIONS_MAP.document

export const Component = () => {
    const onSubmit = useOnSubmitResource({
        successMessage: i18n.t('Resource created successfully'),
    })

    return (
        <FormBase
            initialValues={resourceNewInitialValues as ResourceSubmitValues}
            onSubmit={onSubmit}
            validate={validateResourceForm}
        >
            <DefaultNewFormContents section={section}>
                <ResourceFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}
