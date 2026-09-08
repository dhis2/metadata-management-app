import { MenuItem, Popover } from '@dhis2/ui'
import React, { useRef, useState } from 'react'
import { LevelChip } from './LevelBadge'
import css from './SharingMatrix.module.css'
import {
    ACCESS_LEVELS,
    getLevelLabel,
    type AccessAxis,
    type AccessLevel,
} from './sharingMatrixModel'

type MenuButtonProps = {
    className?: string
    title?: string
    ariaLabel?: string
    children: React.ReactNode
    menu: (close: () => void) => React.ReactNode
    placement?: 'bottom-start' | 'bottom-end'
}

/** The trigger is its own popover reference, so no wrapper element gets in the
    way of the flex layout the frozen panes depend on. */
export const MenuButton = ({
    className,
    title,
    ariaLabel,
    children,
    menu,
    placement = 'bottom-start',
}: MenuButtonProps) => {
    const ref = useRef<HTMLButtonElement>(null)
    const [open, setOpen] = useState(false)
    const close = () => setOpen(false)

    return (
        <>
            <button
                ref={ref}
                type="button"
                className={className}
                title={title}
                aria-label={ariaLabel}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((previous) => !previous)}
            >
                {children}
            </button>
            {open && (
                <Popover
                    reference={ref}
                    placement={placement}
                    arrow={false}
                    onClickOutside={close}
                >
                    <div className={css.menu}>{menu(close)}</div>
                </Popover>
            )}
        </>
    )
}

export const MenuSectionLabel = ({
    children,
}: {
    children: React.ReactNode
}) => <div className={css.menuSectionLabel}>{children}</div>

export const MenuHint = ({ children }: { children: React.ReactNode }) => (
    <div className={css.menuHint}>{children}</div>
)

export const LevelMenuItems = ({
    axis,
    current,
    onSelect,
}: {
    axis: AccessAxis
    current?: AccessLevel
    onSelect: (level: AccessLevel) => void
}) => (
    <>
        {ACCESS_LEVELS.map((level) => (
            <MenuItem
                key={level}
                dense
                active={current === level}
                label={
                    <span className={css.menuLevelRow}>
                        <LevelChip level={level} />
                        {getLevelLabel(axis, level)}
                    </span>
                }
                onClick={() => onSelect(level)}
            />
        ))}
    </>
)
