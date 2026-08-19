import i18n from '@dhis2/d2-i18n'

export function getTrailingWhitespaceWarning(value?: string) {
    if (value && value !== value.trim()) {
        return i18n.t('Leading and trailing spaces will be removed when saving')
    }
    return undefined
}
