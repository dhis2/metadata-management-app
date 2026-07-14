import { BooleanParam, StringParam } from 'use-query-params'
import { z } from 'zod'
import { Category, DataElement, DataSet } from '../../../types/generated'
import { KeysOfValue } from '../../../types/utility'
import { IDENTIFIABLE_FILTER_KEY } from '../../constants'
import { isValidUid, parseAccessString } from '../../models'
import { CustomDelimitedArrayParam } from './customParams'

const zodArrayIds = z.array(z.string().refine((val) => isValidUid(val)))

/* Zod schema for validation of the decoded params */
export const filterParamsSchema = z
    .object({
        [IDENTIFIABLE_FILTER_KEY]: z.string(),
        formName: z.string(),
        aggregationType: z.array(z.nativeEnum(DataElement.aggregationType)),
        category: zodArrayIds,
        categoryCombo: zodArrayIds,
        categoryOption: zodArrayIds,
        categoryOptionGroup: zodArrayIds,
        categoryOptionGroupSet: zodArrayIds,
        compulsory: z.boolean(),
        dataDimension: z.boolean(),
        dataDimensionType: z.nativeEnum(Category.dataDimensionType),
        dataElement: zodArrayIds,
        dataElementGroup: zodArrayIds,
        dataElementGroupSet: zodArrayIds,
        dataSet: zodArrayIds,
        domainType: z.array(z.nativeEnum(DataElement.domainType)),
        formType: z.array(z.nativeEnum(DataSet.formType)),
        ignoreApproval: z.boolean(),
        indicator: zodArrayIds,
        indicatorType: zodArrayIds,
        indicatorGroup: zodArrayIds,
        indicatorGroupSet: zodArrayIds,
        organisationUnitGroup: zodArrayIds,
        organisationUnitGroupSet: zodArrayIds,
        publicAccess: z.array(
            z.string().refine((val) => parseAccessString(val) !== null)
        ),
        program: zodArrayIds,
        trackerProgram: zodArrayIds,
        programType: z.string(),
        programIndicator: zodArrayIds,
        programIndicatorGroup: zodArrayIds,
        programRuleVariableSourceType: z.string(),
        validationRuleGroup: zodArrayIds,
        valueType: z.array(z.nativeEnum(DataElement.valueType)),
    })
    .partial()

/* useQueryParams config-map object
Mapping each filter to a config object that handles encoding/decoding */
export const filterQueryParamType = {
    [IDENTIFIABLE_FILTER_KEY]: StringParam,
    formName: StringParam,
    aggregationType: CustomDelimitedArrayParam,
    category: CustomDelimitedArrayParam,
    categoryCombo: CustomDelimitedArrayParam,
    categoryOption: CustomDelimitedArrayParam,
    categoryOptionGroup: CustomDelimitedArrayParam,
    categoryOptionGroupSet: CustomDelimitedArrayParam,
    compulsory: BooleanParam,
    dataDimension: BooleanParam,
    dataDimensionType: StringParam,
    dataElement: CustomDelimitedArrayParam,
    dataElementGroup: CustomDelimitedArrayParam,
    dataElementGroupSet: CustomDelimitedArrayParam,
    dataSet: CustomDelimitedArrayParam,
    domainType: CustomDelimitedArrayParam,
    formType: CustomDelimitedArrayParam,
    ignoreApproval: BooleanParam,
    indicator: CustomDelimitedArrayParam,
    indicatorType: CustomDelimitedArrayParam,
    indicatorGroup: CustomDelimitedArrayParam,
    indicatorGroupSet: CustomDelimitedArrayParam,
    organisationUnitGroup: CustomDelimitedArrayParam,
    organisationUnitGroupSet: CustomDelimitedArrayParam,
    publicAccess: CustomDelimitedArrayParam,
    program: CustomDelimitedArrayParam,
    trackerProgram: CustomDelimitedArrayParam,
    programType: StringParam,
    programIndicator: CustomDelimitedArrayParam,
    programIndicatorGroup: CustomDelimitedArrayParam,
    programRuleVariableSourceType: StringParam,
    validationRuleGroup: CustomDelimitedArrayParam,
    valueType: CustomDelimitedArrayParam,
} as const satisfies QueryParamsConfigMap

export const validFilterKeys = Object.keys(filterQueryParamType)

export type ParsedFilterParams = z.infer<typeof filterParamsSchema>

type MapZodTypeToQueryParamConfig<TZodResultType> =
    TZodResultType extends string
        ? typeof StringParam
        : TZodResultType extends boolean
        ? typeof BooleanParam
        : typeof CustomDelimitedArrayParam

/* Type is just used to verify that the ParamType-config matches the zod schema
Eg. that a value that is a string in zod-schema also uses StringParam for encode/decode */
type QueryParamsConfigMap = {
    [key in keyof ParsedFilterParams]-?: MapZodTypeToQueryParamConfig<
        ParsedFilterParams[key]
    >
}

export type FilterKey = keyof ParsedFilterParams
// Identifiable is not configurable, and is always shown in the list
export type ConfigurableFilterKey = Exclude<
    FilterKey,
    typeof IDENTIFIABLE_FILTER_KEY
>

export type BooleanFilterKey = KeysOfValue<
    ParsedFilterParams,
    boolean | undefined
>

export type StringFilterKey = KeysOfValue<
    ParsedFilterParams,
    string[] | string | undefined
>

export type FilterKeys = FilterKey[]
