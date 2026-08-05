import i18n from '@dhis2/d2-i18n'
import { SectionedFormDescriptor } from '../../../../lib'
import { ProgramValues } from '../../EditTrackerProgram'

export const TrackerProgramFormDescriptor = {
    name: 'Program',
    label: 'Program',
    sections: [
        {
            name: 'programDetails',
            label: i18n.t('Program Details'),
            fields: [
                { name: 'name', label: i18n.t('Name') },
                { name: 'shortName', label: i18n.t('Short name') },
                { name: 'code', label: i18n.t('Code') },
                { name: 'description', label: i18n.t('Description') },
                {
                    name: 'style',
                    label: i18n.t('Visual configuration'),
                },
                { name: 'version', label: i18n.t('Version') },
                {
                    name: 'categoryCombo',
                    label: i18n.t('Event category combination'),
                },
                {
                    name: 'expiryDays',
                    label: i18n.t(
                        'Close data entry a number of days after a period ends'
                    ),
                },
                {
                    name: 'completeEventsExpiryDays',
                    label: i18n.t(
                        'Lock events a number of days after completion'
                    ),
                },
                {
                    name: 'openDaysAfterCoEndDate',
                    label: i18n.t(
                        'Close data entry a number of days after event category combination end date'
                    ),
                },
                {
                    name: 'minAttributesRequiredToSearch',
                    label: i18n.t(
                        'Minimum number of attributes required to search'
                    ),
                },
                {
                    name: 'maxTeiCountToReturn',
                    label: i18n.t(
                        'Maximum number of search results to display'
                    ),
                },
                {
                    name: 'displayFrontPageList',
                    label: i18n.t('Start page in web Capture app'),
                },
            ],
        },
        {
            name: 'enrollmentSettings',
            label: i18n.t('Enrollment: Settings', { nsSeparator: '~:~' }),
            fields: [
                {
                    name: 'trackedEntityType',
                    label: i18n.t('Tracked entity type'),
                },
                { name: 'featureType', label: i18n.t('Feature type') },
                {
                    name: 'onlyEnrollOnce',
                    label: i18n.t('Limit to one lifetime enrollment'),
                },
                {
                    name: 'selectEnrollmentDatesInFuture',
                    label: i18n.t('Allow enrollment dates in the future'),
                },
                {
                    name: 'displayIncidentDate',
                    label: i18n.t('Collect an incident date'),
                },
                {
                    name: 'selectIncidentDatesInFuture',
                    label: i18n.t('Allow incident dates in the future'),
                },
                {
                    name: 'useFirstStageDuringRegistration',
                    label: i18n.t('Show first program stage during enrollment'),
                },
                {
                    name: 'ignoreOverdueEvents',
                    label: i18n.t(
                        'Do not create overdue events when automatically creating program stage events'
                    ),
                },
            ],
        },
        {
            name: 'enrollmentData',
            label: i18n.t('Enrollment: Data', { nsSeparator: '~:~' }),
            fields: [
                {
                    name: 'programTrackedEntityAttributes',
                    label: i18n.t('Tracked entity attributes'),
                },
            ],
        },
        {
            name: 'enrollmentForm',
            label: i18n.t('Enrollment: Form', { nsSeparator: '~:~' }),
            fields: [{ name: 'dataEntryForm', label: i18n.t('Custom form') }],
        },
        {
            name: 'programStages',
            label: i18n.t('Program Stages'),
            fields: [],
        },
        {
            name: 'programNotifications',
            label: i18n.t('Notifications'),
            fields: [],
        },
        {
            name: 'accessAndSharing',
            label: i18n.t('Access and Sharing'),
            fields: [
                {
                    name: 'accessLevel',
                    label: i18n.t('Access Level'),
                },
                {
                    name: 'organisationUnits',
                    label: i18n.t('Organisation units'),
                },
                {
                    name: 'sharing',
                    label: i18n.t('Role access'),
                },
            ],
        },
        {
            name: 'programCustomization',
            label: i18n.t('Customization'),
            fields: [
                {
                    name: 'incidentDateLabel',
                    label: i18n.t('Custom label for "Incident date"'),
                },
                {
                    name: 'enrollmentDateLabel',
                    label: i18n.t('Custom label for "Enrollment date"'),
                },
                {
                    name: 'enrollmentLabel',
                    label: i18n.t('Custom label for "Enrollment"'),
                },
                {
                    name: 'enrollmentsLabel',
                    label: i18n.t('Custom label for "Enrollment" (plural)'),
                },
                {
                    name: 'eventLabel',
                    label: i18n.t('Custom label for "Event"'),
                },
                {
                    name: 'eventsLabel',
                    label: i18n.t('Custom label for "Event" (plural)'),
                },
                {
                    name: 'programStageLabel',
                    label: i18n.t('Custom label for "Program stage"'),
                },
                {
                    name: 'programStagesLabel',
                    label: i18n.t('Custom label for "Program stage" (plural)'),
                },
                {
                    name: 'followUpLabel',
                    label: i18n.t('Custom label for "Follow-up"'),
                },
                {
                    name: 'orgUnitLabel',
                    label: i18n.t('Custom label for "Registering unit"'),
                },
                {
                    name: 'relationshipLabel',
                    label: i18n.t('Custom label for "Relationship"'),
                },
                {
                    name: 'relationshipsLabel',
                    label: i18n.t('Custom label for "Relationship" (plural)'),
                },
                { name: 'noteLabel', label: i18n.t('Custom label for "Note"') },
                {
                    name: 'notesLabel',
                    label: i18n.t('Custom label for "Note" (plural)'),
                },
                {
                    name: 'trackedEntityAttributeLabel',
                    label: i18n.t('Custom label for "Attribute"'),
                },
                {
                    name: 'trackedEntityAttributesLabel',
                    label: i18n.t('Custom label for "Attribute" (plural)'),
                },
            ],
        },
    ],
} as const satisfies SectionedFormDescriptor<ProgramValues>
