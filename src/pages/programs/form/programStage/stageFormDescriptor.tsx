import i18n from '@dhis2/d2-i18n'
import { SectionedFormDescriptor } from '../../../../lib'
import { StageFormValues } from './StageForm'

export const StageFormDescriptor = {
    name: 'Program Stage',
    label: 'Program Stage',
    sections: [
        {
            name: 'stageSetup',
            label: i18n.t('Basic information'),
            fields: [
                { name: 'name', label: i18n.t('Name') },
                { name: 'description', label: i18n.t('Description') },
                { name: 'style', label: i18n.t('Visual configuration') },
            ],
        },
        {
            name: 'stageConfiguration',
            label: i18n.t('Data entry options'),
            fields: [
                { name: 'featureType', label: i18n.t('Feature type') },
                {
                    name: 'enableUserAssignment',
                    label: i18n.t('Allow events to be assigned to users'),
                },
                {
                    name: 'repeatable',
                    label: i18n.t('Allow multiple events in this stage'),
                },
                {
                    name: 'standardInterval',
                    label: i18n.t('Standard interval days'),
                },
                {
                    name: 'nextScheduleDate',
                    label: i18n.t('Default next scheduled date'),
                },
                {
                    name: 'periodType',
                    label: i18n.t('Period type'),
                },
                {
                    name: 'validationStrategy',
                    label: i18n.t('Validation strategy'),
                },
                {
                    name: 'preGenerateUID',
                    label: i18n.t('Generate offline event IDs'),
                },
                {
                    name: 'allowGenerateNextVisit',
                    label: i18n.t(
                        'Ask user to create a new event after completion'
                    ),
                },
                {
                    name: 'remindCompleted',
                    label: i18n.t(
                        'Ask user to complete enrollment after completion'
                    ),
                },
                {
                    name: 'blockEntryForm',
                    label: i18n.t('Block data entry after completion'),
                },
            ],
        },
        {
            name: 'stageCreationAndScheduling',
            label: i18n.t('Creation and scheduling'),
            fields: [
                {
                    name: 'autoGenerateEvent',
                    label: i18n.t(
                        'Create an event in this stage on enrollment'
                    ),
                },
                {
                    name: 'openAfterEnrollment',
                    label: i18n.t('Open data entry form after enrollment'),
                },
                {
                    name: 'reportDateToUse',
                    label: i18n.t('Date to use for created event report date'),
                },
                {
                    name: 'minDaysFromStart',
                    label: i18n.t('Scheduled days from reference date'),
                },
                {
                    name: 'generatedByEnrollmentDate',
                    label: i18n.t('Reference date for scheduling'),
                },
                {
                    name: 'hideDueDate',
                    label: i18n.t('Hide scheduled date'),
                },
            ],
        },
        {
            name: 'stageData',
            label: i18n.t('Data'),
            fields: [],
        },
        {
            name: 'stageForm',
            label: i18n.t('Program stage form'),
            fields: [],
        },
        {
            name: 'stageTerminology',
            label: i18n.t('Customization'),
            fields: [
                {
                    name: 'executionDateLabel',
                    label: i18n.t('Custom label for report date'),
                },
                {
                    name: 'dueDateLabel',
                    label: i18n.t('Custom label for due date'),
                },
                {
                    name: 'programStageLabel',
                    label: i18n.t('Custom label for program stage'),
                },
                {
                    name: 'eventLabel',
                    label: i18n.t('Custom label for event'),
                },
                {
                    name: 'eventsLabel',
                    label: i18n.t('Custom label for event (plural)'),
                },
            ],
        },
    ],
} as const satisfies SectionedFormDescriptor<StageFormValues>
