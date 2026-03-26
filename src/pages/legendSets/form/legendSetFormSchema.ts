import i18n from '@dhis2/d2-i18n'
import { z } from 'zod'
import { createFormValidate, getDefaultsOld, modelFormSchemas } from '../../../lib'

const { identifiable, withAttributeValues } = modelFormSchemas

const legendItemSchema = z.object({
    id: z.string(),
    name: z.string().trim().min(1),
    startValue: z.coerce.number(),
    endValue: z.coerce.number(),
    color: z.string().min(1),
})

export type LegendItem = z.infer<typeof legendItemSchema>

const legendSetBaseSchema = z.object({
    code: z.string().trim().optional(),
    legends: z.array(legendItemSchema).default([]),
})

export const legendSetFormSchema = identifiable
    .merge(withAttributeValues)
    .merge(legendSetBaseSchema)
    .superRefine((data, ctx) => {
        const legends = data.legends
        if (!legends || legends.length === 0) {
            return
        }

        for (let i = 0; i < legends.length; i++) {
            if (legends[i].endValue <= legends[i].startValue) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: i18n.t('End value must be greater than start value'),
                    path: ['legends', i, 'endValue'],
                })
            }
        }

        const sorted = [...legends].sort(
            (a, b) => a.startValue - b.startValue
        )
        for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i]
            const next = sorted[i + 1]

            if (current.endValue > next.startValue) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: i18n.t('Legend items must not overlap'),
                    path: ['legends'],
                })
                break
            }

            if (current.endValue < next.startValue) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: i18n.t('Legend items must not have gaps'),
                    path: ['legends'],
                })
                break
            }
        }
    })

export type LegendSetFormValues = z.infer<typeof legendSetFormSchema>

export const initialValues = getDefaultsOld(legendSetFormSchema)
export const validate = createFormValidate(legendSetFormSchema)
