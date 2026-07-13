import React from 'react'
import { DefaultSectionList } from '../DefaultSectionList'

export const Component = () => (
    <DefaultSectionList
        filters={['program.programType:eq:WITH_REGISTRATION']}
    />
)
