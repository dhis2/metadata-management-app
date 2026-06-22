import { Section } from '../../../../components/formCreators/SectionFormList'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    DEFAULT_FIELD_FILTERS,
} from '../../../../lib'
import {
    DisplayableModel,
    PickWithFieldFilters,
    ProgramStage,
} from '../../../../types/models'

export const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    ...ATTRIBUTE_VALUES_FIELD_FILTERS,
    'name',
    'description',
    'style[color,icon]',
    'enableUserAssignment',
    'featureType',
    'validationStrategy',
    'preGenerateUID',
    'executionDateLabel',
    'dueDateLabel',
    'programStageLabel',
    'eventLabel',
    'eventsLabel',
    'programStageSections[id,displayName,dataElements[id]]',
    'programStageDataElements[id,dataElement[id,displayName,valueType,optionSet],compulsory,displayInReports,allowFutureDate,skipAnalytics,skipSynchronization,renderType,sortOrder]',
    'dataEntryForm[id,displayName,htmlCode]',
    'repeatable',
    'standardInterval',
    'generatedByEnrollmentDate',
    'autoGenerateEvent',
    'openAfterEnrollment',
    'reportDateToUse',
    'minDaysFromStart',
    'hideDueDate',
    'periodType',
    'nextScheduleDate[id,displayName,valueType]',
    'blockEntryForm',
    'allowGenerateNextVisit',
    'remindCompleted',
] as const

export type StageFormValuesFromFilters = PickWithFieldFilters<
    ProgramStage,
    typeof fieldFilters
> & {
    program: { id: string }
}

export type StageFormValues = Omit<
    StageFormValuesFromFilters,
    'programStageSections' | 'dataEntryForm'
> & {
    programStageSections: Section[]
    dataEntryForm: StageFormValuesFromFilters['dataEntryForm'] & {
        deleted?: boolean
    }
}

export type PartialStageFormValues = Partial<StageFormValues>
export type SubmittedStageFormValues = PartialStageFormValues & DisplayableModel
