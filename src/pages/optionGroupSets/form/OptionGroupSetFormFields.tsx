import i18n from '@dhis2/d2-i18n'
import { CheckboxFieldFF, NoticeBox } from '@dhis2/ui'
import React from 'react'
import { Field as FieldRFF, useField } from 'react-final-form'
import { useParams } from 'react-router-dom'
import {
    CodeField,
    DescriptionField,
    ModelTransferField,
    NameField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../components'
import { ModelSingleSelectRefreshableFormField } from '../../../components/metadataFormControls/ModelSingleSelect/ModelSingleSelectRefreshableField'
import { useSchemaSectionHandleOrThrow, SECTIONS_MAP } from '../../../lib'
import styles from './OptionGroupSetFormFields.module.css'

function OptionGroupSetFormFields() {
    const { input: optionSetInput } = useField('optionSet')
    const optionSetId = optionSetInput?.value?.id
    const { input: optionGroupsInput } = useField('optionGroups')
    const optionGroupSetId = useParams().id
    const isEdit = !!optionGroupSetId
    const schemaSection = useSchemaSectionHandleOrThrow()

    return (
        <>
            <StandardFormSection>
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this option group set.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <NameField schemaSection={schemaSection} />
                </StandardFormField>
                <StandardFormField>
                    <CodeField schemaSection={schemaSection} />
                </StandardFormField>
                <StandardFormField>
                    <DescriptionField />
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF
                        component={CheckboxFieldFF}
                        name="dataDimension"
                        label={i18n.t(
                            'Show as data dimension in analytics apps'
                        )}
                        type="checkbox"
                        dataTest="formfields-dataDimension"
                    />
                </StandardFormField>
            </StandardFormSection>

            <StandardFormSection>
                <StandardFormSectionTitle>
                    <label htmlFor={'optionGroups'}>
                        {i18n.t('Option groups')}
                    </label>
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose the option groups to include in this option group set.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <ModelSingleSelectRefreshableFormField
                        disabled={isEdit}
                        inputWidth="400px"
                        name="optionSet"
                        label={i18n.t('Option set')}
                        query={{
                            resource: 'optionSets',
                            params: {
                                fields: 'id,displayName',
                            },
                        }}
                        onChange={() => {
                            optionGroupsInput.onChange([])
                        }}
                        dataTest="formfields-optionSet"
                        section={SECTIONS_MAP.optionSet}
                    />
                </StandardFormField>

                {optionSetId ? (
                    <StandardFormField>
                        <ModelTransferField
                            dataTest="optionGroups-transfer"
                            disabled={!optionSetId}
                            name="optionGroups"
                            query={{
                                resource: 'optionGroups',
                                params: {
                                    filter: [
                                        'name:neq:default',
                                        `optionSet.id:eq:${optionSetId}`,
                                    ],
                                },
                            }}
                            leftHeader={i18n.t('Available option groups')}
                            rightHeader={i18n.t('Selected option groups')}
                            filterPlaceholder={i18n.t(
                                'Filter available option groups'
                            )}
                            filterPlaceholderPicked={i18n.t(
                                'Filter selected option groups'
                            )}
                            maxSelections={Infinity}
                            leftFooter={<></>}
                        />
                    </StandardFormField>
                ) : (
                    <NoticeBox className={styles.noOptionSetWarning}>
                        {i18n.t(
                            'Choose an option set to start adding option groups.'
                        )}
                    </NoticeBox>
                )}
            </StandardFormSection>
        </>
    )
}

export default OptionGroupSetFormFields
