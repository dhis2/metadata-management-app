import i18n from '@dhis2/d2-i18n'
import { CheckboxFieldFF, RadioFieldFF } from '@dhis2/ui'
import React from 'react'
import { Field as FieldRFF, useField } from 'react-final-form'
import {
    HorizontalFieldGroup,
    SectionedFormSection,
    SectionedFormSections,
    StandardFormField,
    StandardFormSectionTitle,
    StandardFormSectionDescription,
    NameField,
    CodeField,
    ModelTransferField,
    ModelMultiSelectField,
    MessageFields,
    MessageVariables,
} from '../../../components'
import {
    useSchemaSectionHandleOrThrow,
    useSyncSelectedSectionWithScroll,
    getConstantTranslation,
    SECTIONS_MAP,
} from '../../../lib'
import styles from './ValidationNotificationTemplateFormFields.module.css'

export const VALIDATION_RULE_VARIABLES = {
    rule_name: { label: i18n.t('Rule name'), type: 'VARIABLE' },
    rule_description: { label: i18n.t('Rule description'), type: 'VARIABLE' },
    operator: { label: i18n.t('Operator'), type: 'VARIABLE' },
    importance: { label: i18n.t('Importance'), type: 'VARIABLE' },
    left_side_description: {
        label: i18n.t('Left side description'),
        type: 'VARIABLE',
    },
    right_side_description: {
        label: i18n.t('Right side description'),
        type: 'VARIABLE',
    },
    left_side_value: { label: i18n.t('Left side value'), type: 'VARIABLE' },
    right_side_value: { label: i18n.t('Right side value'), type: 'VARIABLE' },
    org_unit_name: {
        label: i18n.t('Organisation unit name'),
        type: 'VARIABLE',
    },
    period: { label: i18n.t('Period'), type: 'VARIABLE' },
    current_date: { label: i18n.t('Current date'), type: 'VARIABLE' },
} as MessageVariables

const UserGroupSelect = () => {
    const USER_GROUPS_QUERY = {
        resource: 'userGroups',
        params: {
            fields: ['displayName', 'id'],
            order: 'displayName',
        },
    }
    const { input, meta } = useField('recipientUserGroups')
    return (
        <div className={styles.userGroupSelect}>
            <ModelMultiSelectField
                dataTest="formfields-recipientUserGroups"
                input={input}
                meta={meta}
                name="recipientUserGroups"
                label={i18n.t('User group recipients')}
                query={USER_GROUPS_QUERY}
                filterable={true}
            />
        </div>
    )
}

export const ValidationNotificationTemplateFormFields = () => {
    const schemaSection = useSchemaSectionHandleOrThrow()
    useSyncSelectedSectionWithScroll()
    const collectiveSummaryField = useField('sendStrategy', {
        type: 'radio',
        value: 'COLLECTIVE_SUMMARY',
    })
    const singleNotificationField = useField('sendStrategy', {
        type: 'radio',
        value: 'SINGLE_NOTIFICATION',
    })

    return (
        <SectionedFormSections>
            <SectionedFormSection name="basic">
                <StandardFormSectionTitle>
                    {i18n.t('Basic information')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Set up the basic information for this validation notification.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <NameField schemaSection={schemaSection} />
                </StandardFormField>
                <StandardFormField>
                    <CodeField schemaSection={schemaSection} />
                </StandardFormField>
                <StandardFormSectionTitle>
                    {i18n.t('Validation rules')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Choose which validation rules trigger this notification.'
                    )}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <ModelTransferField
                        dataTest="validationRules-transfer"
                        name="validationRules"
                        query={{
                            resource: 'validationRules',
                        }}
                        transferSection={SECTIONS_MAP.validationRule}
                        maxSelections={Infinity}
                    />
                </StandardFormField>
            </SectionedFormSection>

            <SectionedFormSection name="notificationDetails">
                <StandardFormSectionTitle>
                    {i18n.t('Notification details')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t(
                        'Configure the templates for the notification message content.'
                    )}
                </StandardFormSectionDescription>
                <MessageFields messageVariables={VALIDATION_RULE_VARIABLES} />
            </SectionedFormSection>

            <SectionedFormSection name="recipient">
                <StandardFormSectionTitle>
                    {i18n.t('Recipients')}
                </StandardFormSectionTitle>
                <StandardFormSectionDescription>
                    {i18n.t('Choose who recieves the notification.')}
                </StandardFormSectionDescription>
                <StandardFormField>
                    <UserGroupSelect />
                </StandardFormField>
                <StandardFormField>
                    <HorizontalFieldGroup
                        label={i18n.t('Send notification as')}
                        dataTest="formfields-notificationType"
                    >
                        <RadioFieldFF
                            label={getConstantTranslation('COLLECTIVE_SUMMARY')}
                            input={collectiveSummaryField.input}
                            meta={collectiveSummaryField.meta}
                        />
                        <RadioFieldFF
                            label={getConstantTranslation(
                                'SINGLE_NOTIFICATION'
                            )}
                            input={singleNotificationField.input}
                            meta={singleNotificationField.meta}
                        />
                    </HorizontalFieldGroup>
                </StandardFormField>
                <StandardFormField>
                    <FieldRFF
                        component={CheckboxFieldFF}
                        name="notifyUsersInHierarchyOnly"
                        label={i18n.t('Notify users in hierarchy only')}
                        type="checkbox"
                        dataTest="formfields-notifyUsersInHierarchyOnly"
                    />
                </StandardFormField>
            </SectionedFormSection>
        </SectionedFormSections>
    )
}
