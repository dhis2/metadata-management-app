import i18n from '@dhis2/d2-i18n'
import { IconArrowRight24, OrganisationUnitTree } from '@dhis2/ui'
import React, { useMemo, useState } from 'react'
import { useCurrentUserRootOrgUnits } from '../../../lib/user/currentUserStore'
import css from './Move.module.css'

export type OrgUnitTarget = {
    id: string
    displayName: string
    path: string
}

export type SourceOrgUnit = {
    id: string
    displayName: string
    path: string
}

type MoveOrgUnitFormFieldsProps = {
    sources: SourceOrgUnit[]
    onSourcesChange: (sources: SourceOrgUnit[]) => void
    target: OrgUnitTarget | undefined
    onTargetChange: (target: OrgUnitTarget | undefined) => void
}

export const MoveOrgUnitFormFields = ({
    sources,
    onSourcesChange,
    target,
    onTargetChange,
}: MoveOrgUnitFormFieldsProps) => {
    const roots = useCurrentUserRootOrgUnits()
    const rootIds = useMemo(() => roots.map((ou) => ou.id), [roots])
    const rootPaths = useMemo(() => roots.map((ou) => ou.path), [roots])

    const selectedSourcePaths = useMemo(
        () => sources.map((s) => s.path),
        [sources]
    )

    const sourceInitiallyExpanded = useMemo(
        () => [...rootPaths, ...selectedSourcePaths],
        [rootPaths, selectedSourcePaths]
    )

    const [targetExpanded, setTargetExpanded] = useState<string[]>(rootPaths)

    const handleSourceChange = ({
        id,
        displayName,
        path,
        selected,
    }: {
        id: string
        displayName: string
        path: string
        selected: string[]
    }) => {
        const newSources = selected.map((selectedPath) => {
            const existing = sources.find((s) => s.path === selectedPath)
            return existing ?? { id, path, displayName }
        })
        onSourcesChange(newSources)
    }

    const handleTargetChange = ({
        id,
        displayName,
        path,
    }: {
        id: string
        displayName: string
        path: string
        selected: string[]
    }) => {
        if (target?.path === path) {
            onTargetChange(undefined)
        } else {
            onTargetChange({ id, displayName, path })
        }
        if (!targetExpanded.includes(path)) {
            setTargetExpanded((prev) => [...prev, path])
        }
    }

    return (
        <div className={css.sourceTargetWrapper}>
            <div className={css.treeField}>
                <span className={css.treeFieldLabel}>
                    {i18n.t('Organisation units to move')}
                </span>
                <div className={css.treeWrapper}>
                    <OrganisationUnitTree
                        key={sourceInitiallyExpanded.join(',')}
                        roots={rootIds}
                        selected={selectedSourcePaths}
                        initiallyExpanded={sourceInitiallyExpanded}
                        onChange={handleSourceChange}
                    />
                </div>
            </div>

            <IconArrowRight24 />

            <div className={css.treeField}>
                <span className={css.treeFieldLabel}>
                    {i18n.t('Move into')}
                </span>
                <div className={css.treeWrapper}>
                    <OrganisationUnitTree
                        roots={rootIds}
                        singleSelection
                        selected={target ? [target.path] : []}
                        initiallyExpanded={targetExpanded}
                        onChange={handleTargetChange}
                    />
                </div>
            </div>
        </div>
    )
}
