import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    CircularLoader,
    IconChevronDown16,
    IconDownload16,
    IconSync16,
    IconVisualizationPivotTable16,
    Menu,
    MenuItem,
    NoticeBox,
    Popover,
} from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBoundResourceQueryFn } from '../../lib'
import { SqlView } from '../../types/generated'
import {
    getRunActionLabel,
    useRefreshMaterializedView,
    useRunSqlView,
} from './list/sqlViewActions'
import {
    extractUserDefinedVariables,
    VariablePromptModal,
} from './list/VariablePromptModal'
import css from './Results.module.css'

type SqlViewMeta = {
    id: string
    displayName: string
    type: SqlView.type
    sqlQuery: string
}

type SqlViewDataResponse = {
    listGrid?: {
        title?: string
        headers?: { name?: string; column?: string }[]
        rows?: Array<Array<string | number | null>>
    }
}

const DOWNLOAD_FORMATS: { extension: string; label: string }[] = [
    { extension: 'xlsx', label: i18n.t('Excel (.xlsx)') },
    { extension: 'csv', label: i18n.t('CSV (.csv)') },
    { extension: 'pdf', label: i18n.t('PDF (.pdf)') },
    { extension: 'html', label: i18n.t('HTML (.html)') },
    { extension: 'xml', label: i18n.t('XML (.xml)') },
    { extension: 'json', label: i18n.t('JSON (.json)') },
]

type SqlViewResultsProps = {
    id: string
}

const buildVarParams = (vars: Record<string, string>) => {
    const entries = Object.entries(vars)
    if (entries.length === 0) {
        return undefined
    }
    return entries.map(([key, value]) => `${key}:${value}`)
}

const isNotYetExecutedError = (errorMessage: string | undefined) => {
    if (!errorMessage) {
        return false
    }
    const lower = errorMessage.toLowerCase()
    return (
        lower.includes('could not execute') ||
        lower.includes('does not exist') ||
        lower.includes('relation') ||
        lower.includes('no such table')
    )
}

