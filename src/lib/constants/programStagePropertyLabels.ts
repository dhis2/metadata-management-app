import i18n from '@dhis2/d2-i18n'

export const PROGRAM_STAGE_PROPERTY_LABELS = {
    name: i18n.t('Name'),
    description: i18n.t('Description'),
    style: i18n.t('Visual configuration'),
    featureType: i18n.t('Feature type'),
    enableUserAssignment: i18n.t('Allow events to be assigned to users'),
    repeatable: i18n.t('Allow multiple events in this stage'),
    standardInterval: i18n.t('Standard interval days'),
    nextScheduleDate: i18n.t('Default next scheduled date'),
    periodType: i18n.t('Period type'),
    validationStrategy: i18n.t('Validation strategy'),
    preGenerateUID: i18n.t('Generate offline event IDs'),
    allowGenerateNextVisit: i18n.t(
        'Ask user to create a new event after completion'
    ),
    remindCompleted: i18n.t('Ask user to complete enrollment after completion'),
    blockEntryForm: i18n.t('Block data entry after completion'),
    autoGenerateEvent: i18n.t('Create an event in this stage on enrollment'),
    openAfterEnrollment: i18n.t('Open data entry form after enrollment'),
    reportDateToUse: i18n.t('Date to use for created event report date'),
    minDaysFromStart: i18n.t('Scheduled days from reference date'),
    generatedByEnrollmentDate: i18n.t('Reference date for scheduling'),
    hideDueDate: i18n.t('Hide scheduled date'),
    executionDateLabel: i18n.t('Custom label for report date'),
    dueDateLabel: i18n.t('Custom label for due date'),
    programStageLabel: i18n.t('Custom label for program stage'),
    eventLabel: i18n.t('Custom label for event'),
} as const
