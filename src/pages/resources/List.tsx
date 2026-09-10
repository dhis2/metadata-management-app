import React from 'react'
import { DefaultSectionList } from '../DefaultSectionList'
import { ResourceListActions } from './list/ResourceListActions'

/* The row actions need "external" to decide whether "Edit" applies (URL resources
only). It is part of the default column set for this section (see
sectionListViewsConfig), so it is already fetched - ResourceListActions reads it
off the model. The create/edit forms are not implemented yet, so those routes fall
back to the legacy app like other not-yet-migrated sections. */
export const Component = () => {
    return <DefaultSectionList ActionsComponent={ResourceListActions} />
}
