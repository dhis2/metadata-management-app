import i18n from '@dhis2/d2-i18n'
import { SectionedFormDescriptor } from '../../../lib'
import { ValidationRuleFormValues } from '../Edit'

export const ValidationRuleFormDescriptor = {
    name: 'ValidationRulesForm',
    label: i18n.t('Validation Rules Form'),
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
            ],
        },
        {
            name: 'expressionsAndOutput',
            label: i18n.t('Expressions and output'),
            fields: [
                {
                    name: 'leftSide.expression',
                    label: i18n.t('Left side expression'),
                },
                {
                    name: 'leftSide.description',
                    label: i18n.t('Description'),
                },
                {
                    name: 'leftSide.missingValueStrategy',
                    label: i18n.t('Left side missing value strategy'),
                },
                {
                    name: 'leftSide.slidingWindow',
                    label: i18n.t('Left side sliding window'),
                },
                {
                    name: 'operator',
                    label: i18n.t('Comparison operator'),
                },
                {
                    name: 'rightSide.expression',
                    label: i18n.t('Right side expression'),
                },
                {
                    name: 'rightSide.description',
                    label: i18n.t('Description'),
                },
                {
                    name: 'rightSide.missingValueStrategy',
                    label: i18n.t('Right side missing value strategy'),
                },
                {
                    name: 'rightSide.slidingWindow',
                    label: i18n.t('Right side sliding window'),
                },
                {
                    name: 'instruction',
                    label: i18n.t('Instruction to show'),
                },
                {
                    name: 'periodType',
                    label: i18n.t('Period type'),
                },
                {
                    name: 'importance',
                    label: i18n.t('Importance'),
                },
            ],
        },
        {
            name: 'options',
            label: i18n.t('Options'),
            fields: [
                {
                    name: 'skipFormValidation',
                    label: i18n.t('Skip form validation'),
                },
                {
                    name: 'organisationUnitLevels',
                    label: i18n.t('Organisation unit levels'),
                },
            ],
        },
    ],
} as const satisfies SectionedFormDescriptor<ValidationRuleFormValues>
