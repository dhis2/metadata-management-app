import { z } from 'zod'
import { getDefaultsOld, modelFormSchemas } from '../../../lib'
import { UserSchema } from '../../../lib/form/modelFormSchemas'
import { createFormValidate } from '../../../lib/form/validate'
import { AggregationType, AnalyticsType } from '../../../types/generated'

const {
    identifiable,
    referenceCollection,
    modelReference,
    withAttributeValues,
    withDefaultListColumns,
    style,
} = modelFormSchemas

const programIndicatorsBaseSchema = z.object({
    program: modelReference,
    aggregationType: z.nativeEnum(AggregationType).optional(),
    analyticsType: z.nativeEnum(AnalyticsType),
    displayInForm: z.boolean().default(false),
    description: z.string().optional(),
    legendSets: referenceCollection.default([]),
    aggregateExportCategoryOptionCombo: z.string().optional(),
    aggregateExportAttributeOptionCombo: z.string().optional(),
    aggregateExportDataElement: z.string().optional(),
    expression: z.string().optional(),
    filter: z.string().optional(),
    orgUnitField: z.string().optional(),
    decimals: z.number().int().lte(5).gte(0).optional(),
    code: z.string().optional(),
})

export const programIndicatorsListSchema = programIndicatorsBaseSchema
    .merge(withDefaultListColumns)
    .merge(withAttributeValues)
    .extend({
        displayShortName: z.string(),
        displayDescription: z.string().optional(),
        displayFormName: z.string().optional(),
        user: UserSchema,
        favorite: z.boolean(),
        name: z.string(),
        shortName: z.string(),
    })

export const programIndicatorFormSchema = programIndicatorsBaseSchema
    .merge(identifiable)
    .merge(withAttributeValues)
    .extend({
        shortName: z.string().trim(),
        style: style.optional(),
        orgUnitField: z.string().optional(),
        analyticsPeriodBoundaries: z
            .array(
                z.object({
                    id: z.string().optional(),
                    analyticsPeriodBoundaryType: z.string().optional(),
                    boundaryTarget: z.string().optional(),
                    offsetPeriods: z.number().optional(),
                })
            )
            .optional()
            .default([]),
    })

export const initialValues = getDefaultsOld(programIndicatorFormSchema)

export type ProgramIndicatorFormValues = typeof initialValues

export const validate = createFormValidate(programIndicatorFormSchema)
