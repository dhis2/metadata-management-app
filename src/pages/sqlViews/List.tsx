import i18n from '@dhis2/d2-i18n'
import React, { useState } from 'react'
import { DrawerHeader, DrawerPortal, DrawerRoot } from '../../components'
import { DefaultSectionList } from '../DefaultSectionList'
import { SqlViewActions } from './list/sqlViewActions'
import { SqlViewResults } from './Results'

export const Component = () => {
    const [selectedSqlViewId, setSelectedSqlViewId] = useState<string>()

    return (
        <>
            <DrawerRoot />
            <DrawerPortal
                isOpen={!!selectedSqlViewId}
                onClose={() => setSelectedSqlViewId(undefined)}
                header={
                    <DrawerHeader
                        onClose={() => setSelectedSqlViewId(undefined)}
                    >
                        {i18n.t('SQL view results')}
                    </DrawerHeader>
                }
                disableFocusTrap
            >
                {selectedSqlViewId && <SqlViewResults id={selectedSqlViewId} />}
            </DrawerPortal>
            <DefaultSectionList
                ActionsComponent={(props) => (
                    <SqlViewActions
                        {...props}
                        onOpenResultsDrawer={setSelectedSqlViewId}
                    />
                )}
            />
        </>
    )
}
