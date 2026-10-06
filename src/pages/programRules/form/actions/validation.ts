import { ProgramRuleActionType } from '../../../../types/generated'
import { VALIDATION_MESSAGES } from './constants'
import type { ProgramRuleActionFormValues } from './types'

const programRuleActionType = ProgramRuleActionType

type ValidationErrors = Partial<
    Record<keyof ProgramRuleActionFormValues, string>
>

type FieldFlags = ReturnType<typeof getFieldFlags>

function getFieldFlags(values: ProgramRuleActionFormValues) {
    return {
        hasDataElement: !!values.dataElement?.id,
        hasTrackedEntityAttribute: !!values.trackedEntityAttribute?.id,
        hasOption: !!values.option?.id,
        hasOptionGroup: !!values.optionGroup?.id,
        hasProgramStageSection: !!values.programStageSection?.id,
        hasProgramStage: !!values.programStage?.id,
        hasNotificationTemplate: !!values.templateUid,
        hasContent: !!values.content,
        hasData: !!values.data,
        hasLocation: !!values.location,
    }
}

function requireDisplayWidget(flags: FieldFlags): ValidationErrors {
    if (flags.hasLocation) {
        return {}
    }
    return { location: VALIDATION_MESSAGES.DISPLAY_WIDGET }
}

function requireStaticText(flags: FieldFlags): ValidationErrors {
    if (flags.hasContent) {
        return {}
    }
    return { content: VALIDATION_MESSAGES.STATIC_TEXT_REQUIRED }
}

function requireProgramStage(flags: FieldFlags): ValidationErrors {
    if (flags.hasProgramStage) {
        return {}
    }
    return { programStage: VALIDATION_MESSAGES.HIDEPROGRAMSTAGE_STAGE }
}

function requireMessageTemplate(flags: FieldFlags): ValidationErrors {
    if (flags.hasNotificationTemplate) {
        return {}
    }
    return { templateUid: VALIDATION_MESSAGES.MESSAGE_TEMPLATE }
}

function validateDisplayText(flags: FieldFlags): ValidationErrors {
    const errors = requireDisplayWidget(flags)
    if (!flags.hasContent) {
        errors.content = VALIDATION_MESSAGES.STATIC_TEXT_REQUIRED
    }
    return errors
}

function validateDisplayKeyValuePair(flags: FieldFlags): ValidationErrors {
    const errors = requireDisplayWidget(flags)
    if (!flags.hasContent) {
        errors.content = VALIDATION_MESSAGES.KEY_LABEL_REQUIRED
    }
    return errors
}

function validateHideField(flags: FieldFlags): ValidationErrors {
    const errors: ValidationErrors = {}
    const hasTarget = flags.hasDataElement || flags.hasTrackedEntityAttribute
    if (!hasTarget) {
        errors.dataElement = VALIDATION_MESSAGES.HIDEFIELD
        errors.trackedEntityAttribute = VALIDATION_MESSAGES.HIDEFIELD
    }
    return errors
}

function validateHideSection(flags: FieldFlags): ValidationErrors {
    if (flags.hasProgramStageSection) {
        return {}
    }
    return { programStageSection: VALIDATION_MESSAGES.HIDESECTION_SECTION }
}

function validateHideProgramStage(flags: FieldFlags): ValidationErrors {
    return requireProgramStage(flags)
}

function validateAssign(flags: FieldFlags): ValidationErrors {
    const errors: ValidationErrors = {}
    const hasTarget =
        flags.hasDataElement ||
        flags.hasTrackedEntityAttribute ||
        flags.hasContent
    if (!hasTarget) {
        errors.dataElement = VALIDATION_MESSAGES.ASSIGN_TARGET
        errors.trackedEntityAttribute = VALIDATION_MESSAGES.ASSIGN_TARGET
        errors.content = VALIDATION_MESSAGES.ASSIGN_TARGET
    }
    if (!flags.hasData) {
        errors.data = VALIDATION_MESSAGES.ASSIGN_EXPRESSION
    }
    return errors
}

function validateShowWarning(flags: FieldFlags): ValidationErrors {
    return requireStaticText(flags)
}

function validateWarningOnComplete(flags: FieldFlags): ValidationErrors {
    return requireStaticText(flags)
}

function validateShowError(flags: FieldFlags): ValidationErrors {
    return requireStaticText(flags)
}

function validateErrorOnComplete(flags: FieldFlags): ValidationErrors {
    return requireStaticText(flags)
}

