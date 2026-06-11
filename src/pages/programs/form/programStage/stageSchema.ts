import { z } from 'zod'
import { getDefaultsOld, modelFormSchemas } from '../../../../lib'
import { ProgramStage } from '../../../../types/generated'

const {
    identifiable,
    modelReference,
    withAttributeValues,
    style,
    withDefaultListColumns,
    referenceCollection,
} = modelFormSchemas

export const stageSchema = identifiable.merge(withAttributeValues).extend({
    description: z.string().optional(),
    style: style.optional(),
    enableUserAssignment: z.boolean().optional(),
    featureType: z.enum(['NONE', 'POINT', 'POLYGON']).optional(),
    validationStrategy: z
        .enum(['ON_COMPLETE', 'ON_UPDATE_AND_INSERT'])
        .default('ON_COMPLETE'),
    preGenerateUID: z.boolean().optional(),
    executionDateLabel: z.string().optional(),
    dueDateLabel: z.string().optional(),
    programStageLabel: z.string().optional(),
    eventLabel: z.string().optional(),
    eventsLabel: z.string().optional(),
    program: modelReference,
    programStageDataElements: referenceCollection.default([]),
    repeatable: z.boolean().optional(),
    standardInterval: z.number().optional(),
    generatedByEnrollmentDate: z.boolean().optional(),
    autoGenerateEvent: z.boolean().optional(),
    openAfterEnrollment: z.boolean().optional(),
    reportDateToUse: z.enum(['enrollmentDate', 'incidentDate']).optional(),
    minDaysFromStart: z.number(),
    hideDueDate: z.boolean().optional(),
    periodType: z.nativeEnum(ProgramStage.periodType).optional(),
    nextScheduleDate: modelReference.optional(),
    blockEntryForm: z.boolean().optional(),
    allowGenerateNextVisit: z.boolean().optional(),
    remindCompleted: z.boolean().optional(),
})

export const stageListSchema = stageSchema.merge(withDefaultListColumns)

export const initialStageValue = getDefaultsOld(stageSchema)
