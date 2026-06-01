import i18n from '@dhis2/d2-i18n'
import { z } from 'zod'
import {
    createFormValidate,
    getDefaultsOld,
    modelFormSchemas,
} from '../../../lib'
import { Indicator, PickWithFieldFilters } from '../../../types/generated'
import { fieldFilters } from '../../programIndicators/form/fieldFilters'

const {
    identifiable,
    withAttributeValues,
    style,
    withDefaultListColumns,
    referenceCollection,
} = modelFormSchemas

const indicatorBaseSchema = z.object({
    code: z.string().trim().optional(),
    shortName: z.string().trim(),
    name: z.string().trim(),
    description: z.string().trim().optional(),
    numerator: z.string().min(1, i18n.t('Numerator is required')),
    denominator: z.string().min(1, i18n.t('Denominator is required')),
    numeratorDescription: z.string().min(1),
    denominatorDescription: z.string().min(1),
    annualized: z.boolean().default(false),
    decimals: z.number().int().lte(5).gte(0).optional(),
    url: z.string().trim().url().optional(),
    aggregateExportCategoryOptionCombo: z.string().trim().optional(),
    aggregateExportAttributeOptionCombo: z.string().trim().optional(),
    indicatorType: z.object({
        id: z.string(),
    }),
    legendSets: z.array(z.object({ id: z.string() })),
    indicatorGroups: referenceCollection.default([]),
})

export const indicatorFormSchema = identifiable
    .merge(indicatorBaseSchema)
    .merge(withAttributeValues)
    .merge(style)

export const indicatorListSchema = indicatorBaseSchema
    .merge(withDefaultListColumns)
    .extend({
        displayShortName: z.string(),
    })

export const initialValues = getDefaultsOld(indicatorFormSchema)
export const validate = createFormValidate(indicatorFormSchema)
export type IndicatorFormValues = PickWithFieldFilters<
    Indicator,
    typeof fieldFilters
>
