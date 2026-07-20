import i18n from '@dhis2/d2-i18n'
import { z } from 'zod'
import { getDefaultsOld, modelFormSchemas } from '../../../lib'
import { createFormValidate } from '../../../lib/form/validate'
import { CategoryCombo } from './../../../types/generated/models'

const { identifiable, modelReference, withDefaultListColumns } =
    modelFormSchemas

const GENERATED_COC_LIMIT = 50000

export const categoryComboBaseSchema = z.object({
    code: z.string().trim().optional(),
    dataDimensionType: z.nativeEnum(CategoryCombo.dataDimensionType),
})

export const categoryComboFormSchema = identifiable
    .merge(categoryComboBaseSchema)
    .extend({
        skipTotal: z.boolean().default(false),
        categories: z
            .array(
                modelReference.extend({
                    displayName: z.string(),
                    categoryOptionsSize: z.number(),
                })
            )
            .min(1, i18n.t('At least one category is required'))
            .refine(
                (categories) => {
                    const generatedCocsCount = categories.reduce(
                        (acc, category) => acc * category.categoryOptionsSize,
                        1
                    )
                    return generatedCocsCount < GENERATED_COC_LIMIT
                },
                {
                    message: i18n.t(
                        'The number of generated category option combinations exceeds the limit of {{limit}}',
                        { limit: GENERATED_COC_LIMIT }
                    ),
                }
            )
            .default([]),
    })

export const categoryComboListSchema = categoryComboBaseSchema
    .merge(withDefaultListColumns)
    .extend({
        name: z.string(),
    })

export const initialValues = getDefaultsOld(categoryComboFormSchema)

export type CategoryComboFormValues = typeof initialValues

export const validate = createFormValidate(categoryComboFormSchema)
