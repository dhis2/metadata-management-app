import { z } from 'zod'
import {
    getDefaultsOld,
    createFormValidate,
    modelFormSchemas,
} from '../../../lib'

const { identifiable, withDefaultListColumns, withAttributeValues } =
    modelFormSchemas

const dataApprovalLevelBaseSchema = z.object({
    name: z.string().trim(),
    orgUnitLevel: z.number().optional(),
    categoryOptionGroupSet: z
        .object({
            id: z.string(),
        })
        .optional(),
})

export const dataApprovalLevelFormSchema = identifiable
    .merge(dataApprovalLevelBaseSchema)
    .extend({
        orgUnitLevel: z.number(),
        code: z.string().trim().optional(),
    })

export const dataApprovalLevelListSchema = dataApprovalLevelBaseSchema
    .merge(withDefaultListColumns)
    .merge(withAttributeValues)

export const initialValues = getDefaultsOld(dataApprovalLevelFormSchema)

export const validate = createFormValidate(dataApprovalLevelFormSchema)
