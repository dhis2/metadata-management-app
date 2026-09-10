import React from 'react'
import { DefaultSectionList } from '../DefaultSectionList'
import { ResourceListActions } from './list/ResourceListActions'

/* "external" is always fetched (even if the column is hidden via Manage View) so the
row actions can show "Edit" only for URL resources - see ResourceListActions. The
create/edit forms are not implemented yet, so those routes fall back to the legacy
app like other not-yet-migrated sections. */
export const Component = () => {
    return (
        <DefaultSectionList
            fields={['external']}
            ActionsComponent={ResourceListActions}
        />
    )
}
