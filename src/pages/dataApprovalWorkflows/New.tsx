import React from 'react'
import { FormBase } from '../../components'
import { DefaultNewFormContents } from '../../components/form/DefaultFormContents'
import { SECTIONS_MAP, useOnSubmitNew } from '../../lib'
import DataApprovalWorkflowFormFields from './form/DataApprovalWorkflowFormFields'
import { initialValues, validate } from './form/dataApprovalWorkflowSchema'

const section = SECTIONS_MAP.dataApprovalWorkflow

export const Component = () => {
    return (
        <FormBase
            onSubmit={useOnSubmitNew({ section })}
            initialValues={initialValues}
            validate={validate}
            includeAttributes={false}
        >
            <DefaultNewFormContents section={section}>
                <DataApprovalWorkflowFormFields />
            </DefaultNewFormContents>
        </FormBase>
    )
}
