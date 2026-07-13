import i18n from '@dhis2/d2-i18n'
import { Button, ButtonStrip, CircularLoader, Tooltip } from '@dhis2/ui'
import React from 'react'
import { useField, useFormState } from 'react-final-form'
import { useModelSectionHandleOrThrow } from '../../lib'
import { ModelSection } from '../../types'
import { DefaultFormErrorNotice } from '../form/DefaultFormErrorNotice'
import { LinkButton } from '../LinkButton'
import { StandardFormSectionTitle } from '../standardForm'
import css from './MergeForm.module.css'
import { MergeFormValuesBase } from './mergeSchemaBase'

export const DefaultMergeFormContents = (
    props: React.PropsWithChildren<{
        title?: React.ReactNode
        mergeCompleteElement?: React.ReactElement
        mergeInProgressElement?: React.ReactElement
    }>
) => {
    const { children, title, mergeCompleteElement, mergeInProgressElement } =
        props

    const { submitting, submitSucceeded } = useFormState<MergeFormValuesBase>({
        subscription: { submitting: true, submitSucceeded: true },
    })
    const section = useModelSectionHandleOrThrow()

    const completeElement = mergeCompleteElement ?? <MergeComplete />

    if (submitSucceeded) {
        return completeElement
    }

    if (submitting) {
        return (
            <>
                {title}
                {mergeInProgressElement ?? (
                    <MergeInProgress modelSection={section} />
                )}
            </>
        )
    }

    return (
        <>
            {title}
            {children}
            <DefaultFormErrorNotice />
            <MergeActions />
        </>
    )
}

const TooltipWrapper = ({
    children,
    codeConfirmInvalid,
    targetInputEmpty,
    sourcesEmpty,
}: React.PropsWithChildren<{
    codeConfirmInvalid: boolean
    targetInputEmpty: boolean
    sourcesEmpty: boolean
}>) => {
    if (!codeConfirmInvalid && !targetInputEmpty && !sourcesEmpty) {
        return children
    }
    const content = sourcesEmpty
        ? i18n.t('At least one source must be specified to merge')
        : targetInputEmpty
        ? i18n.t('Target must be specified to merge')
        : i18n.t('Correct confirmation code must be entered to merge')

    return <Tooltip content={content}>{children}</Tooltip>
}

export const MergeActions = () => {
    const codeConfirmInvalid = useField<string[]>('confirmation').meta?.invalid
    const targetInputEmpty = !useField<string[]>('target').input?.value
    const sourcesEmpty = !useField<string[]>('sources').input?.value?.length

    return (
        <ButtonStrip className={css.mergeActions}>
            <TooltipWrapper
                codeConfirmInvalid={codeConfirmInvalid ?? false}
                targetInputEmpty={targetInputEmpty}
                sourcesEmpty={sourcesEmpty}
            >
                <Button
                    primary
                    type="submit"
                    disabled={
                        sourcesEmpty || targetInputEmpty || codeConfirmInvalid
                    }
                >
                    {i18n.t('Merge')}
                </Button>
            </TooltipWrapper>
            <LinkButton to={'../'} secondary>
                {i18n.t('Cancel')}
            </LinkButton>
        </ButtonStrip>
    )
}

export const MergeInProgress = ({
    modelSection,
}: {
    modelSection: ModelSection
}) => {
    const count = useField<string[]>('sources').input.value?.length
    const modelLabel =
        count === 1 ? modelSection.title : modelSection.titlePlural

    const inProgressLabel = count
        ? i18n.t('Merging {{count}} {{model}}...', {
              count: count,
              model: modelLabel,
          })
        : i18n.t('Merging...')

    return (
        <div className={css.mergeInProgress}>
            <CircularLoader small />
            {inProgressLabel}
        </div>
    )
}

export const MergeComplete = ({ children }: React.PropsWithChildren) => {
    return (
        <div>
            <StandardFormSectionTitle>
                {i18n.t('Merge complete')}
            </StandardFormSectionTitle>
            {children}
            <LinkButton
                className={css.mergeCompleteBackButton}
                to="../"
                secondary
            >
                {i18n.t('Back to list')}
            </LinkButton>
        </div>
    )
}
