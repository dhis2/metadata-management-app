import i18n from '@dhis2/d2-i18n'
import React from 'react'
import {
    CustomAttributesSection,
    DefaultIdentifiableFields,
    DescriptionField,
    OrganisationUnitField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../components'
import { SECTIONS_MAP } from '../../../lib'

export const OrganisationalUnitGroupFormFields = () => {
    const section = SECTIONS_MAP.organisationUnitGroup

    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this organisation unit group.'
                    )}
                </StandardFormSectionDescription>
                <DefaultIdentifiableFields section={section} />
                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>
            </StandardFormSection>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    <label htmlFor={'organisationUnitGroups'}>
                        {i18n.t('Organisation units')}
                    </label>
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the organisation units to include in this group.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <OrganisationUnitField label={''} />
                </StandardFormField>
            </StandardFormSection>
            <CustomAttributesSection schemaSection={section} />
        </>
    )
}
