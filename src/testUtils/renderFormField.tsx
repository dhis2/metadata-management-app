import { render, RenderResult } from '@testing-library/react'
import React from 'react'
import { Form } from 'react-final-form'
import { ModelSchemas } from '../lib'
import { useSchemaStore } from '../lib/schemas/schemaStore'
import { SchemaSection } from '../types'
import TestComponentWithRouter, { CustomData } from './TestComponentWithRouter'

export const renderFormField = ({
    schemaSection,
    mockSchema,
    initialValues = {},
    customData = {},
    children,
}: {
    schemaSection: SchemaSection
    mockSchema: Record<string, unknown>
    initialValues?: Record<string, unknown>
    customData?: CustomData
    children: React.ReactNode
}): RenderResult => {
    useSchemaStore.getState().setSchemas({
        [schemaSection.name]: mockSchema,
    } as unknown as ModelSchemas)

    return render(
        <TestComponentWithRouter path="/test" customData={customData}>
            <Form onSubmit={jest.fn()} initialValues={initialValues}>
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>{children}</form>
                )}
            </Form>
        </TestComponentWithRouter>
    )
}
