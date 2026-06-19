import i18n from '@dhis2/d2-i18n'
import { object, z } from 'zod'
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
    withAttributeValues,
    modelReference,
} = modelFormSchemas

const trackerProgramBaseSchema = z.object({
    code: z.string().optional(),
    description: z.string().optional(),
    version: z.coerce
        .number()
        .int(i18n.t('Only integers are allowed'))
        .optional(),
    featureType: z.enum(['NONE', 'POINT', 'POLYGON']).optional(),
    categoryCombo: modelReference.default({ ...DEFAULT_CATEGORY_COMBO }),
    trackedEntityType: object({
        id: z.string(),
        displayName: z.string().optional(),
    }),
    onlyEnrollOnce: z.boolean().default(true),
    selectEnrollmentDatesInFuture: z.boolean().optional(),
    displayIncidentDate: z.boolean().optional(),
    selectIncidentDatesInFuture: z.boolean().optional(),
    useFirstStageDuringRegistration: z.boolean().optional(),
    ignoreOverdueEvents: z.boolean().optional(),
    programTrackedEntityAttributes: z
        .array(
            z.object({
                trackedEntityAttribute: modelReference,
                allowFutureDate: z.boolean().default(false),
                mandatory: z.boolean().default(false),
                searchable: z.boolean().default(false),
                displayInList: z.boolean().default(false),
                renderType: z
                    .object({
                        MOBILE: z.object({ type: z.string() }).optional(),
                        DESKTOP: z.object({ type: z.string() }).optional(),
                    })
                    .optional(),
            })
        )
        .default([]),
    dataEntryForm: z
        .object({
            name: z.string().optional(),
            displayName: z.string().optional(),
            htmlCode: z.string().optional(),
        })
        .optional(),
    style: z
        .object({
            color: z.string().optional(),
            icon: z.string().optional(),
        })
        .optional(),
    programStageLabel: z.string().optional(),
    programStagesLabel: z.string().optional(),
    eventLabel: z.string().optional(),
    eventsLabel: z.string().optional(),
    enrollmentDateLabel: z.string().optional(),
    incidentDateLabel: z.string().optional(),
    enrollmentLabel: z.string().optional(),
    enrollmentsLabel: z.string().optional(),
    followUpLabel: z.string().optional(),
    orgUnitLabel: z.string().optional(),
    relationshipLabel: z.string().optional(),
    noteLabel: z.string().optional(),
    displayFrontPageList: z.boolean().optional(),
    programStages: z.array(modelReference).default([]),
    organisationUnits: z.array(modelReference).default([]),
    notificationTemplates: z.array(modelReference).default([]),
    sharing: sharingSettingsSchema.optional(),
    expiryDays: z.coerce.number().int().min(0).default(1),
    expiryPeriodType: z
        .string()
        .nullable()
        .default(Program.expiryPeriodType.DAILY),
    completeEventsExpiryDays: z.coerce.number().int().min(0).default(1),
    openDaysAfterCoEndDate: z.coerce.number().min(0).default(0),
    minAttributesRequiredToSearch: z.coerce.number().int().min(0).default(1),
    maxTeiCountToReturn: z.coerce.number().int().min(0).default(0),
    accessLevel: z
        .enum(['OPEN', 'AUDITED', 'PROTECTED', 'CLOSED'])
        .default('OPEN'),
})

export const trackerProgramFormSchema = identifiable
    .merge(trackerProgramBaseSchema)
    .merge(withAttributeValues)
    .extend({
        shortName: z.string(),
        programType: z.enum(['WITH_REGISTRATION']).default('WITH_REGISTRATION'),
    })

export const trackerProgramListSchema = trackerProgramBaseSchema
    .merge(withDefaultListColumns)
    .merge(withAttributeValues)

export const trackerProgramInitialValues = getDefaultsOld(
    trackerProgramFormSchema
)

export const trackerProgramValidate = createFormValidate(
    trackerProgramFormSchema
)
