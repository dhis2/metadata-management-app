import { z } from 'zod'
import {
    getDefaultsOld,
    createFormValidate,
    modelFormSchemas,
} from '../../../lib'
import { DataDimensionType } from '../../../types/generated'

/*  Note that this describes what we send to the server,
    and not what is stored in the form. */
const {
    identifiable,
    referenceCollection,
    withAttributeValues,
    withDefaultListColumns,
} = modelFormSchemas

const categoryOptionGroupBaseSchema = z.object({
    code: z.string().trim().optional(),
    dataDimensionType: z.nativeEnum(DataDimensionType),
})

export const categoryOptionGroupFormSchema = identifiable
    .merge(withAttributeValues)
    .merge(categoryOptionGroupBaseSchema)
    .extend({
        shortName: z.string().trim(),
        description: z.string().trim().optional(),
        categoryOptions: referenceCollection
            .min(1, 'At least one category option is required')
            .default([]),
    })

export const categoryOptionGroupListSchema = categoryOptionGroupBaseSchema
    .merge(withDefaultListColumns)
    .extend({
        displayShortName: z.string(),
    })

export const initialValues = getDefaultsOld(categoryOptionGroupFormSchema)

export const validate = createFormValidate(categoryOptionGroupFormSchema)
