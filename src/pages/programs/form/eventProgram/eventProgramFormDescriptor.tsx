import i18n from '@dhis2/d2-i18n'
import { SectionedFormDescriptor } from '../../../../lib'
import { ProgramValues } from '../../EditTrackerProgram'

export const EventProgramFormDescriptor = {
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
                { name: 'featureType', label: i18n.t('Feature type') },
                { name: 'relatedProgram', label: i18n.t('Related program') },
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
            ],
        },
        {
            name: 'programSettings',
            label: i18n.t('Program Settings'),
            fields: [
                {
                    name: 'programStages[0].enableUserAssignment',
                    label: i18n.t('Allow events to be assigned to users'),
                },
                {
                    name: 'programStages[0].blockEntryForm',
                    label: i18n.t('Block data entry after completion'),
                },
                {
                    name: 'programStages[0].preGenerateUID',
                    label: i18n.t('Generate offline event IDs'),
                },
                {
                    name: 'programStages[0].validationStrategy',
                    label: i18n.t('Validation strategy'),
                },
            ],
        },
        {
            name: 'data',
            label: i18n.t('Data', { nsSeparator: '~:~' }),
            fields: [
                {
                    name: 'programStages[0].programStageDataElements',
                    label: i18n.t('Data elements'),
                },
            ],
        },
        {
            name: 'form',
            label: i18n.t('Form', { nsSeparator: '~:~' }),
            fields: [
                {
                    name: 'programStages[0].dataEntryForm',
                    label: i18n.t('Custom form'),
                },
                {
                    name: 'programStages[0].programStageSections',
                    label: i18n.t('Sections'),
                },
            ],
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
                    label: i18n.t('Custom label for "Report date"'),
                },
            ],
        },
    ],
} as const satisfies SectionedFormDescriptor<ProgramValues>
