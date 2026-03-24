import i18n from '@dhis2/d2-i18n'
import { CheckboxFieldFF, NoticeBox } from '@dhis2/ui'
import React, { useCallback } from 'react'
import { Field as FieldRFF, useField } from 'react-final-form'
import { useHref } from 'react-router'
import { useParams } from 'react-router-dom'
import {
    CodeField,
    DescriptionField,
    EditableInputWrapper,
    ModelTransferField,
    NameField,
    ShortNameField,
    StandardFormField,
    StandardFormSection,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
} from '../../../components'
import {
    ModelSingleSelectFormField,
    useRefreshModelSingleSelect,
} from '../../../components/metadataFormControls/ModelSingleSelect'
import { useSchemaSectionHandleOrThrow } from '../../../lib'
import styles from './OptionGroupSetFormFields.module.css'

function OptionGroupSetFormFields() {
    const { input: optionSetInput } = useField('optionSet')
    const optionSetId = optionSetInput?.value?.id
    const { input: optionGroupsInput } = useField('optionGroups')
    const optionGroupSetId = useParams().id
    const isEdit = !!optionGroupSetId
    const newOptionSetLink = useHref('/optionSets/new')
    const refreshOptionSet = useRefreshModelSingleSelect({
        resource: 'optionSets',
    })
    const schemaSection = useSchemaSectionHandleOrThrow()

    const inputWrapper = useCallback(
        (select: React.ReactElement) => (
            <EditableInputWrapper
                onRefresh={() => refreshOptionSet()}
                onAddNew={() => window.open(newOptionSetLink, '_blank')}
            >
                {select}
            </EditableInputWrapper>
        ),
        [refreshOptionSet, newOptionSetLink]
    )

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
                    <ShortNameField
                        schemaSection={schemaSection}
                        isRequired={false}
                    />
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
                    <ModelSingleSelectFormField
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
                        inputWrapper={inputWrapper}
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
