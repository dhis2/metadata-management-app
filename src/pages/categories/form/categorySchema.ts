import { z } from 'zod'
import { createFormValidate, modelFormSchemas } from '../../../lib'
import { getDefaults } from '../../../lib/zod/getDefaults'
import { DataDimensionType } from '../../../types/generated'

/*  Note that this describes what we send to the server,
    and not what is stored in the form. */
const {
    identifiable,
    referenceCollection,
    withAttributeValues,
    withDefaultListColumns,
} = modelFormSchemas

const categoryBaseSchema = z.object({
    dataDimensionType: z.nativeEnum(DataDimensionType),
})

export const categoryFormSchema = identifiable
    .merge(withAttributeValues)
    .merge(categoryBaseSchema)
    .extend({
        shortName: z.string().trim(),
        description: z.string().trim().optional(),
        dataDimension: z.boolean(),
        categoryOptions: referenceCollection,
    })

export const categoryListSchema = categoryBaseSchema
    .merge(withDefaultListColumns)
    .extend({
        name: z.string(),
        displayShortName: z.string(),
    })

export const initialValues = getDefaults(categoryFormSchema, {
    dataDimension: true,
})

const validatingCategoryFormSchema = categoryFormSchema.extend({
    categoryOptions: referenceCollection.min(
        1,
        'At least one category option is required'
    ),
})
export const validate = createFormValidate(validatingCategoryFormSchema)
