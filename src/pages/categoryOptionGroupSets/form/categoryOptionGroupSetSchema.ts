import { z } from 'zod'
import {
    getDefaultsOld,
    createFormValidate,
    modelFormSchemas,
} from '../../../lib'
import { DataDimensionType } from '../../../types/generated'

const {
    identifiable,
    referenceCollection,
    withAttributeValues,
    withDefaultListColumns,
} = modelFormSchemas

const categoryOptionGroupSetBaseSchema = z.object({
    code: z.string().trim().optional(),
    dataDimensionType: z.nativeEnum(DataDimensionType),
})

export const categoryOptionGroupSetFormSchema = identifiable
    .merge(withAttributeValues)
    .merge(categoryOptionGroupSetBaseSchema)
    .extend({
        shortName: z.string().trim(),
        description: z.string().trim().optional(),
        dataDimension: z.boolean().default(true),
        categoryOptionGroups: referenceCollection
            .min(1, 'At least one category option group is required')
            .default([]),
    })

export const categoryOptionGroupSetListSchema = categoryOptionGroupSetBaseSchema
    .merge(withDefaultListColumns)
    .extend({
        displayShortName: z.string(),
    })

export const initialValues = getDefaultsOld(categoryOptionGroupSetFormSchema)

export const validate = createFormValidate(categoryOptionGroupSetFormSchema)
