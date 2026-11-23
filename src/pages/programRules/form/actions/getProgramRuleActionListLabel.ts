import i18n from '@dhis2/d2-i18n'
import { fromTaggedName } from '../../programRuleVariableTag'
import { ProgramRuleActionListItem } from './types'

const LOCATION_LABELS: Record<string, string> = {
    FEEDBACK: i18n.t('Feedback widget'),
    INDICATORS: i18n.t('Program indicator widget'),
}

function getLocationLabel(location?: string): string {
    return (location && LOCATION_LABELS[location]) ?? location ?? '-'
}

export function getProgramRuleActionListLabel(
    action: ProgramRuleActionListItem,
    templateNameById?: Record<string, string>
): string {
    const {
        programRuleActionType,
        content,
        data,
        location,
        dataElement,
        trackedEntityAttribute,
        programRuleVariable,
        programStage,
        programStageSection,
        option,
        optionGroup,
        templateUid,
    } = action

    const templateLabel = templateUid ? templateNameById?.[templateUid] : '-'

    const targetDeAndTea = [
        dataElement?.displayName,
        trackedEntityAttribute?.displayName,
    ]
        .filter(Boolean)
        .join(', ')
    const targetLocation = location
    const targetAssign = [
        dataElement?.displayName,
        trackedEntityAttribute?.displayName,
        programRuleVariable?.displayName &&
            fromTaggedName(programRuleVariable.displayName),
        content && fromTaggedName(content),
    ]
        .filter(Boolean)
        .join(', ')

    switch (programRuleActionType) {
        case 'SHOWWARNING':
            return i18n.t('Show warning: {{content}} on {{target}}', {
                content,
                target: targetDeAndTea || '-',
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        case 'SHOWERROR':
            return i18n.t('Show error: {{content}} on {{target}}', {
                content,
                target: targetDeAndTea || '-',
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        case 'WARNINGONCOMPLETE':
            return i18n.t('Warning on complete: {{content}} on {{target}}', {
                content,
                target: targetDeAndTea || '-',
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        case 'ERRORONCOMPLETE':
            return i18n.t('Error on complete: {{content}} on {{target}}', {
                content,
                target: targetDeAndTea || '-',
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        case 'DISPLAYTEXT':
            return i18n.t('Display text: {{content}} on {{location}}', {
                content,
                location: getLocationLabel(targetLocation),
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        case 'DISPLAYKEYVALUEPAIR':
            return i18n.t(
                'Display key-value pair: {{content}} on {{location}}',
                {
                    content,
                    location: getLocationLabel(targetLocation),
                    nsSeparator: false,
                    interpolation: { escapeValue: false },
                }
            )
        case 'HIDEFIELD':
            return i18n.t('Hide field: {{target}}', {
                target: targetDeAndTea || '-',
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        case 'SETMANDATORYFIELD':
            return i18n.t('Make field mandatory: {{target}}', {
                target: targetDeAndTea || '-',
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        case 'HIDESECTION':
            return i18n.t('Hide section: {{section}}', {
                section:
                    programStageSection?.displayName ??
                    programStageSection?.id ??
                    '-',
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        case 'HIDEPROGRAMSTAGE':
            return i18n.t('Prevent adding new events to stage: {{stage}}', {
                stage: programStage?.displayName ?? programStage?.id ?? '-',
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        case 'ASSIGN': {
            return i18n.t('Assign: {{data}} to field {{target}}', {
                data: data || '-',
                target: targetAssign || '-',
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        }
        case 'SCHEDULEEVENT':
            return i18n.t(
                'Schedule event in program stage: {{stage}} at date {{data}}',
                {
                    stage: programStage?.displayName ?? programStage?.id ?? '-',
                    data: data || '-',
                    nsSeparator: false,
                    interpolation: { escapeValue: false },
                }
            )
        case 'SCHEDULEMESSAGE':
            return i18n.t('Schedule message: {{template}} at date {{data}}', {
                template: templateLabel,
                data: data || '',
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        case 'SENDMESSAGE':
            return i18n.t('Send message: {{template}}', {
                template: templateLabel,
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        case 'HIDEOPTION':
            return i18n.t('Hide option: {{option}} on {{target}}', {
                option: option?.displayName ?? option?.id ?? '-',
                target: targetDeAndTea || '-',
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        case 'SHOWOPTIONGROUP':
            return i18n.t('Show option group: {{group}} on {{target}}', {
                group: optionGroup?.displayName ?? optionGroup?.id ?? '-',
                target: targetDeAndTea || '-',
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        case 'HIDEOPTIONGROUP':
            return i18n.t('Hide option group: {{group}} on {{target}}', {
                group: optionGroup?.displayName ?? optionGroup?.id ?? '-',
                target: targetDeAndTea || '-',
                nsSeparator: false,
                interpolation: { escapeValue: false },
            })
        default:
            return i18n.t('Unknown action type')
    }
}
