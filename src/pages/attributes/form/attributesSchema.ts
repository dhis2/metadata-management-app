import { z } from 'zod'
import {
    getDefaultsOld,
    createFormValidate,
    modelFormSchemas,
} from '../../../lib'
import { ValueType } from '../../../types/generated'

const { identifiable, withDefaultListColumns } = modelFormSchemas

const attributeBaseSchema = z.object({
    code: z.string().trim().optional(),
    valueType: z.nativeEnum(ValueType).default(ValueType.TEXT),
    mandatory: z.boolean().default(false),
    unique: z.boolean().default(false),
})

export const attributeFormSchema = identifiable
    .merge(attributeBaseSchema)
    .extend({
        shortName: z.string().trim().optional(),
        description: z.string().trim().optional(),
        optionSet: z
            .object({
                id: z.string().trim().optional(),
                displayName: z.string().trim().optional(),
            })
            .optional(),
        sortOrder: z.number().optional(),
        categoryAttribute: z.boolean().default(false),
        categoryOptionAttribute: z.boolean().default(false),
        categoryOptionComboAttribute: z.boolean().default(false),
        categoryOptionGroupAttribute: z.boolean().default(false),
        categoryOptionGroupSetAttribute: z.boolean().default(false),
        constantAttribute: z.boolean().default(false),
        dataElementAttribute: z.boolean().default(false),
        dataElementGroupAttribute: z.boolean().default(false),
        dataElementGroupSetAttribute: z.boolean().default(false),
        dataSetAttribute: z.boolean().default(false),
        documentAttribute: z.boolean().default(false),
        eventChartAttribute: z.boolean().default(false),
        eventReportAttribute: z.boolean().default(false),
        indicatorAttribute: z.boolean().default(false),
        indicatorGroupAttribute: z.boolean().default(false),
        legendSetAttribute: z.boolean().default(false),
        mapAttribute: z.boolean().default(false),
        optionAttribute: z.boolean().default(false),
        optionSetAttribute: z.boolean().default(false),
        organisationUnitAttribute: z.boolean().default(false),
        organisationUnitGroupAttribute: z.boolean().default(false),
        organisationUnitGroupSetAttribute: z.boolean().default(false),
        programAttribute: z.boolean().default(false),
        programIndicatorAttribute: z.boolean().default(false),
        programStageAttribute: z.boolean().default(false),
        relationshipTypeAttribute: z.boolean().default(false),
        sectionAttribute: z.boolean().default(false),
        sqlViewAttribute: z.boolean().default(false),
        trackedEntityAttributeAttribute: z.boolean().default(false),
        trackedEntityTypeAttribute: z.boolean().default(false),
        userAttribute: z.boolean().default(false),
        userGroupAttribute: z.boolean().default(false),
        validationRuleAttribute: z.boolean().default(false),
        validationRuleGroupAttribute: z.boolean().default(false),
        visualizationAttribute: z.boolean().default(false),
    })

export const attributeListSchema = attributeBaseSchema.merge(
    withDefaultListColumns
)

export const initialValues = getDefaultsOld(attributeFormSchema)

export const validate = createFormValidate(attributeFormSchema)
