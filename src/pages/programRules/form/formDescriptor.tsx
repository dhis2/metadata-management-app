import i18n from '@dhis2/d2-i18n'
import { SectionedFormDescriptor } from '../../../lib'
import { ProgramRuleFormValues } from './fieldFilters'

export const ProgramRuleFormDescriptor = {
    name: 'ProgramRule',
    label: i18n.t('Program Rule'),
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
                    name: 'description',
                    label: i18n.t('Description'),
                },
                {
                    name: 'program',
                    label: i18n.t('Program'),
                },
                {
                    name: 'programStage',
                    label: i18n.t('Program stages to trigger rule'),
                },
                {
                    name: 'priority',
                    label: i18n.t('Priority'),
                },
            ],
        },
        {
            name: 'expression',
            label: i18n.t('Expression'),
            fields: [
                {
                    name: 'condition',
                    label: i18n.t('Condition'),
                },
            ],
        },
        {
            name: 'actions',
            label: i18n.t('Actions'),
            fields: [],
        },
    ],
} as const satisfies SectionedFormDescriptor<ProgramRuleFormValues>
