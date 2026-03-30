import i18n from '@dhis2/d2-i18n'
import { z } from 'zod'
import { createFormValidate, modelFormSchemas } from '../../../lib'
import { getDefaults } from '../../../lib/zod/getDefaults'
import { Indicator, PickWithFieldFilters } from '../../../types/generated'
import { fieldFilters } from '../../programIndicators/form/fieldFilters'

const { identifiable, withAttributeValues, style, withDefaultListColumns } =
    modelFormSchemas

const indicatorBaseSchema = z.object({
    code: z.string().trim().optional(),
    shortName: z.string().trim(),
    description: z.string().trim().optional(),
    numerator: z.string(),
    denominator: z.string(),
    numeratorDescription: z.string(),
    denominatorDescription: z.string(),
    annualized: z.boolean(),
    decimals: z.number().optional(),
    url: z.string().trim().url().optional(),
    aggregateExportCategoryOptionCombo: z.string().trim().optional(),
    aggregateExportAttributeOptionCombo: z.string().trim().optional(),
    indicatorType: z.object({
        id: z.string(),
    }),
    legendSets: z.array(z.object({ id: z.string() })),
})

export const indicatorFormSchema = identifiable
    .merge(indicatorBaseSchema)
    .merge(withAttributeValues)
    .merge(style)

export const indicatorListSchema = indicatorBaseSchema
    .merge(withDefaultListColumns)
    .extend({
        displayShortName: z.string(),
        name: z.string().trim(),
    })

const validatingIndicatorSchema = indicatorFormSchema.extend({
    numerator: z.string().min(1, i18n.t('Numerator is required')),
    denominator: z.string().min(1, i18n.t('Denominator is required')),
    numeratorDescription: z.string().min(1),
    denominatorDescription: z.string().min(1),
    decimals: z.number().int().lte(5).gte(0).optional(),
})

export const initialValues = getDefaults(indicatorFormSchema, {
    annualized: false,
})
export const validate = createFormValidate(validatingIndicatorSchema)
export type IndicatorFormValues = PickWithFieldFilters<
    Indicator,
    typeof fieldFilters
>
