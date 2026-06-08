import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    StandardFormSection,
    StandardFormSectionTitle,
    StandardFormSectionDescription,
    StandardFormField,
    CustomAttributesSection,
} from '../../../components'
import {
    DefaultIdentifiableFields,
    DescriptionField,
} from '../../../components/form'
import { SCHEMA_SECTIONS } from '../../../lib'
import { DataElementsField } from '../fields'

const section = SCHEMA_SECTIONS.dataElementGroup

export function DataElementGroupFormFields() {
    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>

                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the information for this data element group.'
                    )}
                </StandardFormSectionDescription>

                <DefaultIdentifiableFields section={section} />

                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>
            </StandardFormSection>

            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Data elements')}
                </StandardFormSectionTitle>

                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the data elements to include in this data element group.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <DataElementsField />
                </StandardFormField>
            </StandardFormSection>

            <CustomAttributesSection schemaSection={section} />
        </>
    )
}
