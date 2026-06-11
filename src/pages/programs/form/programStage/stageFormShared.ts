import i18n from '@dhis2/d2-i18n'
import { Section } from '../../../../components/formCreators/SectionFormList'
import {
    ATTRIBUTE_VALUES_FIELD_FILTERS,
    DEFAULT_FIELD_FILTERS,
    SchemaName,
    SchemaSection,
} from '../../../../lib'
import {
    DisplayableModel,
    PickWithFieldFilters,
    ProgramStage,
} from '../../../../types/models'

/* Shared, drawer-agnostic definitions for the program stage form.
   These are consumed both by the in-program stage drawer (StageForm) and by
   the standalone program stage New/Edit pages, so they must not depend on any
   drawer-specific code. */

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

export const stageSchemaSection = {
    name: SchemaName.programStage,
    namePlural: 'programStages',
    title: i18n.t('Stage'),
    titlePlural: i18n.t('Stages'),
    parentSectionKey: 'programs',
} satisfies SchemaSection

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
