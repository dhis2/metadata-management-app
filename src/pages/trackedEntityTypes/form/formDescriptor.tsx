import i18n from '@dhis2/d2-i18n'
import { SectionedFormDescriptor } from '../../../lib'
import { trackedEntityTypeFormSchema } from './TrackedEntityTypeFormSchema'

type TrackedEntityTypeValues = typeof trackedEntityTypeFormSchema._type

export const TrackedEntityTypeFormDescriptor = {
    name: 'TrackedEntityType',
    label: 'Tracked Entity Type',
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
                    name: 'trackedEntityTypesLabel',
                    label: i18n.t('Name (Plural)'),
                },
                {
                    name: 'shortName',
                    label: i18n.t('Short name'),
                },
                {
                    name: 'description',
                    label: i18n.t('Description'),
                },
                {
                    name: 'featureType',
                    label: i18n.t('Feature type'),
                },
                {
                    name: 'style',
                    label: i18n.t('Color and icon'),
                },
                {
                    name: 'allowAuditLog',
                    label: i18n.t('Enable tracked entity instance audit log'),
                },
                {
                    name: 'minAttributesRequiredToSearch',
                    label: i18n.t(
                        'Minimum number of attributes required to search'
                    ),
                },
                {
                    name: 'maxTeiCountToReturn',
                    label: i18n.t(
                        'Maximum number of tracked entity instances to return when searching'
                    ),
                },
            ],
        },
        {
            name: 'trackedEntityAttributes',
            label: i18n.t('Tracked entity attributes'),
            fields: [
                {
                    name: 'trackedEntityTypeAttributes',
                    label: i18n.t('Tracked entity attributes'),
                },
            ],
        },
    ],
} as const satisfies SectionedFormDescriptor<TrackedEntityTypeValues>
