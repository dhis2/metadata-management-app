import { useState } from 'react'
import { FieldMetaState } from 'react-final-form'

export function useFieldWarning(
    meta: Pick<FieldMetaState<string>, 'touched' | 'invalid'>,
    computeWarning: (
        value: string
    ) => string | undefined | Promise<string | undefined>
) {
    const [warning, setWarning] = useState<string | undefined>()
    const hasBlockingError = meta.touched && meta.invalid

    return {
        onChange: async (value: string) => {
            setWarning(await computeWarning(value))
        },
        validationText: hasBlockingError ? undefined : warning,
        warning: !hasBlockingError && !!warning,
    }
}
