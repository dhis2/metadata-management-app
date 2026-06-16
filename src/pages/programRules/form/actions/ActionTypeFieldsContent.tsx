import React from 'react'
import { ProgramRuleActionType } from '../../../../types/generated'
import {
    type ActionFieldsRenderer,
    assign,
    displayKeyValuePair,
    displayText,
    errorOnComplete,
    hideField,
    hideOption,
    hideOptionGroup,
    hideProgramStage,
    hideSection,
    scheduleEvent,
    scheduleMessage,
    sendMessage,
    setMandatoryField,
    showError,
    showOptionGroup,
    showWarning,
    warningOnComplete,
} from './actionContent'

const ACTION_TYPE = ProgramRuleActionType

const ACTION_FIELDS_MAP: Partial<Record<string, ActionFieldsRenderer>> = {
    [ACTION_TYPE.DISPLAYTEXT]: displayText,
    [ACTION_TYPE.DISPLAYKEYVALUEPAIR]: displayKeyValuePair,
    [ACTION_TYPE.HIDEFIELD]: hideField,
    [ACTION_TYPE.HIDESECTION]: hideSection,
    [ACTION_TYPE.HIDEPROGRAMSTAGE]: hideProgramStage,
    [ACTION_TYPE.SHOWWARNING]: showWarning,
    [ACTION_TYPE.SHOWERROR]: showError,
    [ACTION_TYPE.WARNINGONCOMPLETE]: warningOnComplete,
    [ACTION_TYPE.ERRORONCOMPLETE]: errorOnComplete,
    [ACTION_TYPE.SETMANDATORYFIELD]: setMandatoryField,
    [ACTION_TYPE.ASSIGN]: assign,
    [ACTION_TYPE.SENDMESSAGE]: sendMessage,
    [ACTION_TYPE.SCHEDULEEVENT]: scheduleEvent,
    [ACTION_TYPE.SCHEDULEMESSAGE]: scheduleMessage,
    [ACTION_TYPE.HIDEOPTION]: hideOption,
    [ACTION_TYPE.SHOWOPTIONGROUP]: showOptionGroup,
    [ACTION_TYPE.HIDEOPTIONGROUP]: hideOptionGroup,
}

export function ActionTypeFieldsContent({
    programId,
    isEdit,
    actionType,
}: Readonly<{
    programId: string
    isEdit: boolean
    actionType: string | undefined
}>) {
    const render = actionType ? ACTION_FIELDS_MAP[actionType] : undefined
    return render ? <>{render(programId, isEdit)}</> : null
}
