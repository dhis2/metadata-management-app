import { z } from 'zod'
import {
    createFormValidate,
    getDefaultsOld,
    modelFormSchemas,
} from '../../../lib'

const { identifiable, withAttributeValues, withDefaultListColumns } =
    modelFormSchemas

const legendItemSchema = z.object({
    id: z.string(),
    name: z.string().trim().min(1),
    startValue: z.coerce.number(),
    endValue: z.coerce.number(),
    color: z.string().min(1),
})

export type LegendItem = z.infer<typeof legendItemSchema>

export const legendSetBaseSchema = z.object({
    name: z.string().trim(),
    code: z.string().trim().optional(),
})

export const legendSetListSchema = identifiable
    .merge(legendSetBaseSchema)
    .merge(withDefaultListColumns)

export const legendSetFormSchema = identifiable
    .merge(withAttributeValues)
    .merge(legendSetBaseSchema)
    .extend({
        legends: z.array(legendItemSchema).default([]),
    })

export type LegendSetFormValues = z.infer<typeof legendSetFormSchema>

export const initialValues = getDefaultsOld(legendSetFormSchema)
export const validate = createFormValidate(legendSetFormSchema)
