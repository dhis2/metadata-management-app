import { getTranslatedProperty } from '../../constants/translatedModelProperties'
import { uniqueBy } from '../../utils'
import {
    defaultModelViewConfig,
    modelListViewsConfig,
    ViewConfig,
    ViewConfigPart,
    ModelPropertyConfig,
    ModelPropertyDescriptor,
    FilterDescriptor,
    FilterConfig,
} from './sectionListViewsConfig'

interface ResolvedViewConfigPart<TEntry> {
    available: ReadonlyArray<TEntry>
    default: ReadonlyArray<TEntry>
}
interface ResolvedViewConfig {
    columns: ResolvedViewConfigPart<ModelPropertyDescriptor>
    filters: ResolvedViewConfigPart<FilterDescriptor>
}

interface ResolvedSectionListView {
    [key: string]: ResolvedViewConfig
}

export const toModelPropertyDescriptor = (
    propertyConfig: ModelPropertyConfig
): ModelPropertyDescriptor => {
    if (typeof propertyConfig === 'string') {
        return {
            label: getTranslatedProperty(propertyConfig),
            path: propertyConfig,
        }
    }
    return propertyConfig
}

export const toFilterDescriptor = (
    propertyConfig: FilterConfig
): FilterDescriptor => {
    if (typeof propertyConfig === 'string') {
        return {
            label: getTranslatedProperty(propertyConfig),
            filterKey: propertyConfig,
        }
    }
    return propertyConfig
}

const resolveFilterConfig = (
    part: ViewConfigPart<FilterConfig>
): ResolvedViewConfigPart<FilterDescriptor> => {
    const { default: defaultFilters, available: defaultAvailableFilers } =
        defaultModelViewConfig.filters

    const mergedAvailableDescriptors = uniqueBy(
        [
            part.available || [],
            part.overrideDefaultAvailable ? [] : defaultAvailableFilers || [],
            part.default || [],
        ]
            .flat()
            .map((propConfig) => toFilterDescriptor(propConfig)),
        (prop) => prop.filterKey
    )
    const defaultPropConfig = part.default || defaultFilters || []
    const defaultDescriptors = defaultPropConfig.map((propConfig) =>
        toFilterDescriptor(propConfig)
    )
    return {
        available: mergedAvailableDescriptors,
        default: defaultDescriptors,
    }
}

const resolveColumnConfig = (
    part: ViewConfigPart<ModelPropertyConfig>
): ResolvedViewConfigPart<ModelPropertyDescriptor> => {
    const { default: defaultFilters, available: defaultAvailableFilers } =
        defaultModelViewConfig.columns

    const mergedAvailableDescriptors = uniqueBy(
        [
            part.available || [],
            part.overrideDefaultAvailable ? [] : defaultAvailableFilers || [],
            part.default || [],
        ]
            .flat()
            .map((propConfig) => toModelPropertyDescriptor(propConfig)),
        (prop) => prop.path
    )
    const defaultPropConfig = part.default || defaultFilters || []
    const defaultDescriptors = defaultPropConfig.map((propConfig) =>
        toModelPropertyDescriptor(propConfig)
    )
    return {
        available: mergedAvailableDescriptors,
        default: defaultDescriptors,
    }
}

// merge the default modelViewConfig with the modelViewsConfig for each section
const resolveListViewsConfig = () => {
    const merged: ResolvedSectionListView = {}

    Object.entries(modelListViewsConfig).forEach((viewConfig) => {
        const [sectionName, sectionViewConfig] = viewConfig
        merged[sectionName] = {
            columns: resolveColumnConfig(sectionViewConfig.columns),
            filters: resolveFilterConfig(sectionViewConfig.filters),
        }
    })
    return merged
}

const resolvedModelViewsConfig = resolveListViewsConfig()
const resolvedDefaultConfig = {
    columns: resolveColumnConfig(defaultModelViewConfig.columns),
    filters: resolveFilterConfig(defaultModelViewConfig.filters),
}

export const getViewConfigForSection = (
    sectionName: string
): ResolvedViewConfig => {
    const resolvedConfig = resolvedModelViewsConfig[sectionName]
    if (resolvedConfig) {
        return resolvedConfig
    }
    return resolvedDefaultConfig
}

export const getColumnsForSection = (
    sectionName: string
): ResolvedViewConfig['columns'] => {
    const view = getViewConfigForSection(sectionName)
    return view.columns
}

export const getFiltersForSection = (
    sectionName: string
): ResolvedViewConfig['filters'] => {
    const view = getViewConfigForSection(sectionName)
    return view.filters
}

export const shouldFilterOutDefaultForSection = (
    sectionName: keyof typeof modelListViewsConfig
) =>
    (modelListViewsConfig[sectionName] as ViewConfig | undefined)
        ?.shouldFilterOutDefault ?? false
