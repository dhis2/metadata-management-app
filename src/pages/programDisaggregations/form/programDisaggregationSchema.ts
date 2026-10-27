import { z } from 'zod'
import { DataDimensionType } from './../../../types/generated/models'

export const categoryOptionMapping = z.object({
    filter: z.string(),
    optionId: z.string(),
    invalid: z.boolean().optional(),
})

const identifiable = z.object({
    id: z.string(),
    displayName: z.string(),
})
const categorySchema = identifiable.extend({
    categoryOptions: z.array(identifiable),
    dataDimensionType: z.nativeEnum(DataDimensionType),
    name: z.string(),
})
const categoryComboSchema = z
    .object({
        id: z.string(),
        displayName: z.string(),
        dataDimensionType: z.nativeEnum(DataDimensionType),
        categories: z.array(categorySchema),
    })
    .optional()

export const categoryMapping = z.object({
    id: z.string(),
    categoryId: z.string(),
    mappingName: z.string(),
    deleted: z.boolean(),
    options: z.record(categoryOptionMapping),
    // note this is not what you get from backend, but is populated in form-state
    // thus optional
    category: categorySchema.optional(),
})
export const programIndicatorSchema = z.object({
    categoryCombo: categoryComboSchema.optional(),
    attributeCombo: categoryComboSchema.optional(),
    // map from categoryId to categoryMapping
    disaggregation: z.record(z.string(), z.string()),
    attribute: z.record(z.string(), z.string()),
    id: z.string(),
    name: z.string(),
    displayName: z.string(),
    aggregateExportDataElement: z.string().optional(),
    aggregateExportCategoryOptionCombo: z.string().optional(),
    aggregateExportAttributeOptionCombo: z.string().optional(),
})

const categoryMappingsRecord = z.record(z.string(), z.array(categoryMapping))
export const programIndicatorMappingsRecord = z.record(programIndicatorSchema)

export const programDisaggregationSchema = z.object({
    deletedCategories: z.array(z.string()).default([]),
    categoryMappings: categoryMappingsRecord.default({}),
    programIndicatorMappings: programIndicatorMappingsRecord.default({}),
    deletedProgramIndicatorMappings: z.array(z.string()).default([]),
})

export type CategoryMappingsRecord = z.infer<typeof categoryMappingsRecord>
export type ProgramIndicatorMappingsRecord = z.infer<
    typeof programIndicatorMappingsRecord
>

export type ProgramDisaggregationFormValues = z.infer<
    typeof programDisaggregationSchema
>
export type CategoryMapping = z.infer<typeof categoryMapping>
export type ProgramIndicatorMapping = z.infer<typeof programIndicatorSchema>

export type ProgramIndicatorCategory = z.infer<typeof categorySchema>