export const SqlViewResults = ({ id }: SqlViewResultsProps) => {
    const navigate = useNavigate()
    const { baseUrl } = useConfig()
    const { run, running } = useRunSqlView()
    const { refresh, running: refreshRunning } = useRefreshMaterializedView()

    const [varValues, setVarValues] = useState<Record<string, string>>({})
    const [showVariableModal, setShowVariableModal] = useState(false)
    const [downloadOpen, setDownloadOpen] = useState(false)
    const downloadButtonRef = useRef<HTMLDivElement>(null)

    const queryFn = useBoundResourceQueryFn()
    const metaQuery = useQuery({
        queryKey: [
            {
                resource: 'sqlViews',
                id,
                params: { fields: ['id', 'displayName', 'type', 'sqlQuery'] },
            },
        ],
        queryFn: queryFn<SqlViewMeta>,
    })

    const sqlView = metaQuery.data

    const userDefinedVariables = useMemo(
        () => extractUserDefinedVariables(sqlView?.sqlQuery ?? ''),
        [sqlView?.sqlQuery]
    )

    const isQueryType = sqlView?.type === SqlView.type.QUERY
    const needsVariables = isQueryType && userDefinedVariables.length > 0
    const allVariablesProvided =
        !needsVariables ||
        userDefinedVariables.every(
            (name) => varValues[name] && varValues[name].length > 0
        )

    const dataQuery = useQuery({
        queryKey: [
            {
                resource: `sqlViews/${id}/data`,
                params: isQueryType
                    ? { var: buildVarParams(varValues) }
                    : undefined,
            },
        ],
        queryFn: queryFn<SqlViewDataResponse>,
        enabled: !!sqlView && allVariablesProvided,
        retry: false,
    })

    const handleRun = async () => {
        if (!sqlView) {
            return
        }
        if (sqlView.type === SqlView.type.QUERY) {
            if (needsVariables) {
                setShowVariableModal(true)
            } else {
                dataQuery.refetch()
            }
            return
        }
        const result = await run(sqlView.id, sqlView.type)
        if (result.success) {
            dataQuery.refetch()
        }
    }

    const handleRefresh = async () => {
        if (!sqlView) {
            return
        }
        const result = await refresh(sqlView.id)
        if (result.success) {
            dataQuery.refetch()
        }
    }

    const handleVariableSubmit = (values: Record<string, string>) => {
        setVarValues(values)
        setShowVariableModal(false)
    }

    if (metaQuery.isLoading) {
        return (
            <div className={css.centeredState}>
                <CircularLoader />
            </div>
        )
    }
    if (metaQuery.isError || !sqlView) {
        return (
            <div className={css.page}>
                <NoticeBox error title={i18n.t('Could not load SQL view')}>
                    {i18n.t(
                        'The SQL view metadata could not be loaded. Please go back and try again.'
                    )}
                </NoticeBox>
            </div>
        )
    }

    const dataError = dataQuery.error as Error | null | undefined
    const isFirstRunError = isNotYetExecutedError(dataError?.message)

    const grid = dataQuery.data?.listGrid
    const rows = grid?.rows ?? []

    const downloadHref = (extension: string) => {
        const varParams = isQueryType ? buildVarParams(varValues) : undefined
        const queryString = varParams
            ? `?${varParams
                  .map((v) => `var=${encodeURIComponent(v)}`)
                  .join('&')}`
            : ''
        return `${baseUrl}/api/sqlViews/${id}/data.${extension}${queryString}`
    }

    return (
        <div className={css.page} data-test="sql-view-results">
            <header className={css.header}>
                <h1 className={css.title}>{sqlView.displayName}</h1>
                <ButtonStrip>
                    <Button
                        small
                        onClick={() => navigate(`/sqlViews/${id}`)}
                        dataTest="results-edit-button"
                    >
                        {i18n.t('Edit')}
                    </Button>
                    <Button
                        small
                        loading={running || dataQuery.isFetching}
                        disabled={running || dataQuery.isFetching}
                        onClick={handleRun}
                        icon={<IconSync16 />}
                        dataTest="results-run-button"
                    >
                        {getRunActionLabel(sqlView.type)}
                    </Button>
                    {sqlView.type === SqlView.type.MATERIALIZED_VIEW && (
                        <Button
                            small
                            loading={refreshRunning || dataQuery.isFetching}
                            disabled={refreshRunning || dataQuery.isFetching}
                            onClick={handleRefresh}
                            icon={<IconVisualizationPivotTable16 />}
                            dataTest="results-refresh-button"
                        >
                            {i18n.t('Refresh data')}
                        </Button>
                    )}
                    <div ref={downloadButtonRef}>
                        <Button
                            small
                            disabled={!grid || rows.length === 0}
                            onClick={() => setDownloadOpen(!downloadOpen)}
                            icon={<IconDownload16 />}
                            dataTest="results-download-button"
                        >
                            {i18n.t('Download')} <IconChevronDown16 />
                        </Button>
                        {downloadOpen && (
                            <Popover
                                arrow={false}
                                placement="bottom-end"
                                reference={downloadButtonRef}
                                onClickOutside={() => setDownloadOpen(false)}
                            >
                                <Menu className={css.downloadMenu}>
                                    {DOWNLOAD_FORMATS.map((format) => (
                                        <MenuItem
                                            key={format.extension}
                                            dense
                                            label={format.label}
                                            href={downloadHref(
                                                format.extension
                                            )}
                                            target="_blank"
                                        />
                                    ))}
                                </Menu>
                            </Popover>
                        )}
                    </div>
                </ButtonStrip>
            </header>

            {needsVariables && !allVariablesProvided && (
                <NoticeBox
                    title={i18n.t('Variables required')}
                    className={css.noticeSpacing}
                >
                    <p>
                        {i18n.t(
                            'This query needs values for {{count}} variables before it can run.',
                            { count: userDefinedVariables.length }
                        )}
                    </p>
                    <Button small onClick={() => setShowVariableModal(true)}>
                        {i18n.t('Provide variables and run')}
                    </Button>
                </NoticeBox>
            )}

            {dataQuery.isFetching && allVariablesProvided && (
                <div className={css.centeredState}>
                    <CircularLoader />
                </div>
            )}

            {!dataQuery.isFetching &&
                allVariablesProvided &&
                isFirstRunError && (
                    <NoticeBox title={i18n.t('No results available yet')}>
                        <ButtonStrip>
                            <Button
                                small
                                loading={running}
                                onClick={handleRun}
                                icon={<IconSync16 />}
                            >
                                {getRunActionLabel(sqlView.type)}
                            </Button>
                        </ButtonStrip>
                    </NoticeBox>
                )}

            {!dataQuery.isFetching &&
                allVariablesProvided &&
                dataError &&
                !isFirstRunError && (
                    <NoticeBox error title={i18n.t('Could not load results')}>
                        <p>
                            {i18n.t(
                                'Check that the SQL uses only SELECT statements and does not query restricted tables.'
                            )}
                        </p>
                    </NoticeBox>
                )}

            {!dataQuery.isFetching &&
                !dataError &&
                allVariablesProvided &&
                grid && (
                    <>
                        {rows.length === 0 ? (
                            <NoticeBox title={i18n.t('No rows returned')}>
                                {i18n.t(
                                    'The query ran successfully but returned no rows.'
                                )}
                            </NoticeBox>
                        ) : (
                            <div className={css.tableWrapper}>
                                <table className={css.table}>
                                    <thead>
                                        <tr>
                                            {(grid?.headers ?? []).map(
                                                (header, idx) => (
                                                    <th
                                                        key={header.name ?? idx}
                                                    >
                                                        {header.column ??
                                                            header.name ??
                                                            ''}
                                                    </th>
                                                )
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, rIdx) => (
                                            <tr key={rIdx}>
                                                {row.map((cell, cIdx) => (
                                                    <td key={cIdx}>
                                                        {cell ?? ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

            {showVariableModal && (
                <VariablePromptModal
                    variables={userDefinedVariables}
                    onCancel={() => setShowVariableModal(false)}
                    onSubmit={handleVariableSubmit}
                />
            )}
        </div>
    )
}
