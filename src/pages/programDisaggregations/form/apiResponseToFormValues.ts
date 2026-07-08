import { z } from 'zod'
import { DEFAULT_CATEGORY_COMBO } from '../../../lib'
import { DataDimensionType } from '../../../types/generated'
import { ProgramData, ProgramIndicatorData } from '../Edit'
import {
    categoryMapping,
    CategoryMappingsRecord,
    ProgramIndicatorMappingsRecord,
} from './programDisaggregationSchema'

const getMappingType = (
    catMapping: z.infer<typeof categoryMapping>,
    combos: {
        categories: {
            id: string
        }[]
        dataDimensionType: DataDimensionType
    }[]
) => {
    const inCombo = combos.find((combo) =>
        combo.categories.some((cat) => cat.id === catMapping.categoryId)
    )
    return inCombo?.dataDimensionType
}

export const apiResponseToFormValues = ({
    program,
    programIndicators,
}: {
    program: ProgramData
    programIndicators: ProgramIndicatorData
}) => {
    // group categoryMappings per categoryId
    const categoryMappings = program.categoryMappings.reduce((acc, mapping) => {
        acc[mapping.categoryId] = [
            ...(acc[mapping.categoryId] ?? []),
            {
                ...mapping,
                deleted: false,
                options: mapping.optionMappings.reduce((opts, opt) => {
                    opts[opt.optionId] = {
                        filter: opt.filter,
                        optionId: opt.optionId,
                    }
                    return opts
                }, {} as Record<string, { filter: string; optionId: string }>),
            },
        ]
        return acc
    }, {} as CategoryMappingsRecord)
    for (const cat in categoryMappings) {
        categoryMappings[cat].sort((a, b) =>
            a.mappingName.localeCompare(b.mappingName)
        )
    }

    const programIndicatorMappings = programIndicators.programIndicators
        .filter(
            (pi) =>
                pi.categoryMappingIds.length > 0 ||
                (pi.attributeCombo as any)?.id !== DEFAULT_CATEGORY_COMBO.id ||
                (pi.categoryCombo as any)?.id !== DEFAULT_CATEGORY_COMBO.id ||
                pi.aggregateExportAttributeOptionCombo ||
                pi.aggregateExportCategoryOptionCombo ||
                pi.aggregateExportDataElement
        )
        .reduce((acc, indicator) => {
            const disAggCombo = indicator.categoryCombo
            const attributeCombo = indicator.attributeCombo

            const categoryMappingsMap = new Map(
                Object.values(categoryMappings)
                    .flat()
                    .map((cm) => [cm.id, cm])
            )
            const mappingByComboType = {
                disaggregation: {},
                attribute: {},
            }

            indicator.categoryMappingIds.forEach((categoryMappingId) => {
                const categoryMapping =
                    categoryMappingsMap.get(categoryMappingId)
                if (!categoryMapping) {
                    return acc
                }
                const type = getMappingType(categoryMapping, [
                    disAggCombo,
                    attributeCombo,
                ])
                if (!type) {
                    return acc
                }
                const key =
                    type === DataDimensionType.DISAGGREGATION
                        ? 'disaggregation'
                        : 'attribute'

                mappingByComboType[key] = {
                    ...mappingByComboType[key],
                    [categoryMapping.categoryId]: categoryMappingId,
                }
            })
            acc[indicator.id] = {
                ...indicator,
                ...mappingByComboType,
            }
            return acc
        }, {} as ProgramIndicatorMappingsRecord)

    return {
        categoryMappings,
        programIndicatorMappings,
    }
}
