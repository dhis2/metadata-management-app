import cx from 'classnames'
import { FocusTrap } from 'focus-trap-react'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSystemSettingsStore } from '../../lib/systemSettings'
import css from './Drawer.module.css'
import { DrawerHeader } from './DrawerHeader'

export interface DrawerProps {
    isOpen: boolean
    children: React.ReactNode
    onClose: () => void
    level?: 'primary' | 'secondary'
    header?: React.ReactNode | string
    disableFocusTrap?: boolean
}

const DRAWER_PORTAL_ID = 'drawer-portal'

export const DrawerPanel: React.FC<DrawerProps> = ({
    isOpen,
    children,
    onClose,
    level = 'primary',
    header,
    disableFocusTrap = false,
}) => {
    const globalShellEnabled =
        useSystemSettingsStore(
            (state) => state.systemSettings?.globalShellEnabled
        ) ?? false

    return (
        <div
            className={cx(css.drawerOverlay, {
                [css.open]: isOpen,
                [css.legacyShell]:
                    !globalShellEnabled ||
                    process.env.NODE_ENV === 'development',
            })}
            onClick={onClose}
        >
            <div
                className={cx(css.drawer, {
                    [css.open]: isOpen,
                    [css.drawerPrimary]: level === 'primary',
                    [css.drawerSecondary]: level === 'secondary',
                })}
                onClick={(e) => e.stopPropagation()}
            >
                {isOpen && (
                    <DrawerContents
                        onClose={onClose}
                        header={header}
                        disableFocusTrap={disableFocusTrap}
                    >
                        {children}
                    </DrawerContents>
                )}
            </div>
        </div>
    )
}

const DrawerContents = ({
    children,
    onClose,
    header,
    disableFocusTrap,
}: {
    children: React.ReactNode
    onClose: () => void
    header?: React.ReactNode | string
    disableFocusTrap?: boolean
}) => {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [onClose])
    const headerNode =
        typeof header === 'string' ? (
            <DrawerHeader onClose={onClose}>{header}</DrawerHeader>
        ) : (
            header
        )

    const content = (
        <div className={css.drawerContent}>
            <span tabIndex={0}></span>
            {headerNode}
            <div className={css.drawerBody}>{children}</div>
        </div>
    )

    return disableFocusTrap ? (
        content
    ) : (
        <FocusTrap
            focusTrapOptions={{
                delayInitialFocus: true,
                allowOutsideClick: true,
                clickOutsideDeactivates: () => {
                    return (
                        !!document.getElementById('expression-builder-modal') ||
                        !!document.getElementById('single-select-search-input')
                    )
                },
            }}
        >
            {content}
        </FocusTrap>
    )
}

export const DrawerLayout: React.FC<{
    children: React.ReactNode
    footer: React.ReactNode
}> = ({ children, footer }) => (
    <div className={css.drawerBodyLayout}>
        <div className={css.drawerBodyScrollable}>{children}</div>
        {footer}
    </div>
)

export const DrawerRoot = () => (
    <div id={DRAWER_PORTAL_ID} className={css.drawerRoot} />
)

export const DrawerPortal = (props: DrawerProps) => {
    const [mountNode, setMountNode] = useState<HTMLElement | null>(() =>
        document.getElementById(DRAWER_PORTAL_ID)
    )

    useEffect(() => {
        const portalRoot = document.getElementById(DRAWER_PORTAL_ID)
        if (portalRoot) {
            setMountNode(portalRoot)
        } else {
            console.error(
                `Drawer portal root with ID #${DRAWER_PORTAL_ID} not found.`
            )
        }
    }, [])

    if (!mountNode) {
        return null
    }

    return createPortal(<DrawerPanel {...props} />, mountNode)
}
