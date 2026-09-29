import { z } from 'zod'
import {
    getDefaultsOld,
    createFormValidate,
    modelFormSchemas,
} from '../../../lib'

/*  Note that this describes what we send to the server,
    and not what is stored in the form. */
const { identifiable, referenceCollection, withDefaultListColumns } =
    modelFormSchemas

const optionGroupSetBaseSchema = z.object({
    code: z.string().trim().optional(),
})

export const optionGroupSetFormSchema = identifiable
    .merge(optionGroupSetBaseSchema)
    .extend({
        description: z.string().trim().optional(),
        dataDimension: z.boolean().default(false),
        optionSet: z
            .object({
                id: z.string(),
                displayName: z.string(),
            })
            .optional(),
        optionGroups: referenceCollection.default([]),
    })

export const optionGroupSetListSchema = optionGroupSetBaseSchema.merge(
    withDefaultListColumns
)

export const initialValues = getDefaultsOld(optionGroupSetFormSchema)

export const validate = createFormValidate(optionGroupSetFormSchema)
