import React from 'react'
import {
    Section,
    useGivenShemaOrSchemaSectionHandleOrThrow,
} from '../../../lib'
import { StandardFormField } from '../../standardForm'
import { CodeField } from './CodeField'
import { NameField } from './NameField'
import { ShortNameField } from './ShortNameField'

export const DefaultIdentifiableFields = ({
    section,
}: {
    section?: Section
}) => {
    const schemaSection = useGivenShemaOrSchemaSectionHandleOrThrow({ section })

    return (
        <>
            <StandardFormField>
                <NameField schemaSection={schemaSection} />
            </StandardFormField>

            <StandardFormField>
                <ShortNameField schemaSection={schemaSection} />
            </StandardFormField>

            <StandardFormField>
                <CodeField schemaSection={schemaSection} />
            </StandardFormField>
        </>
    )
}
