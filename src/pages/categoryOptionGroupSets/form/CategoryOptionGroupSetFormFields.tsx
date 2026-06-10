import i18n from '@dhis2/d2-i18n'
import { RadioFieldFF, CheckboxFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field } from 'react-final-form'
import {
    CustomAttributesSection,
    DefaultIdentifiableFields,
    DescriptionField,
    HorizontalFieldGroup,
    ModelTransferField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../components'
import { SECTIONS_MAP } from '../../../lib'

function CategoryOptionGroupSetFormFields() {
    const section = SECTIONS_MAP.categoryOptionGroupSet
    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this category option group set.'
                    )}
                </StandardFormSectionDescription>
                <DefaultIdentifiableFields section={section} />
                <DescriptionField />
            </StandardFormSection>

            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Category option group set usage')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose how this category option group set will be used to capture and analyze data.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <HorizontalFieldGroup
                        label={'Type'}
                        required
                        dataTest="formfields-dataDimensionType"
                    >
                        <Field<string | undefined>
                            name="dataDimensionType"
                            component={RadioFieldFF}
                            label={i18n.t('Disaggregation')}
                            type="radio"
                            value={'DISAGGREGATION'}
                        />
                        <Field<string | undefined>
                            name="dataDimensionType"
                            component={RadioFieldFF}
                            label={i18n.t('Attribute')}
                            type="radio"
                            value={'ATTRIBUTE'}
                        />
                    </HorizontalFieldGroup>
                </StandardFormField>
                <StandardFormField>
                    <Field
                        name="dataDimension"
                        type="checkbox"
                        component={CheckboxFieldFF}
                        label={i18n.t(
                            'Show as data dimension in analytics apps'
                        )}
                    />
                </StandardFormField>
            </StandardFormSection>

            <StandardFormSection>
                <StandardFormSectionTitle>
                    <label htmlFor={'categoryOptionGroups'}>
                        {i18n.t('Category option groups')}
                    </label>
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the category option groups to include in this category option group set.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <StandardFormField>
                        <ModelTransferField
                            name="categoryOptionGroups"
                            query={{
                                resource: 'categoryOptionGroups',
                            }}
                            transferSection={SECTIONS_MAP.categoryOptionGroup}
                            enableOrderChange={true}
                            maxSelections={Infinity}
                        />
                    </StandardFormField>
                </StandardFormField>
            </StandardFormSection>
            <CustomAttributesSection schemaSection={section} />
        </>
    )
}

export default CategoryOptionGroupSetFormFields
