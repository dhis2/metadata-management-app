import { z } from 'zod'
import {
    createFormValidate,
    getDefaultsOld,
    modelFormSchemas,
} from '../../../lib'
import {
    Importance,
    MissingValueStrategy,
    Operator,
    ValidationRule,
} from '../../../types/generated'

const { withDefaultListColumns, identifiable, withAttributeValues } =
    modelFormSchemas

const validationRuleBaseSchema = z.object({
    code: z.string().trim().optional(),
    name: z.string().trim().min(1),
    shortName: z.string().trim().optional(),
    description: z.string().trim().optional(),
    leftSide: z.object({
        expression: z.string().optional(),
        description: z.string().optional(),
        missingValueStrategy: z
            .nativeEnum(MissingValueStrategy)
            .default(MissingValueStrategy.NEVER_SKIP),
        slidingWindow: z.boolean().optional().default(false),
    }),
    operator: z.nativeEnum(Operator).default(Operator.NOT_EQUAL_TO),
    rightSide: z.object({
        expression: z.string().optional(),
        description: z.string().optional(),
        missingValueStrategy: z
            .nativeEnum(MissingValueStrategy)
            .default(MissingValueStrategy.NEVER_SKIP),
        slidingWindow: z.boolean().optional().default(false),
    }),
    instruction: z.string().trim().optional(),
    periodType: z
        .nativeEnum(ValidationRule.periodType)
        .default(ValidationRule.periodType.MONTHLY),
    importance: z.nativeEnum(Importance).default(Importance.MEDIUM),
    skipFormValidation: z.boolean().optional().default(false),
    organisationUnitLevels: z.array(z.number()).optional().default([]),
})

export const validationRuleListSchema = validationRuleBaseSchema
    .merge(withAttributeValues)
    .merge(withDefaultListColumns)

export const validationRuleFormSchema = validationRuleBaseSchema
    .merge(identifiable)
    .merge(withAttributeValues)

export const initialValues = getDefaultsOld(validationRuleFormSchema)
export const validate = createFormValidate(validationRuleFormSchema)
