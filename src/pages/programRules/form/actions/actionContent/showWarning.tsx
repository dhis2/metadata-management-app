import { messageActionFields } from './common/messageAction'

export const showWarning = (
    programId: string,
    isEdit?: boolean,
    programType?: string
) => messageActionFields(programId, true, programType)
