import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip } from '@dhis2/ui'
import React from 'react'
import { To } from 'react-router-dom'
import { LinkButton } from '../LinkButton'

export function StandardFormActions({
    cancelLabel,
    submitLabel,
    saveLabel = i18n.t('Save'),
    submitting,
    activeAction,
    onSubmitClick,
    onSaveClick,
    cancelTo,
    onCancelClick,
}: {
    cancelLabel?: string
    submitLabel: string
    saveLabel?: string
    submitting: boolean
    activeAction?: 'saveAndExit' | 'save' | null
    onSubmitClick: () => void
    onSaveClick?: () => void
    cancelTo?: To
    onCancelClick?: () => void
}) {
    const isSubmitting = submitting && activeAction === 'saveAndExit'
    const isSaving = submitting && activeAction === 'save'

    return (
        <ButtonStrip>
            <Button
                primary
                small
                disabled={submitting}
                loading={isSubmitting}
                type="submit"
                onClick={onSubmitClick}
                dataTest="form-submit-button"
            >
                {submitLabel}
            </Button>
            {onSaveClick && (
                <Button
                    primary
                    small
                    disabled={submitting}
                    loading={isSaving}
                    type="button"
                    onClick={onSaveClick}
                    dataTest="form-save-button"
                >
                    {saveLabel}
                </Button>
            )}
            <LinkButton
                secondary
                small
                disabled={submitting}
                to={cancelTo}
                onClick={onCancelClick}
                dataTest="form-cancel-link"
            >
                {cancelLabel ?? i18n.t('Cancel')}
            </LinkButton>
        </ButtonStrip>
    )
}
