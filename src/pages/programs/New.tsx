import React from 'react'
import { useLocationSearchState } from '../../lib'
import { NewEventProgram } from './NewEventProgram'
import { NewTrackerProgram } from './NewTrackerProgram'

export const Component = ({
    onSubmitted,
    footer,
    redirectOnSubmitted = true,
}: {
    readonly onSubmitted?: () => void
    readonly footer?: React.ReactNode
    readonly redirectOnSubmitted?: boolean
} = {}) => {
    const locationState = useLocationSearchState()
    const queryParams = new URLSearchParams(locationState?.search)
    const programType =
        queryParams.get('programType') ||
        ('WITHOUT_REGISTRATION' as 'WITHOUT_REGISTRATION' | 'WITH_REGISTRATION')

    return programType === 'WITH_REGISTRATION' ? (
        <NewTrackerProgram
            onSubmitted={onSubmitted}
            footer={footer}
            redirectOnSubmitted={redirectOnSubmitted}
        />
    ) : (
        <NewEventProgram
            onSubmitted={onSubmitted}
            footer={footer}
            redirectOnSubmitted={redirectOnSubmitted}
        />
    )
}
