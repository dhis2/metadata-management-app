import i18n from '@dhis2/d2-i18n'
import { z } from 'zod'
import {
    getDefaultsOld,
    createFormValidate,
    modelFormSchemas,
    DEFAULT_CATEGORY_COMBO,
} from '../../../../lib'
import { Program } from '../../../../types/generated'
import { sharingSettingsSchema } from '../common/sharingSettingsSchema'

const {
    identifiable,
    withDefaultListColumns,
    modelReference,
    withAttributeValues,
} = modelFormSchemas

const eventProgramBaseSchema = z.object({
    code: z.string().optional(),
    description: z.string().optional(),
    version: z.coerce
        .number()
        .int(i18n.t('Only integers are allowed'))
        .optional(),
    featureType: z.enum(['NONE', 'POINT', 'POLYGON']).optional(),
    categoryCombo: modelReference.default({ ...DEFAULT_CATEGORY_COMBO }),
    style: z
        .object({
            color: z.string().optional(),
            icon: z.string().optional(),
        })
        .optional(),
    incidentDateLabel: z.string().optional(),
    programStages: z
        .array(
            z.object({
                id: z.string().optional(),
                name: z.string().optional(),
                displayName: z.string().optional(),
                executionDateLabel: z.string().optional(),
                sharing: sharingSettingsSchema.optional(),
                enableUserAssignment: z.boolean().optional(),
                blockEntryForm: z.boolean().optional(),
                preGenerateUID: z.boolean().optional(),
                validationStrategy: z
                    .enum(['ON_COMPLETE', 'ON_UPDATE_AND_INSERT'])
                    .default('ON_UPDATE_AND_INSERT'),
                notificationTemplates: z
                    .array(z.object({ id: z.string().optional() }))
                    .default([]),
                dataEntryForm: z
                    .object({
                        id: z.string().optional(),
                        htmlCode: z.string().optional(),
                    })
                    .optional(),
                programStageDataElements: z
                    .array(z.object({ id: z.string().optional() }))
                    .default([]),
                programStageSections: z
                    .array(z.object({ id: z.string().optional() }))
                    .default([]),
            })
        )
        .default([
            {
                id: undefined,
                name: undefined,
                displayName: undefined,
                sharing: undefined,
                notificationTemplates: [],
                programStageDataElements: [],
                programStageSections: [],
                validationStrategy: 'ON_UPDATE_AND_INSERT',
            },
        ]),
    organisationUnits: z.array(modelReference).default([]),
    sharing: sharingSettingsSchema.optional(),
    expiryDays: z.coerce.number().int().min(0).default(1),
    expiryPeriodType: z
        .string()
        .nullable()
        .default(Program.expiryPeriodType.DAILY),
    completeEventsExpiryDays: z.coerce.number().int().min(0).default(1),
    openDaysAfterCoEndDate: z.coerce.number().min(0).default(0),
})

export const eventProgramFormSchema = identifiable
    .merge(eventProgramBaseSchema)
    .merge(withAttributeValues)
    .extend({
        shortName: z.string(),
        programType: z
            .enum(['WITHOUT_REGISTRATION'])
            .default('WITHOUT_REGISTRATION'),
    })

export const eventProgramListSchema = eventProgramBaseSchema
    .merge(withDefaultListColumns)
    .merge(withAttributeValues)

export const eventProgramInitialValues = getDefaultsOld(eventProgramFormSchema)

export const eventProgramValidate = createFormValidate(eventProgramFormSchema)
