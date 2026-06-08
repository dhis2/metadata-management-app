import i18n from '@dhis2/d2-i18n'
import { InputFieldFF, TextAreaFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field as FieldRFF } from 'react-final-form'
import {
    CustomAttributesSection,
    ModelTransferField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
    DefaultIdentifiableFields,
    DescriptionField,
} from '../../../components'
import { DateField } from '../../../components/form/fields/DateField'
import { SECTIONS_MAP, useSystemSetting } from '../../../lib'
import { GeometryFields } from './GeometryFields'
import { ImageField } from './ImageField'
import { OrganisationUnitSelector } from './OrganisationUnitSelector'

export function OrganisationUnitFormField() {
    const allowReferenceAssignments = useSystemSetting(
        'keyAllowObjectAssignment'
    )

    const section = SECTIONS_MAP.organisationUnit

    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    <label htmlFor="parent">
                        {i18n.t('Placement in hierarchy')}
                    </label>
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose where this organisation unit is positioned in the hierarchy.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <OrganisationUnitSelector />
                </StandardFormField>
            </StandardFormSection>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>

                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this organisation unit.'
                    )}
                </StandardFormSectionDescription>
                <DefaultIdentifiableFields />
                <StandardFormField>
                    <DateField
                        name="openingDate"
                        label={i18n.t('Opening date')}
                        required
                    />
                </StandardFormField>
                <StandardFormField>
                    <DateField
                        name="closedDate"
                        label={i18n.t('Closed date')}
                    />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF<string | undefined>
                        component={TextAreaFieldFF}
                        inputWidth="400px"
                        label={i18n.t('Comment')}
                        name="comment"
                    />
                </StandardFormField>
                <StandardFormField>
                    <ImageField />
                </StandardFormField>
                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF<string | undefined>
                        component={InputFieldFF}
                        inputWidth="400px"
                        label={i18n.t('Contact person')}
                        name="contactPerson"
                    />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF<string | undefined>
                        component={InputFieldFF}
                        inputWidth="400px"
                        label={i18n.t('Address')}
                        name="address"
                    />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF<string | undefined>
                        component={InputFieldFF}
                        inputWidth="400px"
                        label={i18n.t('Email')}
                        name="email"
                        type="email"
                    />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF<string | undefined>
                        component={InputFieldFF}
                        inputWidth="400px"
                        label={i18n.t('Phone number')}
                        name="phoneNumber"
                        type="tel"
                    />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF<string | undefined>
                        component={InputFieldFF}
                        inputWidth="400px"
                        label={i18n.t('URL')}
                        name="url"
                        type="url"
                    />
                </StandardFormField>
            </StandardFormSection>

            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Location')}
                </StandardFormSectionTitle>

                <StandardFormSectionDescription>
                    {i18n.t('Set up the organisation unit location.')}
                </StandardFormSectionDescription>
                <GeometryFields />
            </StandardFormSection>
            {allowReferenceAssignments && (
                <StandardFormSection>
                    <StandardFormSectionTitle>
                        {i18n.t('Reference assignment')}
                    </StandardFormSectionTitle>
                    <StandardFormSectionDescription>
                        {i18n.t(
                            'Assign the organisation unit to related objects.'
                        )}
                    </StandardFormSectionDescription>
                    <StandardFormField>
                        <ModelTransferField
                            name="dataSets"
                            query={{
                                resource: 'dataSets',
                            }}
                            transferSection={SECTIONS_MAP.dataSet}
                            maxSelections={Infinity}
                        />
                    </StandardFormField>
                    <StandardFormField>
                        <ModelTransferField
                            name="programs"
                            query={{
                                resource: 'programs',
                            }}
                            leftHeader={i18n.t('Available programs')}
                            rightHeader={i18n.t('Selected programs')}
                            filterPlaceholder={i18n.t(
                                'Filter available programs'
                            )}
                            filterPlaceholderPicked={i18n.t(
                                'Filter selected programs'
                            )}
                            maxSelections={Infinity}
                            leftFooter={<></>}
                        />
                    </StandardFormField>
                </StandardFormSection>
            )}

            <CustomAttributesSection schemaSection={section} />
        </>
    )
}