function validateSetMandatoryField(flags: FieldFlags): ValidationErrors {
    if (flags.hasDataElement || flags.hasTrackedEntityAttribute) {
        return {}
    }
    return {
        dataElement: VALIDATION_MESSAGES.SETMANDATORYFIELD,
        trackedEntityAttribute: VALIDATION_MESSAGES.SETMANDATORYFIELD,
    }
}

function validateSendMessage(flags: FieldFlags): ValidationErrors {
    return requireMessageTemplate(flags)
}

function validateScheduleMessage(flags: FieldFlags): ValidationErrors {
    const errors = requireMessageTemplate(flags)
    if (!flags.hasData) {
        errors.data = VALIDATION_MESSAGES.FIELD_REQUIRED
    }
    return errors
}

function validateScheduleEvent(flags: FieldFlags): ValidationErrors {
    const errors = requireProgramStage(flags)
    if (!flags.hasData) {
        errors.data = VALIDATION_MESSAGES.FIELD_REQUIRED
    }
    return errors
}

function validateHideOption(flags: FieldFlags): ValidationErrors {
    const errors: ValidationErrors = {}
    if (!flags.hasDataElement && !flags.hasTrackedEntityAttribute) {
        errors.dataElement = VALIDATION_MESSAGES.HIDEOPTION_DE_TEA
        errors.trackedEntityAttribute = VALIDATION_MESSAGES.HIDEOPTION_DE_TEA
    }
    if (
        (flags.hasDataElement || flags.hasTrackedEntityAttribute) &&
        !flags.hasOption
    ) {
        errors.option = VALIDATION_MESSAGES.HIDEOPTION_OPTION
    }
    return errors
}

function requireOptionGroupFields(flags: FieldFlags): ValidationErrors {
    const errors: ValidationErrors = {}
    if (!flags.hasDataElement && !flags.hasTrackedEntityAttribute) {
        errors.dataElement = VALIDATION_MESSAGES.OPTIONGROUP_DE_TEA
        errors.trackedEntityAttribute = VALIDATION_MESSAGES.OPTIONGROUP_DE_TEA
    }
    if (
        (flags.hasDataElement || flags.hasTrackedEntityAttribute) &&
        !flags.hasOptionGroup
    ) {
        errors.optionGroup = VALIDATION_MESSAGES.OPTIONGROUP_GROUP
    }
    return errors
}

function validateShowOptionGroup(flags: FieldFlags): ValidationErrors {
    return requireOptionGroupFields(flags)
}

function validateHideOptionGroup(flags: FieldFlags): ValidationErrors {
    return requireOptionGroupFields(flags)
}

export function validateProgramRuleAction(
    values: ProgramRuleActionFormValues
): ValidationErrors {
    const actionType = values.programRuleActionType
    const flags = getFieldFlags(values)
    const errors: ValidationErrors = {}

    if (!actionType) {
        errors.programRuleActionType = VALIDATION_MESSAGES.FIELD_REQUIRED
        return errors
    }

    const validators: Record<string, (flags: FieldFlags) => ValidationErrors> =
        {
            [programRuleActionType.DISPLAYTEXT]: validateDisplayText,
            [programRuleActionType.DISPLAYKEYVALUEPAIR]:
                validateDisplayKeyValuePair,
            [programRuleActionType.HIDEFIELD]: validateHideField,
            [programRuleActionType.HIDESECTION]: validateHideSection,
            [programRuleActionType.HIDEPROGRAMSTAGE]: validateHideProgramStage,
            [programRuleActionType.ASSIGN]: validateAssign,
            [programRuleActionType.SHOWWARNING]: validateShowWarning,
            [programRuleActionType.WARNINGONCOMPLETE]:
                validateWarningOnComplete,
            [programRuleActionType.SHOWERROR]: validateShowError,
            [programRuleActionType.ERRORONCOMPLETE]: validateErrorOnComplete,
            [programRuleActionType.SETMANDATORYFIELD]:
                validateSetMandatoryField,
            [programRuleActionType.SENDMESSAGE]: validateSendMessage,
            [programRuleActionType.SCHEDULEEVENT]: validateScheduleEvent,
            [programRuleActionType.SCHEDULEMESSAGE]: validateScheduleMessage,
            [programRuleActionType.HIDEOPTION]: validateHideOption,
            [programRuleActionType.SHOWOPTIONGROUP]: validateShowOptionGroup,
            [programRuleActionType.HIDEOPTIONGROUP]: validateHideOptionGroup,
        }

    const validate = validators[actionType]
    if (validate) {
        Object.assign(errors, validate(flags))
    }

    return errors
}
