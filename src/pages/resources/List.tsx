import React from 'react'
import { DefaultSectionList } from '../DefaultSectionList'
import { isResourceEditable } from './list/resourceAccess'
import { ResourceListActions } from './list/ResourceListActions'

export const Component = () => {
    return (
        <DefaultSectionList
            ActionsComponent={ResourceListActions}
            isRowClickable={isResourceEditable}
        />
    )
}
