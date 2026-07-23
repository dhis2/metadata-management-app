import { z } from 'zod'
import { modelFormSchemas } from '../../../lib'
import { createFormValidate } from '../../../lib/form/validate'
import { getDefaults } from '../../../lib/zod/getDefaults'

const { identifiable, withAttributeValues, withDefaultListColumns } =
    modelFormSchemas

const categoryOptionComboBaseSchema = z.object({
    code: z.string().trim().optional(),
})

// categoryCombos should only be able to change the code and attributes
export const categoryOptionComboFormSchema = identifiable
    .merge(withAttributeValues)
    .merge(categoryOptionComboBaseSchema)
    .extend({
        ignoreApproval: z.boolean().optional(),
    })
export const categoryOptionComboListSchema =
    categoryOptionComboBaseSchema.merge(withDefaultListColumns)

export const initialValues = getDefaults(categoryOptionComboFormSchema, {
    ignoreApproval: false,
})

export const validate = createFormValidate(categoryOptionComboFormSchema)
