import i18n from '@dhis2/d2-i18n'
import { IconQuestion16 } from '@dhis2/ui-icons'
import React from 'react'
import { Link, To, useLocation, useMatches, matchPath } from 'react-router-dom'
import { useToWithSearchState } from '../../lib'
import type { MatchRouteHandle } from '../routes/types'
import css from './Breadcrumb.module.css'

const BreadcrumbSeparator = () => <span className={css.separator}>/</span>

type BreadcrumbItemProps = {
    label: string
    to: To
    learnMoreUrl?: string
}

export const BreadcrumbItem = ({
    label,
    to,
    learnMoreUrl,
}: BreadcrumbItemProps) => {
    const resolvedTo = useToWithSearchState(to)
    const currentLoc = useLocation()

    if (resolvedTo.pathname) {
        const match = matchPath(resolvedTo.pathname, currentLoc.pathname)
        if (match?.pattern.end) {
            return (
                <BreadCrumbEndItem label={label} learnMoreUrl={learnMoreUrl} />
            )
        }
    }

    return (
        <Link
            className={css.breadcrumbItemLink}
            to={resolvedTo}
            state={{ search: resolvedTo.search }}
        >
            {label}
        </Link>
    )
}

/** Component that is used for "End links", where the current route is the end of the path
 * and thus should not be a link */
export const BreadCrumbEndItem = ({
    label,
    learnMoreUrl,
}: {
    label: string
    learnMoreUrl?: string
}) => (
    <span className={css.breadcrumbItem}>
        {label}
        {learnMoreUrl && (
            <a
                className={css.learnMoreIconLink}
                href={learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
            >
                <span aria-label={i18n.t('Learn more')}>
                    <IconQuestion16 />
                </span>
            </a>
        )}
    </span>
)

export const Breadcrumbs = () => {
    const matches = useMatches() as MatchRouteHandle[]

    const filtered = matches.filter((match) => match.handle?.crumb)

    if (filtered.length === 0) {
        return null
    }

    const crumbs = filtered.map((match, index) => (
        <span key={match.id}>
            {match.handle?.crumb?.({
                params: match.params,
                pathname: match.pathname,
            })}
            {index < filtered.length - 1 && <BreadcrumbSeparator />}
        </span>
    ))

    return <div className={css.breadcrumbWrapper}>{crumbs}</div>
}
