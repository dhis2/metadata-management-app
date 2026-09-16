import i18n from '@dhis2/d2-i18n'
import { ProgramRuleActionType } from '../../../../types/generated'

export const ACTION_FIELDS_TO_CLEAR = [
    'content',
    'data',
    'dataElement',
    'location',
    'option',
    'optionGroup',
    'priority',
    'programStage',
    'programStageSection',
    'templateUid',
    'trackedEntityAttribute',
] as const

const programRuleActionType = ProgramRuleActionType

export const ACTION_TYPE_OPTIONS = [
    { label: i18n.t('Assign value'), value: programRuleActionType.ASSIGN },
    {
        label: i18n.t('Display key-value pair'),
        value: programRuleActionType.DISPLAYKEYVALUEPAIR,
    },
    { label: i18n.t('Display text'), value: programRuleActionType.DISPLAYTEXT },
    {
        label: i18n.t('Error on complete'),
        value: programRuleActionType.ERRORONCOMPLETE,
    },
    { label: i18n.t('Hide field'), value: programRuleActionType.HIDEFIELD },
    { label: i18n.t('Hide option'), value: programRuleActionType.HIDEOPTION },
    {
        label: i18n.t('Hide option group'),
        value: programRuleActionType.HIDEOPTIONGROUP,
    },
    {
        label: i18n.t('Hide program stage'),
        value: programRuleActionType.HIDEPROGRAMSTAGE,
    },
    { label: i18n.t('Hide section'), value: programRuleActionType.HIDESECTION },
    {
        label: i18n.t('Schedule event'),
        value: programRuleActionType.SCHEDULEEVENT,
    },
    {
        label: i18n.t('Schedule message'),
        value: programRuleActionType.SCHEDULEMESSAGE,
    },
    {
        label: i18n.t('Send message'),
        value: programRuleActionType.SENDMESSAGE,
    },
    {
        label: i18n.t('Set mandatory field'),
        value: programRuleActionType.SETMANDATORYFIELD,
    },
    { label: i18n.t('Show error'), value: programRuleActionType.SHOWERROR },
    {
        label: i18n.t('Show option group'),
        value: programRuleActionType.SHOWOPTIONGROUP,
    },
    { label: i18n.t('Show warning'), value: programRuleActionType.SHOWWARNING },
    {
        label: i18n.t('Warning on complete'),
        value: programRuleActionType.WARNINGONCOMPLETE,
    },
].sort((a, b) => a.label.localeCompare(b.label))

export const VALIDATION_MESSAGES = {
    ASSIGN_EXPRESSION: i18n.t('Expression to evaluate and assign is required'),
    ASSIGN_TARGET: i18n.t(
        'At least one of the data element, tracked entity attribute, or program rule variable must be provided'
    ),
    DISPLAY_WIDGET: i18n.t('Display widget is required'),
    FIELD_REQUIRED: i18n.t('This field is required'),
    HIDEFIELD: i18n.t(
        'At least one of the data element or tracked entity attribute must be provided'
    ),
    HIDEPROGRAMSTAGE_STAGE: i18n.t('Program stage is required'),
    HIDESECTION_SECTION: i18n.t('Program stage section to hide is required'),
    HIDEOPTION_DE_TEA: i18n.t(
        'Select a data element or tracked entity attribute with option set'
    ),
    HIDEOPTION_OPTION: i18n.t('Option to hide is required'),
    KEY_LABEL_REQUIRED: i18n.t('Key label is required'),
    MESSAGE_TEMPLATE: i18n.t('Message template is required'),
    OPTIONGROUP_DE_TEA: i18n.t(
        'Select a data element or tracked entity attribute with option set'
    ),
    OPTIONGROUP_GROUP: i18n.t('Option group is required'),
    SETMANDATORYFIELD: i18n.t(
        'Select at least one: data element or tracked entity attribute',
        { nsSeparator: '~:~' }
    ),
    STATIC_TEXT_REQUIRED: i18n.t('Static text is required'),
} as const
