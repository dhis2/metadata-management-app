import React from 'react'
import { DefaultSectionList } from '../DefaultSectionList'
import { ResourceListActions } from './list/ResourceListActions'

export const Component = () => {
    return <DefaultSectionList ActionsComponent={ResourceListActions} />
}
