import i18n from '@dhis2/d2-i18n'
import { SectionedFormDescriptor } from '../../../lib'
import { IndicatorFormValues } from './indicatorSchema'

export const IndicatorFormDescriptor = {
    name: 'IndicatorsForm',
    label: i18n.t('Indicators Form'),
    sections: [
        {
            name: 'basicInformation',
            label: i18n.t('Basic information'),
            fields: [
                {
                    name: 'name',
                    label: i18n.t('Name'),
                },
                {
                    name: 'shortName',
                    label: i18n.t('Short name'),
                },
                {
                    name: 'code',
                    label: i18n.t('Code'),
                },
                {
                    name: 'description',
                    label: i18n.t('Description'),
                },
                {
                    name: 'url',
                    label: i18n.t('URL'),
                },
                {
                    name: 'style',
                    label: i18n.t('Visual configuration'),
                },
            ],
        },
        {
            name: 'expressions',
            label: i18n.t('Calculation details'),
            fields: [
                {
                    name: 'indicatorType',
                    label: i18n.t('Indicator type'),
                },
                {
                    name: 'numeratorDescription',
                    label: i18n.t('Numerator description'),
                },
                {
                    name: 'numerator',
                    label: i18n.t('Numerator'),
                },
                {
                    name: 'denominatorDescription',
                    label: i18n.t('Denominator description'),
                },
                {
                    name: 'denominator',
                    label: i18n.t('Denominator'),
                },
                {
                    name: 'annualized',
                    label: i18n.t('Annualized'),
                },
                {
                    name: 'decimals',
                    label: i18n.t('Decimals in data output'),
                },
            ],
        },
        {
            name: 'legends',
            label: i18n.t('Legends'),
            fields: [
                {
                    name: 'legendSets',
                    label: i18n.t('Legend sets'),
                },
            ],
        },
        {
            name: 'groups',
            label: i18n.t('Groups'),
            fields: [
                {
                    name: 'indicatorGroups',
                    label: i18n.t('Indicator groups'),
                },
            ],
        },
        {
            name: 'mappingSettings',
            label: i18n.t('Mapping settings'),
            fields: [
                {
                    name: 'aggregateExportCategoryOptionCombo',
                    label: i18n.t(
                        'Category option combination for aggregate data export'
                    ),
                },
                {
                    name: 'aggregateExportAttributeOptionCombo',
                    label: i18n.t(
                        'Attribute option combination for aggregate data export'
                    ),
                },
            ],
        },
    ],
} as const satisfies SectionedFormDescriptor<IndicatorFormValues>
