import i18n from '@dhis2/d2-i18n'
import {
    IconChevronDown16,
    IconCross16,
    IconEdit16,
    IconMore16,
    IconView16,
} from '@dhis2/ui-icons'
import cx from 'classnames'
import React from 'react'
import css from './SharingMatrix.module.css'
import {
    getLevelLabel,
    getLevelShortLabel,
    type AccessAxis,
    type AccessLevel,
} from './sharingMatrixModel'

/* One glyph per level, so a column of cells can be read as a pattern rather
   than as text. That is what lets the cells drop their labels and shrink,
   which is the only reason ~8 objects fit on screen instead of ~6. */
const LEVEL_ICONS: Record<AccessLevel, React.ComponentType> = {
    none: IconCross16,
    view: IconView16,
    edit: IconEdit16,
}

const LEVEL_CHIP_CLASS: Record<AccessLevel, string> = {
    none: css.chipNone,
    view: css.chipView,
    edit: css.chipEdit,
}

export const LevelChip = ({
    level,
    small = false,
}: {
    level: AccessLevel
    small?: boolean
}) => {
    const Icon = LEVEL_ICONS[level]
    return (
        <span
            className={cx(css.chip, LEVEL_CHIP_CLASS[level], {
                [css.chipSmall]: small,
            })}
            aria-hidden="true"
        >
            <Icon />
        </span>
    )
}

export const LevelBadge = ({
    axis,
    level,
    short = false,
    chevron = false,
}: {
    axis: AccessAxis
    level: AccessLevel
    short?: boolean
    chevron?: boolean
}) => (
    <>
        <LevelChip level={level} />
        <span className={css.badgeLabel}>
            {short
                ? getLevelShortLabel(axis, level)
                : getLevelLabel(axis, level)}
        </span>
        {chevron && (
            <span className={css.badgeChevron} aria-hidden="true">
                <IconChevronDown16 />
            </span>
        )}
    </>
)

/* A genuinely mixed row is its own state, not a dominant level with an
   asterisk — saying "View" when one of the 40 is "Edit and view" asserts
   something untrue about the other 39.

   The chip is static: yellow, with the "multiple" glyph, so it reads as
   "needs attention" rather than as a fourth access level — none of edit
   (green), view (blue) or no access (grey/dotted) is a plausible colour for
   it, since none of those describe "disagreement". Exact counts live in the
   cell's tooltip. */
export const MixedBadge = () => (
    <>
        <span className={cx(css.chip, css.chipMixed)} aria-hidden="true">
            <IconMore16 />
        </span>
        <span className={cx(css.badgeLabel, css.badgeLabelMixed)}>
            {i18n.t('Mixed')}
        </span>
    </>
)
