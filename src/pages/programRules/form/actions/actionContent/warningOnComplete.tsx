import { messageActionFields } from './common/messageAction'

export const warningOnComplete = (
    programId: string,
    isEdit?: boolean,
    programType?: string
) => messageActionFields(programId, true, programType)
