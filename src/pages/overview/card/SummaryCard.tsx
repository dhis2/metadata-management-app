import i18n from '@dhis2/d2-i18n'
import { Card, Button } from '@dhis2/ui'
import { IconEdit24, IconQuestion16 } from '@dhis2/ui-icons'
import React, { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import {
    getSectionNewPath,
    getSectionPath,
    useCanCreateModelInSection,
    useIsSectionAuthorizedPredicate,
} from '../../../lib'
import { ModelSection, OverviewSection } from '../../../types'
import {
    FilterAuthorizedSections,
    FilterAuthorizedSectionsProps,
} from './FilterAuthorizedSections'
import styles from './SummaryCard.module.css'

const DEFAULT_ICON = <IconEdit24 />

const SummaryCardHeader = ({ children }: PropsWithChildren) => (
    <div className={styles.cardHeader}>{children}</div>
)

type SummaryCardGroupProps = FilterAuthorizedSectionsProps & {
    title?: string
    section: OverviewSection
}

export const SummaryCardGroup = ({
    children,
    title,
    section,
}: PropsWithChildren<SummaryCardGroupProps>) => {
    const isSectionAuthorized = useIsSectionAuthorizedPredicate()
    const isOverviewAuthorized = isSectionAuthorized(section)
    if (!isOverviewAuthorized) {
        return null
    }
    return (
        <>
            {title && <div className={styles.cardGroupHeader}>{title}</div>}

            <div className={styles.cardGroup}>
                <FilterAuthorizedSections>{children}</FilterAuthorizedSections>
            </div>
        </>
    )
}

interface SummaryCardProps {
    children: React.ReactNode
    icon?: React.ReactNode
    hideNew?: boolean
    section: ModelSection
}

export const SummaryCard = ({
    icon = DEFAULT_ICON,
    hideNew = false,
    children,
    section,
}: SummaryCardProps) => {
    const title = section.title
    return (
        <div data-test={`card-${title}`} className={styles.cardWrapper}>
            <Link
                className={styles.cardTopLink}
                to={`/${getSectionPath(section)}`}
            >
                <div className={styles.cardTop}>
                    <SummaryCardHeader>{title}</SummaryCardHeader>
                    <SummaryCardContent>{children}</SummaryCardContent>
                </div>
            </Link>
            <SummaryCardActions section={section} hideNew={hideNew} />
        </div>
    )
}

export const SummaryCardContent = ({ children }: PropsWithChildren) => {
    return <p className={styles.cardContent}>{children}</p>
}

interface SummaryCardActionsProps {
    section: ModelSection
    hideNew: boolean
}

export const SummaryCardActions = ({
    section,
    hideNew,
}: SummaryCardActionsProps) => {
    const canCreate = useCanCreateModelInSection(section)
    const learnMoreUrl = section.learnMoreUrl
    return (
        <div className={styles.cardActions}>
            {canCreate && !hideNew && (
                <Link to={`/${getSectionNewPath(section)}`} tabIndex={-1}>
                    <Button secondary small>
                        {i18n.t('Add new')}
                    </Button>
                </Link>
            )}
            <Link to={`/${getSectionPath(section)}`} tabIndex={-1}>
                <Button secondary small>
                    {i18n.t('Manage')}
                </Button>
            </Link>
            {learnMoreUrl && (
                <a
                    className={styles.learnMoreIconLink}
                    href={learnMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span aria-label={i18n.t('Learn more')}>
                        <IconQuestion16 />
                    </span>
                </a>
            )}
        </div>
    )
}
