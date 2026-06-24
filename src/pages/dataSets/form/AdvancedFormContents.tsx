import i18n from '@dhis2/d2-i18n'
import { CheckboxField, CheckboxFieldFF } from '@dhis2/ui'
import React, { useState } from 'react'
import { Field, useField } from 'react-final-form'
import {
    StandardFormField,
    StandardFormSectionDescription,
    StandardFormSectionTitle,
    ModelTransferField,
} from '../../../components'
import { ModelSingleSelectField } from '../../../components/metadataFormControls/ModelSingleSelect'
import { SectionedFormSection } from '../../../components/sectionedForm'
import { SECTIONS_MAP } from '../../../lib'

const NOTIFICATION_RECIPIENTS_QUERY = {
    resource: 'userGroups',
}

const NotificationField = () => {
    const {
        input: notificationRecipientsInput,
        meta: notificationRecipientsMeta,
    } = useField('notificationRecipients')
    const { input: notifyCompletingUserInput } = useField(
        'notifyCompletingUser'
    )
    const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
        Boolean(
            notificationRecipientsInput.value || notifyCompletingUserInput.value
        )
    )

    return (
        <>
            <StandardFormField>
                <CheckboxField
                    checked={notificationsEnabled}
                    onChange={(e) => {
                        if (!e.checked) {
                            notificationRecipientsInput.onChange(null)
                            notifyCompletingUserInput.onChange(null)
                        }
                        setNotificationsEnabled(e.checked)
                    }}
                    label={i18n.t('Send complete notifications')}
                />
            </StandardFormField>
            {notificationsEnabled && (
                <div style={{ marginInlineStart: '24px' }}>
                    <StandardFormField>
                        <ModelSingleSelectField
                            input={notificationRecipientsInput}
                            meta={notificationRecipientsMeta}
                            label={i18n.t('Recipient user group')}
                            query={NOTIFICATION_RECIPIENTS_QUERY}
                        />
                    </StandardFormField>
                    <StandardFormField>
                        <Field
                            name="notifyCompletingUser"
                            type="checkbox"
                            component={CheckboxFieldFF}
                            label={i18n.t(
                                'Send notification to completing user'
                            )}
                        />
                    </StandardFormField>
                </div>
            )}
        </>
    )
}

export const AdvancedFormContents = React.memo(function AdvancedFormContents({
    name,
}: {
    name: string
}) {
    return (
        <SectionedFormSection name={name}>
            <StandardFormSectionTitle>
                {i18n.t('Advanced options')}
            </StandardFormSectionTitle>
            <StandardFormSectionDescription>
                {i18n.t('Used for advanced data set configurations.')}
            </StandardFormSectionDescription>
            <StandardFormField>
                <Field
                    name="skipOffline"
                    type="checkbox"
                    component={CheckboxFieldFF}
                    label={i18n.t(
                        'Do not save this data set to offline storage'
                    )}
                />
            </StandardFormField>
            <StandardFormField>
                <Field
                    name="dataElementDecoration"
                    type="checkbox"
                    component={CheckboxFieldFF}
                    label={i18n.t(
                        'Include data element descriptions in offline storage'
                    )}
                />
            </StandardFormField>
            <StandardFormField>
                <Field
                    name="mobile"
                    type="checkbox"
                    component={CheckboxFieldFF}
                    label={i18n.t(
                        'Use this data set with the Java mobile client'
                    )}
                />
            </StandardFormField>
            <StandardFormSectionTitle>
                {i18n.t('Completion notifcations')}
            </StandardFormSectionTitle>
            <StandardFormSectionDescription>
                {i18n.t(
                    'Send notifications when this data set is marked complete using the DHIS2 Messages app.'
                )}
            </StandardFormSectionDescription>
            <NotificationField />
            <StandardFormSectionTitle>
                {i18n.t('Legends')}
            </StandardFormSectionTitle>
            <StandardFormSectionDescription>
                {i18n.t(
                    'Choose legends to visually categorize values in Data entry and Analytics apps.'
                )}
            </StandardFormSectionDescription>
            <StandardFormField>
                <ModelTransferField
                    name={'legendSets'}
                    query={{
                        resource: 'legendSets',
                    }}
                    transferSection={SECTIONS_MAP.legendSet}
                    maxSelections={Infinity}
                    enableOrderChange={false}
                />
            </StandardFormField>
        </SectionedFormSection>
    )
})
