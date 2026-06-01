import i18n from '@dhis2/d2-i18n'
import { InputFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import {
    CustomAttributesSection,
    DefaultIdentifiableFields,
    DescriptionField,
    GroupMembershipField,
    OrganisationUnitTreeWithToolbarFormField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../components'
import { DateField } from '../../../components/form/fields/DateField'
import { SECTIONS_MAP } from '../../../lib'

const section = SECTIONS_MAP.categoryOption

export const CategoryOptionFormFields = () => {
    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this category option.'
                    )}
                </StandardFormSectionDescription>
                <DefaultIdentifiableFields />

                <StandardFormField>
                    <Field
                        component={InputFieldFF}
                        dataTest="formfields-formname"
                        inputWidth="400px"
                        name="formName"
                        label={i18n.t('Form name')}
                        helpText={i18n.t(
                            'An alternative name used in data entry forms.'
                        )}
                        validateFields={[]}
                    />
                </StandardFormField>
                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>
            </StandardFormSection>

            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Availability configuration')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose when, and for which organisation units, this category option will be available.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <DateField name="startDate" label="Pick a start date" />
                </StandardFormField>
                <StandardFormField>
                    <DateField name="endDate" label="Pick an end date" />
                </StandardFormField>

                <StandardFormField>
                    <OrganisationUnitTreeWithToolbarFormField />
                </StandardFormField>
            </StandardFormSection>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Groups')}
                </StandardFormSectionTitle>

                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the groups this category option belongs to.'
                    )}
                </StandardFormSectionDescription>

                <StandardFormField>
                    <GroupMembershipField resource="categoryOptionGroups" />
                </StandardFormField>
            </StandardFormSection>

            <CustomAttributesSection schemaSection={section} />
        </>
    )
}
