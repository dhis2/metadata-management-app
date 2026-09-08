import i18n from '@dhis2/d2-i18n'
import {
    Divider,
    MenuItem,
    Popover,
    SingleSelect,
    SingleSelectOption,
} from '@dhis2/ui'
import {
    IconChevronDown16,
    IconCopy16,
    IconDelete16,
    IconFileDocument16,
    IconMore16,
    IconUndo16,
    IconUser16,
    IconUserGroup16,
    IconWorld16,
} from '@dhis2/ui-icons'
import cx from 'classnames'
import React, {
    useCallback,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { ButtonGroup } from '../ButtonGroup'
import { LevelBadge, LevelChip, MixedBadge } from './LevelBadge'
import {
    LevelMenuItems,
    MenuButton,
    MenuHint,
    MenuSectionLabel,
} from './MenuButton'
import { buildAddCandidates } from './mockSharingData'
import css from './SharingMatrix.module.css'
import {
    describeAggregate,
    getLevelLabel,
    getCellDiff,
    type AccessAxis,
    type AccessLevel,
    type SharingEntity,
    type SharingObject,
} from './sharingMatrixModel'
import type { SharingMatrixApi } from './useSharingMatrix'

const NAME_W = 240
const AGG_W_BY_ENTITY = 288
// an object's frozen summary holds level counts, not two badges
const AGG_W_BY_OBJECT = 344
const MENU_W = 48
const SUBCELL_W = 56
const OVERSCAN = 3

export type Orientation = 'byEntity' | 'byObject'

const frozenWidthFor = (orientation: Orientation) =>
    NAME_W + (orientation === 'byObject' ? AGG_W_BY_OBJECT : AGG_W_BY_ENTITY)

/** Rows and columns swap, but a cell is always one (entity, object) pair. */
const cellIdsFor = (orientation: Orientation, rowId: string, colId: string) =>
    orientation === 'byObject'
        ? { entityId: colId, objectId: rowId }
        : { entityId: rowId, objectId: colId }

type GridItem = { id: string; name: string }

const AXES: AccessAxis[] = ['metadata', 'data']

const getAxisLabel = (axis: AccessAxis) =>
    axis === 'metadata' ? i18n.t('Metadata') : i18n.t('Data')

// 56px of column will not hold "METADATA". The frozen aggregate header keeps
// the full words permanently on screen, which teaches the mapping.
const getAxisShortLabel = (axis: AccessAxis) =>
    axis === 'metadata' ? i18n.t('Meta') : i18n.t('Data')

type ColumnWindow = {
    start: number
    end: number
    first: number
    last: number
    scrolledLeft: boolean
    canScrollRight: boolean
    progress: { offset: number; size: number }
}

const EMPTY_WINDOW: ColumnWindow = {
    start: 0,
    end: 0,
    first: 0,
    last: 0,
    scrolledLeft: false,
    canScrollRight: false,
    progress: { offset: 0, size: 1 },
}

/* Only the columns that can actually be seen are rendered. Everything outside
   the window collapses into two spacer divs, so scroll geometry stays exact
   without paying for 100 columns of DOM. */
const useColumnWindow = ({
    scrollportRef,
    columnCount,
    columnWidth,
    frozenWidth,
    enabled,
}: {
    scrollportRef: React.RefObject<HTMLDivElement>
    columnCount: number
    columnWidth: number
    frozenWidth: number
    // The grid is unmounted in summary view, so this has to re-run when it
    // appears — otherwise the window stays empty and no columns render.
    enabled: boolean
}) => {
    const [columnWindow, setColumnWindow] = useState<ColumnWindow>(EMPTY_WINDOW)

    const recalculate = useCallback(() => {
        const node = scrollportRef.current
        if (!node) {
            return
        }
        const { scrollLeft, clientWidth } = node
        const trackWidth = Math.max(0, clientWidth - frozenWidth - MENU_W)
        const totalWidth = columnCount * columnWidth

        const first = Math.max(0, Math.floor(scrollLeft / columnWidth))
        const last = Math.max(
            first,
            Math.min(
                columnCount - 1,
                Math.ceil((scrollLeft + trackWidth) / columnWidth) - 1
            )
        )

        const next: ColumnWindow = {
            start: Math.max(0, first - OVERSCAN),
            end: Math.min(columnCount, last + 1 + OVERSCAN),
            first,
            last,
            scrolledLeft: scrollLeft > 0,
            canScrollRight: scrollLeft + trackWidth < totalWidth - 1,
            progress: {
                offset: totalWidth ? scrollLeft / totalWidth : 0,
                size: totalWidth ? Math.min(1, trackWidth / totalWidth) : 1,
            },
        }

        // Re-render only when the window actually moved, otherwise a scroll
        // gesture would re-render every cell on every frame.
        setColumnWindow((previous) =>
            previous.start === next.start &&
            previous.end === next.end &&
            previous.first === next.first &&
            previous.last === next.last &&
            previous.scrolledLeft === next.scrolledLeft &&
            previous.canScrollRight === next.canScrollRight
                ? previous
                : next
        )
    }, [scrollportRef, columnCount, columnWidth, frozenWidth])

    useLayoutEffect(() => {
        if (!enabled) {
            return
        }
        recalculate()
        const node = scrollportRef.current
        if (!node || typeof ResizeObserver === 'undefined') {
            return
        }
        // The drawer animates in, so the first measurement is always wrong.
        const observer = new ResizeObserver(recalculate)
        observer.observe(node)
        return () => observer.disconnect()
    }, [recalculate, scrollportRef, enabled])

    return { columnWindow, onScroll: recalculate }
}

export type MatrixView = 'entities' | 'objects' | 'matrix'

type PickerTarget =
    | { kind: 'cell'; entityId: string; objectId: string; axis: AccessAxis }
    | { kind: 'row'; entityId: string; axis: AccessAxis }

type OpenPicker = (
    event: React.MouseEvent<HTMLElement>,
    target: PickerTarget
) => void

export const SharingMatrix = ({ api }: { api: SharingMatrixApi }) => {
    const {
        objects,
        entities,
        dataShareable,
        addedEntityIds,
        getValue,
        getRowAggregate,
        isRowTouched,
    } = api

    const existingEntities = useMemo(
        () => entities.filter((e) => !addedEntityIds.includes(e.id)),
        [entities, addedEntityIds]
    )
    const addedEntities = useMemo(
        () => entities.filter((e) => addedEntityIds.includes(e.id)),
        [entities, addedEntityIds]
    )

    /* Two overviews and a detail view. The overviews answer the same question
       from the two directions people actually think in — "what can this group
       reach?" and "is this object configured like the others?" — and the
       matrix is the drill-down for either. */
    const [view, setView] = useState<MatrixView>('entities')
    const showObjects = view === 'matrix'

    /* The matrix can be rotated. Rows and columns swap, but every underlying
       operation is already symmetric — a cell is an (entity, object) pair
       either way — so this is one grid parameterised, not a second grid. */
    const [orientation] = useState<Orientation>('byEntity')
    const byObject = orientation === 'byObject'

    const scrollportRef = useRef<HTMLDivElement>(null)
    const columnWidth = dataShareable ? SUBCELL_W * 2 : SUBCELL_W
    const rowItems: GridItem[] = byObject ? objects : entities
    const columnItems: GridItem[] = byObject ? entities : objects
    const { columnWindow, onScroll } = useColumnWindow({
        scrollportRef,
        columnCount: columnItems.length,
        columnWidth,
        frozenWidth: frozenWidthFor(orientation),
        enabled: showObjects,
    })

    const axes = useMemo(
        () => (dataShareable ? AXES : (['metadata'] as AccessAxis[])),
        [dataShareable]
    )
    const visibleColumns = columnItems.slice(
        columnWindow.start,
        columnWindow.end
    )
    const leftSpacer = columnWindow.start * columnWidth
    const rightSpacer = (columnItems.length - columnWindow.end) * columnWidth

    const [picker, setPicker] = useState<PickerTarget | null>(null)
    const pickerAnchor = useRef<HTMLElement | null>(null)

    const openPicker: OpenPicker = (event, target) => {
        pickerAnchor.current = event.currentTarget
        setPicker(target)
    }

    const handlePick = (level: AccessLevel) => {
        if (!picker) {
            return
        }
        if (picker.kind === 'cell') {
            api.setCell(picker.entityId, picker.objectId, picker.axis, level)
        } else {
            api.setRowAxis(picker.entityId, picker.axis, level)
        }
        setPicker(null)
    }

    const pickerCurrent = picker
        ? picker.kind === 'cell'
            ? getValue(picker.entityId, picker.objectId)[picker.axis]
            : (() => {
                  const aggregate = getRowAggregate(
                      picker.entityId,
                      picker.axis
                  )
                  return aggregate.mixed ? undefined : aggregate.level
              })()
        : undefined

    return (
        <div className={cx(css.wrapper, { [css.orientByObject]: byObject })}>
            <MatrixToolbar
                objectCount={objects.length}
                view={view}
                onViewChange={setView}
            />

            {showObjects ? (
                <div
                    ref={scrollportRef}
                    className={cx(css.scrollport, {
                        [css.scrolledLeft]: columnWindow.scrolledLeft,
                        [css.canScrollRight]: columnWindow.canScrollRight,
                    })}
                    onScroll={onScroll}
                >
                    <div className={css.grid}>
                        <MatrixHeader
                            api={api}
                            axes={axes}
                            orientation={orientation}
                            columnWidth={columnWidth}
                            visibleColumns={visibleColumns}
                            startIndex={columnWindow.start}
                            leftSpacer={leftSpacer}
                            rightSpacer={rightSpacer}
                        />

                        {(byObject ? rowItems : existingEntities).map(
                            (item) => (
                                <MatrixRow
                                    key={item.id}
                                    api={api}
                                    item={item}
                                    axes={axes}
                                    orientation={orientation}
                                    columnWidth={columnWidth}
                                    visibleColumns={visibleColumns}
                                    leftSpacer={leftSpacer}
                                    rightSpacer={rightSpacer}
                                    isNew={false}
                                    touched={isRowTouched(item.id)}
                                    onOpenPicker={openPicker}
                                />
                            )
                        )}
                        {!byObject &&
                            addedEntities.map((item, index) => (
                                <MatrixRow
                                    key={item.id}
                                    api={api}
                                    item={item}
                                    axes={axes}
                                    orientation={orientation}
                                    columnWidth={columnWidth}
                                    visibleColumns={visibleColumns}
                                    leftSpacer={leftSpacer}
                                    rightSpacer={rightSpacer}
                                    isNew
                                    isFirstAdded={index === 0}
                                    touched={isRowTouched(item.id)}
                                    onOpenPicker={openPicker}
                                />
                            ))}

                        {!byObject && <AddEntityRow api={api} />}
                    </div>
                </div>
            ) : (
                <div className={css.scrollport}>
                    <div className={css.listPage}>
                        <div className={css.listInner}>
                            {view === 'entities' ? (
                                <>
                                    <SummaryHeader
                                        axes={axes}
                                        objectCount={objects.length}
                                    />
                                    {existingEntities.map((entity) => (
                                        <SummaryRow
                                            key={entity.id}
                                            api={api}
                                            entity={entity}
                                            axes={axes}
                                            isNew={false}
                                            touched={isRowTouched(entity.id)}
                                            onOpenPicker={openPicker}
                                        />
                                    ))}
                                    {addedEntities.map((entity, index) => (
                                        <SummaryRow
                                            key={entity.id}
                                            api={api}
                                            entity={entity}
                                            axes={axes}
                                            isNew
                                            isFirstAdded={index === 0}
                                            touched={isRowTouched(entity.id)}
                                            onOpenPicker={openPicker}
                                        />
                                    ))}
                                </>
                            ) : (
                                <>
                                    <ObjectSummaryHeader axes={axes} />
                                    {objects.map((object) => (
                                        <ObjectSummaryRow
                                            key={object.id}
                                            api={api}
                                            object={object}
                                            axes={axes}
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                        {/* adding a user or group is an entity-axis action;
                            it has nothing to attach to in the object list */}
                        {view === 'entities' && (
                            <AddEntityRow api={api} inline />
                        )}
                    </div>
                </div>
            )}

            {picker && pickerAnchor.current && (
                <Popover
                    reference={pickerAnchor as React.RefObject<HTMLElement>}
                    placement="bottom-start"
                    arrow={false}
                    onClickOutside={() => setPicker(null)}
                >
                    <div className={css.menu}>
                        <LevelMenuItems
                            axis={picker.axis}
                            current={pickerCurrent}
                            onSelect={handlePick}
                        />
                    </div>
                </Popover>
            )}
        </div>
    )
}

/* ---------------------------------------------------------------- toolbar */

const VIEW_OPTIONS: { value: MatrixView; label: string }[] = [
    { value: 'entities', label: i18n.t('Summary') },
    { value: 'matrix', label: i18n.t('Detailed view') },
]

const MatrixToolbar = ({
    objectCount,
    view,
    onViewChange,
}: {
    objectCount: number
    view: MatrixView
    onViewChange: (view: MatrixView) => void
}) => {
    const showObjects = view === 'matrix'
    return (
        <div className={cx(css.toolbar, { [css.toolbarPlain]: !showObjects })}>
            <div
                className={cx(css.toolbarInner, {
                    [css.listInner]: !showObjects,
                })}
            >
                {/* Lives here, not in the drawer header, so it sits on the
                    same line as the view switcher rather than in its own
                    bar above it. */}
                <span className={css.toolbarTitle}>
                    {i18n.t('Update sharing for {{count}} objects', {
                        count: objectCount,
                    })}
                </span>

                <div className={css.toolbarSpacer} />

                <ButtonGroup
                    ariaLabel={i18n.t('Choose a view')}
                    options={VIEW_OPTIONS}
                    selected={view}
                    onChange={(value) => onViewChange(value as MatrixView)}
                />
            </div>
        </div>
    )
}

/* ------------------------------------------------------- shared row pieces */

const EntityIcon = ({ kind }: { kind: SharingEntity['kind'] }) => {
    if (kind === 'public') {
        return <IconWorld16 />
    }
    return kind === 'user' ? <IconUser16 /> : <IconUserGroup16 />
}

const initialsOf = (name: string) =>
    name
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase()

/** Groups and public read as roles, so they keep a glyph; people get initials.
    Same neutral fill for both — a colour keyed to the name reads as an
    identity, and this is just an avatar placeholder. */
const EntityAvatar = ({ entity }: { entity: SharingEntity }) => (
    <span className={cx(css.avatar, css.avatarGlyph)} aria-hidden="true">
        {entity.kind === 'user' ? (
            initialsOf(entity.name)
        ) : (
            <EntityIcon kind={entity.kind} />
        )}
    </span>
)

const getEntityKindLabel = (kind: SharingEntity['kind']) => {
    if (kind === 'public') {
        return i18n.t('Everyone who can sign in')
    }
    return kind === 'user' ? i18n.t('User') : i18n.t('User group')
}

const SummaryIdentity = ({
    entity,
    isNew,
    touched,
}: {
    entity: SharingEntity
    isNew: boolean
    touched: boolean
}) => (
    <>
        <EntityAvatar entity={entity} />
        <span className={css.identity}>
            <span className={css.identityName} title={entity.name}>
                {entity.name}
            </span>
            <span className={css.identityMeta}>
                {getEntityKindLabel(entity.kind)}
            </span>
        </span>
        {isNew && <span className={css.newBadge}>{i18n.t('New')}</span>}
        {!isNew && touched && (
            <span className={css.newBadge}>{i18n.t('Edited')}</span>
        )}
    </>
)

const EntityName = ({
    entity,
    isNew,
    touched,
}: {
    entity: SharingEntity
    isNew: boolean
    touched: boolean
}) => (
    <>
        <span className={css.entityKind}>
            <EntityIcon kind={entity.kind} />
        </span>
        <span className={css.entityName} title={entity.name}>
            {entity.name}
        </span>
        {isNew && <span className={css.newBadge}>{i18n.t('New')}</span>}
        {!isNew && touched && (
            <span className={css.newBadge}>{i18n.t('Edited')}</span>
        )}
    </>
)

/** The row's bulk control and its at-a-glance state, in both views. */
const AggregateCell = ({
    api,
    entity,
    axis,
    full,
    onOpenPicker,
}: {
    api: SharingMatrixApi
    entity: SharingEntity
    axis: AccessAxis
    full: boolean
    onOpenPicker: OpenPicker
}) => {
    const aggregate = api.getRowAggregate(entity.id, axis)
    const diff = api.getRowAxisDiff(entity.id, axis)

    return (
        <button
            type="button"
            className={cx(css.aggregateCell, {
                [css.added]: diff === 'added',
                [css.removed]: diff === 'removed',
                [css.changedBoth]: diff === 'both',
                [css.changed]: diff !== 'unchanged',
            })}
            onClick={(event) =>
                onOpenPicker(event, {
                    kind: 'row',
                    entityId: entity.id,
                    axis,
                })
            }
            title={`${describeAggregate(axis, aggregate)} — ${i18n.t(
                'click to set on all objects'
            )}`}
        >
            {aggregate.mixed ? (
                <MixedBadge />
            ) : (
                <LevelBadge axis={axis} level={aggregate.level} short={!full} />
            )}
            <span className={css.badgeChevron} aria-hidden="true">
                <IconChevronDown16 />
            </span>
        </button>
    )
}

const RowMenu = ({
    api,
    entity,
    touched,
}: {
    api: SharingMatrixApi
    entity: SharingEntity
    touched: boolean
}) => (
    <MenuButton
        className={css.iconButton}
        ariaLabel={i18n.t('Actions for {{name}}', { name: entity.name })}
        placement="bottom-end"
        menu={(close) => (
            <>
                <MenuItem
                    dense
                    icon={<IconUndo16 />}
                    disabled={!touched}
                    label={i18n.t('Revert changes to this row')}
                    onClick={() => {
                        api.revertRow(entity.id)
                        close()
                    }}
                />
                <MenuItem
                    dense
                    destructive
                    icon={<IconDelete16 />}
                    label={i18n.t('Remove from all objects')}
                    onClick={() => {
                        api.removeRow(entity.id)
                        close()
                    }}
                />
            </>
        )}
    >
        <IconMore16 />
    </MenuButton>
)

/** Object-scoped actions, shared by the matrix column header and the
    by-object overview so the two can never drift apart. */
const ObjectMenuItems = ({
    api,
    objectId,
    close,
}: {
    api: SharingMatrixApi
    objectId: string
    close: () => void
}) => (
    <>
        <MenuItem
            dense
            icon={<IconCopy16 />}
            label={i18n.t('Copy sharing to all objects')}
            onClick={() => {
                api.copyColumnToAll(objectId)
                close()
            }}
        />
        <MenuHint>
            {i18n.t('Makes every other object match this one exactly.')}
        </MenuHint>
        <Divider />
        <MenuItem
            dense
            destructive
            icon={<IconDelete16 />}
            label={i18n.t('Clear all sharing on this object')}
            onClick={() => {
                api.clearColumn(objectId)
                close()
            }}
        />
        <MenuHint>
            {i18n.t(
                'Removes every user and group, including public access, from this one object.'
            )}
        </MenuHint>
    </>
)

/* ------------------------------------------------------ by-object overview */

const ObjectSummaryHeader = ({ axes }: { axes: AccessAxis[] }) => (
    <div className={cx(css.listRow, css.listHeaderRow)}>
        <div className={cx(css.listName, css.headerLabel)}>
            {i18n.t('Object')}
        </div>
        {axes.map((axis) => (
            <div key={axis} className={cx(css.countsCell, css.headerLabel)}>
                <span className={css.listAxisHeaderLabel}>
                    {i18n.t('{{axis}} access', { axis: getAxisLabel(axis) })}
                </span>
            </div>
        ))}
        <div className={cx(css.consistencyCell, css.headerLabel)}>
            {i18n.t('Compared to the rest')}
        </div>
        <div className={css.listMenu} />
    </div>
)

const ObjectSummaryRow = ({
    api,
    object,
    axes,
}: {
    api: SharingMatrixApi
    object: SharingObject
    axes: AccessAxis[]
}) => {
    const summary = api.getObjectSummary(object.id)

    return (
        <div className={css.listRow}>
            <div className={css.listName}>
                <span className={cx(css.avatar, css.avatarGlyph)}>
                    <IconFileDocument16 />
                </span>
                <span className={css.identity}>
                    <span className={css.identityName} title={object.name}>
                        {object.name}
                    </span>
                </span>
            </div>

            {axes.map((axis) => (
                <div key={axis} className={css.countsCell}>
                    {summary.counts[axis].map(({ level, count }) => (
                        <span
                            key={level}
                            className={css.countItem}
                            title={`${count} × ${getLevelLabel(axis, level)}`}
                        >
                            <LevelChip level={level} small />
                            {count}
                        </span>
                    ))}
                </div>
            ))}

            <div className={css.consistencyCell}>
                {summary.consistent ? (
                    <span className={css.consistent}>
                        {i18n.t('Same as {{count}} others', {
                            count: summary.patternSize - 1,
                        })}
                    </span>
                ) : (
                    <span className={css.differs}>
                        <span className={css.differsDot} aria-hidden="true" />
                        {summary.patternSize > 1
                            ? i18n.t('Differs · {{count}} like it', {
                                  count: summary.patternSize,
                              })
                            : i18n.t('Differs · only one')}
                    </span>
                )}
            </div>

            <div className={css.listMenu}>
                <MenuButton
                    className={css.iconButton}
                    ariaLabel={i18n.t('Actions for {{name}}', {
                        name: object.name,
                    })}
                    placement="bottom-end"
                    menu={(close) => (
                        <ObjectMenuItems
                            api={api}
                            objectId={object.id}
                            close={close}
                        />
                    )}
                >
                    <IconMore16 />
                </MenuButton>
            </div>
        </div>
    )
}

/* ----------------------------------------------------------- summary view */

const SummaryHeader = ({
    axes,
    objectCount,
}: {
    axes: AccessAxis[]
    objectCount: number
}) => (
    <div className={cx(css.listRow, css.listHeaderRow)}>
        <div className={cx(css.listName, css.headerLabel)}>
            {i18n.t('People with access')}
        </div>
        {axes.map((axis) => (
            <div key={axis} className={cx(css.listAxisCell, css.headerLabel)}>
                <span className={css.listAxisHeaderLabel}>
                    {i18n.t('{{axis}} (all {{count}} objects)', {
                        axis: getAxisLabel(axis),
                        count: objectCount,
                    })}
                </span>
            </div>
        ))}
        <div className={css.listMenu} />
    </div>
)

const SummaryRow = ({
    api,
    entity,
    axes,
    isNew,
    isFirstAdded = false,
    touched,
    onOpenPicker,
}: {
    api: SharingMatrixApi
    entity: SharingEntity
    axes: AccessAxis[]
    isNew: boolean
    isFirstAdded?: boolean
    touched: boolean
    onOpenPicker: OpenPicker
}) => (
    <div
        className={cx(css.listRow, {
            [css.publicRow]: entity.kind === 'public',
            [css.addedDivider]: isFirstAdded,
        })}
    >
        <div className={css.listName}>
            <SummaryIdentity entity={entity} isNew={isNew} touched={touched} />
        </div>
        {axes.map((axis) => (
            <div key={axis} className={css.listAxisCell}>
                <AggregateCell
                    api={api}
                    entity={entity}
                    axis={axis}
                    full
                    onOpenPicker={onOpenPicker}
                />
            </div>
        ))}
        <div className={css.listMenu}>
            <RowMenu api={api} entity={entity} touched={touched} />
        </div>
    </div>
)

/* ------------------------------------------------------------ matrix view */

/** Column-header menu. Which entity the column represents depends on the
    orientation, so the actions on offer flip with it: an object column can be
    copied to all objects, an entity column can be reverted or removed. */
const ColumnHeaderMenu = ({
    api,
    orientation,
    column,
    close,
}: {
    api: SharingMatrixApi
    orientation: Orientation
    column: GridItem
    close: () => void
}) => {
    if (orientation === 'byEntity') {
        return <ObjectMenuItems api={api} objectId={column.id} close={close} />
    }
    return (
        <>
            <MenuItem
                dense
                icon={<IconUndo16 />}
                disabled={!api.isRowTouched(column.id)}
                label={i18n.t('Revert changes to this column')}
                onClick={() => {
                    api.revertRow(column.id)
                    close()
                }}
            />
            <MenuItem
                dense
                destructive
                icon={<IconDelete16 />}
                label={i18n.t('Remove from all objects')}
                onClick={() => {
                    api.removeRow(column.id)
                    close()
                }}
            />
        </>
    )
}

const MatrixHeader = ({
    api,
    axes,
    orientation,
    columnWidth,
    visibleColumns,
    startIndex,
    leftSpacer,
    rightSpacer,
}: {
    api: SharingMatrixApi
    axes: AccessAxis[]
    orientation: Orientation
    columnWidth: number
    visibleColumns: GridItem[]
    startIndex: number
    leftSpacer: number
    rightSpacer: number
}) => {
    const byObject = orientation === 'byObject'

    return (
        <div className={cx(css.row, css.headerRow)}>
            <div className={cx(css.stickyName, css.headerLabel)}>
                {byObject ? i18n.t('Object') : i18n.t('User or group')}
            </div>

            <div className={css.stickyAggregate}>
                <div className={css.objectHeader} style={{ flex: 1 }}>
                    <span className={css.aggregateHeaderName}>
                        {byObject
                            ? i18n.t('All {{count}} users and groups', {
                                  count: api.entities.length,
                              })
                            : i18n.t('All {{count}} objects', {
                                  count: api.objects.length,
                              })}
                    </span>
                    <div className={css.axisHeaderRow}>
                        {axes.map((axis) => (
                            <span
                                key={axis}
                                className={cx(
                                    css.axisHeader,
                                    css.aggregateAxisHeader
                                )}
                            >
                                {getAxisLabel(axis)}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className={css.spacer} style={{ width: leftSpacer }} />

            {visibleColumns.map((column, index) => (
                <div
                    key={column.id}
                    className={css.objectHeader}
                    style={{ width: columnWidth }}
                >
                    <MenuButton
                        className={css.objectHeaderName}
                        title={column.name}
                        placement="bottom-start"
                        menu={(close) => (
                            <ColumnHeaderMenu
                                api={api}
                                orientation={orientation}
                                column={column}
                                close={close}
                            />
                        )}
                    >
                        <span className={css.objectHeaderIndex}>
                            {startIndex + index + 1}
                        </span>
                        <span className={css.entityName}>{column.name}</span>
                    </MenuButton>

                    <div className={css.axisHeaderRow}>
                        {axes.map((axis) => (
                            <MenuButton
                                key={axis}
                                className={cx(
                                    css.axisHeader,
                                    css.axisHeaderCompact
                                )}
                                title={i18n.t(
                                    'Set {{axis}} access down this column',
                                    { axis: getAxisLabel(axis).toLowerCase() }
                                )}
                                menu={(close) => (
                                    <>
                                        <MenuSectionLabel>
                                            {byObject
                                                ? i18n.t(
                                                      'Set {{axis}} access on all objects',
                                                      {
                                                          axis: getAxisLabel(
                                                              axis
                                                          ).toLowerCase(),
                                                      }
                                                  )
                                                : i18n.t(
                                                      'Set {{axis}} access for all users and groups',
                                                      {
                                                          axis: getAxisLabel(
                                                              axis
                                                          ).toLowerCase(),
                                                      }
                                                  )}
                                        </MenuSectionLabel>
                                        <LevelMenuItems
                                            axis={axis}
                                            onSelect={(level) => {
                                                if (byObject) {
                                                    api.setRowAxis(
                                                        column.id,
                                                        axis,
                                                        level
                                                    )
                                                } else {
                                                    api.setColumnAxis(
                                                        column.id,
                                                        axis,
                                                        level
                                                    )
                                                }
                                                close()
                                            }}
                                        />
                                    </>
                                )}
                            >
                                {getAxisShortLabel(axis)}
                            </MenuButton>
                        ))}
                    </div>
                </div>
            ))}

            <div className={css.spacer} style={{ width: rightSpacer }} />
            <div className={css.stickyMenu} />
        </div>
    )
}

/** The frozen summary. An entity row can show one aggregate level per axis and
    be edited in place; an object row cannot — it has one level per *entity* —
    so it shows the composition instead, read-only. */
const FrozenSummary = ({
    api,
    item,
    axes,
    orientation,
    onOpenPicker,
}: {
    api: SharingMatrixApi
    item: GridItem
    axes: AccessAxis[]
    orientation: Orientation
    onOpenPicker: OpenPicker
}) => {
    if (orientation === 'byObject') {
        const summary = api.getObjectSummary(item.id)
        return (
            <>
                {axes.map((axis) => (
                    <div key={axis} className={css.matrixCountsCell}>
                        {summary.counts[axis].map(({ level, count }) => (
                            <span
                                key={level}
                                className={css.countItem}
                                title={`${count} × ${getLevelLabel(
                                    axis,
                                    level
                                )}`}
                            >
                                <LevelChip level={level} small />
                                {count}
                            </span>
                        ))}
                    </div>
                ))}
            </>
        )
    }

    return (
        <>
            {axes.map((axis) => (
                <AggregateCell
                    key={axis}
                    api={api}
                    entity={item as SharingEntity}
                    axis={axis}
                    full={false}
                    onOpenPicker={onOpenPicker}
                />
            ))}
        </>
    )
}

const MatrixRow = ({
    api,
    item,
    axes,
    orientation,
    columnWidth,
    visibleColumns,
    leftSpacer,
    rightSpacer,
    isNew,
    isFirstAdded = false,
    touched,
    onOpenPicker,
}: {
    api: SharingMatrixApi
    item: GridItem
    axes: AccessAxis[]
    orientation: Orientation
    columnWidth: number
    visibleColumns: GridItem[]
    leftSpacer: number
    rightSpacer: number
    isNew: boolean
    isFirstAdded?: boolean
    touched: boolean
    onOpenPicker: OpenPicker
}) => {
    const byObject = orientation === 'byObject'
    const isPublic = !byObject && (item as SharingEntity).kind === 'public'

    return (
        <div
            className={cx(css.row, {
                [css.publicRow]: isPublic,
                [css.addedDivider]: isFirstAdded,
            })}
        >
            <div className={css.stickyName}>
                {byObject ? (
                    <>
                        <span className={css.entityKind}>
                            <IconFileDocument16 />
                        </span>
                        <span className={css.entityName} title={item.name}>
                            {item.name}
                        </span>
                    </>
                ) : (
                    <EntityName
                        entity={item as SharingEntity}
                        isNew={isNew}
                        touched={touched}
                    />
                )}
            </div>

            <div className={css.stickyAggregate}>
                <FrozenSummary
                    api={api}
                    item={item}
                    axes={axes}
                    orientation={orientation}
                    onOpenPicker={onOpenPicker}
                />
            </div>

            <div className={css.spacer} style={{ width: leftSpacer }} />

            {visibleColumns.map((column) => {
                const { entityId, objectId } = cellIdsFor(
                    orientation,
                    item.id,
                    column.id
                )
                const value = api.getValue(entityId, objectId)
                const original = api.getOriginal(entityId, objectId)
                return (
                    <div
                        key={column.id}
                        className={css.objectCell}
                        style={{ width: columnWidth }}
                    >
                        {axes.map((axis) => {
                            const diff = getCellDiff(
                                original[axis],
                                value[axis]
                            )
                            return (
                                <button
                                    key={axis}
                                    type="button"
                                    className={cx(css.cell, {
                                        [css.added]: diff === 'added',
                                        [css.removed]: diff === 'removed',
                                        [css.changed]: diff !== 'unchanged',
                                    })}
                                    title={`${column.name} · ${getAxisLabel(
                                        axis
                                    )}: ${getLevelLabel(axis, value[axis])}`}
                                    onClick={(event) =>
                                        onOpenPicker(event, {
                                            kind: 'cell',
                                            entityId,
                                            objectId,
                                            axis,
                                        })
                                    }
                                >
                                    <LevelChip level={value[axis]} small />
                                </button>
                            )
                        })}
                    </div>
                )
            })}

            <div className={css.spacer} style={{ width: rightSpacer }} />

            <div className={css.stickyMenu}>
                {byObject ? (
                    <MenuButton
                        className={css.iconButton}
                        ariaLabel={i18n.t('Actions for {{name}}', {
                            name: item.name,
                        })}
                        placement="bottom-end"
                        menu={(close) => (
                            <ObjectMenuItems
                                api={api}
                                objectId={item.id}
                                close={close}
                            />
                        )}
                    >
                        <IconMore16 />
                    </MenuButton>
                ) : (
                    <RowMenu
                        api={api}
                        entity={item as SharingEntity}
                        touched={touched}
                    />
                )}
            </div>
        </div>
    )
}

/* ---------------------------------------------------------------- add row */

const AddEntityRow = ({
    api,
    inline = false,
}: {
    api: SharingMatrixApi
    inline?: boolean
}) => {
    const candidates = useMemo(
        () => buildAddCandidates(api.entities),
        [api.entities]
    )

    return (
        <div className={inline ? css.addRowInline : css.addRow}>
            <div
                className={
                    inline
                        ? cx(css.listInner, css.addRowInlineInner)
                        : css.addRowInner
                }
            >
                <div style={{ width: 320 }}>
                    <SingleSelect
                        dense
                        filterable
                        selected=""
                        placeholder={i18n.t('Choose a user or group to add')}
                        noMatchText={i18n.t('No matches')}
                        disabled={candidates.length === 0}
                        onChange={({ selected }) => {
                            const entity = candidates.find(
                                (candidate) => candidate.id === selected
                            )
                            if (entity) {
                                api.addEntity(entity)
                            }
                        }}
                    >
                        {candidates.map((candidate) => (
                            <SingleSelectOption
                                key={candidate.id}
                                value={candidate.id}
                                label={
                                    candidate.kind === 'user'
                                        ? `${candidate.name} (${i18n.t(
                                              'user'
                                          )})`
                                        : `${candidate.name} (${i18n.t(
                                              'group'
                                          )})`
                                }
                            />
                        ))}
                    </SingleSelect>
                </div>
            </div>
        </div>
    )
}
