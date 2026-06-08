import i18n from '@dhis2/d2-i18n'
import { CheckboxFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field as FieldRFF } from 'react-final-form'
import {
    CustomAttributesSection,
    DefaultIdentifiableFields,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionTitle,
    StandardFormSectionDescription,
    DescriptionField,
    ModelTransferField,
} from '../../../components'
import { SECTIONS_MAP } from '../../../lib'

export const OrganisationalUnitGroupSetFormFields = () => {
    const section = SECTIONS_MAP.organisationUnitGroupSet

    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this organisation unit group set.'
                    )}
                </StandardFormSectionDescription>
                <DefaultIdentifiableFields section={section} />
                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF
                        component={CheckboxFieldFF}
                        name="compulsory"
                        label={i18n.t(
                            'Compulsory: all organisation units must belong to at least one group in this group set.',
                            { nsSeparator: '~:~' }
                        )}
                        type="checkbox"
                        validateFields={[]}
                    />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF
                        component={CheckboxFieldFF}
                        name="dataDimension"
                        label={i18n.t(
                            'Show as data dimension in analytics apps'
                        )}
                        type="checkbox"
                        validateFields={[]}
                    />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF
                        component={CheckboxFieldFF}
                        name="includeSubhierarchyInAnalytics"
                        label={i18n.t(
                            'Inherit parent organisation unit groups'
                        )}
                        helpText={i18n.t(
                            'Use the closest parent’s group when an organisation unit has no group assigned.'
                        )}
                        type="checkbox"
                        validateFields={[]}
                    />
                </StandardFormField>
            </StandardFormSection>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    <label htmlFor={'organisationUnitGroups'}>
                        {i18n.t('Organisation unit groups')}
                    </label>
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the groups to include in this organisation unit group set.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <StandardFormField>
                        <ModelTransferField
                            name="organisationUnitGroups"
                            query={{
                                resource: 'organisationUnitGroups',
                                params: {
                                    filter: ['name:ne:default'],
                                },
                            }}
                            transferSection={SECTIONS_MAP.organisationUnitGroup}
                            maxSelections={Infinity}
                        />
                    </StandardFormField>
                </StandardFormField>
            </StandardFormSection>
            <CustomAttributesSection schemaSection={section} />
        </>
    )
}
