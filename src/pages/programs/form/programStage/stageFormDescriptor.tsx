import i18n from '@dhis2/d2-i18n'
import {
    PROGRAM_STAGE_PROPERTY_LABELS,
    SectionedFormDescriptor,
} from '../../../../lib'
import { StageFormValues } from './stageFormShared'

export const StageFormDescriptor = {
    name: 'Program Stage',
    label: 'Program Stage',
    sections: [
        {
            name: 'stageSetup',
            label: i18n.t('Basic information'),
            fields: [
                { name: 'name', label: PROGRAM_STAGE_PROPERTY_LABELS.name },
                {
                    name: 'description',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.description,
                },
                { name: 'style', label: PROGRAM_STAGE_PROPERTY_LABELS.style },
            ],
        },
        {
            name: 'stageConfiguration',
            label: i18n.t('Data entry options'),
            fields: [
                {
                    name: 'featureType',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.featureType,
                },
                {
                    name: 'enableUserAssignment',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.enableUserAssignment,
                },
                {
                    name: 'repeatable',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.repeatable,
                },
                {
                    name: 'standardInterval',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.standardInterval,
                },
                {
                    name: 'nextScheduleDate',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.nextScheduleDate,
                },
                {
                    name: 'periodType',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.periodType,
                },
                {
                    name: 'validationStrategy',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.validationStrategy,
                },
                {
                    name: 'preGenerateUID',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.preGenerateUID,
                },
                {
                    name: 'allowGenerateNextVisit',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.allowGenerateNextVisit,
                },
                {
                    name: 'remindCompleted',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.remindCompleted,
                },
                {
                    name: 'blockEntryForm',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.blockEntryForm,
                },
            ],
        },
        {
            name: 'stageCreationAndScheduling',
            label: i18n.t('Creation and scheduling'),
            fields: [
                {
                    name: 'autoGenerateEvent',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.autoGenerateEvent,
                },
                {
                    name: 'openAfterEnrollment',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.openAfterEnrollment,
                },
                {
                    name: 'reportDateToUse',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.reportDateToUse,
                },
                {
                    name: 'minDaysFromStart',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.minDaysFromStart,
                },
                {
                    name: 'generatedByEnrollmentDate',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.generatedByEnrollmentDate,
                },
                {
                    name: 'hideDueDate',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.hideDueDate,
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
                    label: PROGRAM_STAGE_PROPERTY_LABELS.executionDateLabel,
                },
                {
                    name: 'dueDateLabel',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.dueDateLabel,
                },
                {
                    name: 'programStageLabel',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.programStageLabel,
                },
                {
                    name: 'eventLabel',
                    label: PROGRAM_STAGE_PROPERTY_LABELS.eventLabel,
                },
                {
                    name: 'eventsLabel',
                    label: i18n.t('Custom label for "Events (Plural)"'),
                },
            ],
        },
    ],
} as const satisfies SectionedFormDescriptor<StageFormValues>
