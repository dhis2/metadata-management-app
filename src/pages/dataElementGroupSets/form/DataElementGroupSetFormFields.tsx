import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    CustomAttributesSection,
    StandardFormSection,
    StandardFormSectionTitle,
    StandardFormSectionDescription,
    StandardFormField,
} from '../../../components'
import {
    DefaultIdentifiableFields,
    DescriptionField,
} from '../../../components/form'
import { SCHEMA_SECTIONS } from '../../../lib'
import {
    CompulsoryField,
    DataDimensionField,
    DataElementGroupsField,
} from '../fields'

const section = SCHEMA_SECTIONS.dataElementGroupSet

export function DataElementGroupSetFormFields() {
    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>

                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the information for this data element group set.'
                    )}
                </StandardFormSectionDescription>

                <DefaultIdentifiableFields section={section} />

                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>

                <StandardFormField>
                    <CompulsoryField />
                </StandardFormField>

                <StandardFormField>
                    <DataDimensionField />
                </StandardFormField>
            </StandardFormSection>

            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Data element groups')}
                </StandardFormSectionTitle>

                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the data element groups to include in this data element group set.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <DataElementGroupsField />
                </StandardFormField>
            </StandardFormSection>

            <CustomAttributesSection schemaSection={section} />
        </>
    )
}
