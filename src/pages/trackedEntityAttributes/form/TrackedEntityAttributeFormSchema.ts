import { z } from 'zod'
import {
    createFormValidate,
    getDefaultsOld,
    modelFormSchemas,
} from '../../../lib'
import {
    AggregationType,
    PickWithFieldFilters,
    TrackedEntityAttribute,
    ValueType,
} from '../../../types/generated'
import { fieldFilters } from './fieldFilters'

const { modelReference, withDefaultListColumns, withAttributeValues } =
    modelFormSchemas

const trackedEntityAttributeBaseSchema = z.object({
    shortName: z.string().trim(),
    code: z.string().trim().optional(),
    description: z.string().trim().optional(),
    formName: z.string().trim().optional(),
    optionSet: modelReference
        .extend({ displayName: z.string().optional() })
        .optional(),
    valueType: z.nativeEnum(ValueType).default(ValueType.TEXT),
    trackedEntityType: modelReference
        .extend({ displayName: z.string().optional() })
        .optional(),
    unique: z.boolean().default(false),
    orgunitScope: z.boolean().default(false),
    generated: z.boolean().default(false),
    pattern: z.string().trim().optional(),
    fieldMask: z.string().trim().optional(),
    confidential: z.boolean().default(false),
    inherit: z.boolean().default(false),
    displayInListNoProgram: z.boolean().default(false),
    skipSynchronization: z.boolean().default(false),
    skipAnalytics: z.boolean().default(false),
    trigramIndexable: z.boolean().default(false),
    trigramIndexed: z.boolean().optional(),
    preferredSearchOperator: z.enum(['EQ', 'SW', 'EW', 'LIKE']).optional(),
    blockedSearchOperators: z.array(z.enum(['SW', 'EW', 'LIKE'])).default([]),
    minCharactersToSearch: z.number().int().min(0).default(0),
    aggregationType: z
        .nativeEnum(AggregationType)
        .default(AggregationType.NONE),
    legendSets: z
        .array(modelReference.extend({ displayName: z.string().optional() }))
        .default([]),
})

export const trackedEntityAttributeListSchema = trackedEntityAttributeBaseSchema
    .merge(withDefaultListColumns)
    .merge(withAttributeValues)
    .extend({
        displayShortName: z.string(),
    })

export const trackedEntityAttributeFormSchema = trackedEntityAttributeBaseSchema
    .extend({
        name: z.string().trim(),
    })
    .merge(withAttributeValues)

export const initialValues = getDefaultsOld(trackedEntityAttributeFormSchema)

export type TrackedEntityAttributeFormValues = PickWithFieldFilters<
    TrackedEntityAttribute,
    typeof fieldFilters
>

export const validate = createFormValidate(trackedEntityAttributeFormSchema)
