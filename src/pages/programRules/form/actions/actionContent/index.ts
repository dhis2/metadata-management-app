import type { ReactNode } from 'react'

export type ActionFieldsRenderer = (
    programId: string,
    isEdit?: boolean,
    programType?: string
) => ReactNode

export { assign } from './assign'
export { displayKeyValuePair } from './displayKeyValuePair'
export { displayText } from './displayText'
export { errorOnComplete } from './errorOnComplete'
export { hideField } from './hideField'
export { hideOption } from './hideOption'
export { hideOptionGroup } from './hideOptionGroup'
export { hideProgramStage } from './hideProgramStage'
export { hideSection } from './hideSection'
export { scheduleEvent } from './scheduleEvent'
export { scheduleMessage } from './scheduleMessage'
export { sendMessage } from './sendMessage'
export { setMandatoryField } from './setMandatoryField'
export { showError } from './showError'
export { showOptionGroup } from './showOptionGroup'
export { showWarning } from './showWarning'
export { warningOnComplete } from './warningOnComplete'
