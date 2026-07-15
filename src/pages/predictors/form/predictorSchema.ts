import i18n from '@dhis2/d2-i18n'
import { z } from 'zod'
import { modelFormSchemas } from '../../../lib'
import { createFormValidate } from '../../../lib/form/validate'
import { getDefaults } from '../../../lib/zod/getDefaults'
import { Predictor, Expression } from '../../../types/generated/models'

const { identifiable, withDefaultListColumns, modelReference } =
    modelFormSchemas

const predictorBaseSchema = z.object({
    shortName: z.string().trim(),
    code: z.string().trim().optional(),
    description: z.string().trim().optional(),
    output: modelReference,
    outputCombo: modelReference.optional(),
    periodType: z.nativeEnum(Predictor.periodType),
    organisationUnitLevels: z.array(modelReference),
    organisationUnitDescendants: z.nativeEnum(
        Predictor.organisationUnitDescendants
    ),
    sequentialSampleCount: z.number().int(),
    annualSampleCount: z.number().int().min(0).max(10),
    sequentialSkipCount: z.number().int().optional(),
    predictorGroups: z.array(modelReference),
})

export const predictorListSchema = predictorBaseSchema
    .merge(withDefaultListColumns)
    .extend({
        name: z.string(),
    })

export const predictorFormSchema = predictorBaseSchema
    .merge(identifiable)
    .extend({
        formName: z.string().optional(),
        generator: z.object({
            expression: z.string(),
            description: z.string(),
            missingValueStrategy: z
                .nativeEnum(Expression.missingValueStrategy)
                .optional(),
        }),
        sampleSkipTest: z
            .object({
                expression: z.string().optional(),
                description: z.string().optional(),
                missingValueStrategy: z
                    .nativeEnum(Expression.missingValueStrategy)
                    .default(Expression.missingValueStrategy.NEVER_SKIP)
                    .optional(),
            })
            .optional(),
    })

// export const initialValues = getDefaultsOld(predictorFormSchema)
export const initialValues = getDefaults(predictorFormSchema, {
    periodType: Predictor.periodType.MONTHLY,
    organisationUnitLevels: [],
    organisationUnitDescendants: Predictor.organisationUnitDescendants.SELECTED,
    sequentialSampleCount: 0,
    annualSampleCount: 0,
    predictorGroups: [],
})

const validatingPredictorFormSchema = predictorFormSchema.extend({
    organisationUnitLevels: z
        .array(modelReference)
        .min(1, i18n.t('At least one organisation unit level is required')),
})
export const validate = createFormValidate(validatingPredictorFormSchema)
