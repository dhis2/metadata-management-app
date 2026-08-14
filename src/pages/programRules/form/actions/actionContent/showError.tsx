import { messageActionFields } from './common/messageAction'

export const showError = (
    programId: string,
    isEdit?: boolean,
    programType?: string
) => messageActionFields(programId, false, programType)
