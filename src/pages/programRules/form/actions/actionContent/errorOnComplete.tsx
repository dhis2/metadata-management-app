import { messageActionFields } from './common/messageAction'

export const errorOnComplete = (
    programId: string,
    isEdit?: boolean,
    programType?: string
) => messageActionFields(programId, false, programType)
