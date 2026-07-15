import i18n from '@dhis2/d2-i18n'
import { Button, Field, IconLaunch16, Tooltip } from '@dhis2/ui'
import React from 'react'
import { useField } from 'react-final-form'
import { useHref } from 'react-router'
import { ModelSingleSelectFF } from '../../../../../components/metadataFormControls/ModelSingleSelect'
import { DisplayableModel } from '../../../../../types/models'
import classes from './StageProgramField.module.css'

const PROGRAMS_QUERY = {
    resource: 'programs',
    params: {
        fields: ['id', 'displayName'],
        order: 'displayName:asc',
        filter: 'programType:eq:WITH_REGISTRATION',
    },
}

const DATA_TEST = 'formfields-stage-program'

export const StageProgramField = ({
    isEditing,
    programId,
}: {
    isEditing: boolean
    programId?: string
}) => {
    const programHref = useHref(`/programs/${programId}`)
    const { input, meta } = useField<DisplayableModel | undefined>('program', {
        validate: (program) =>
            program?.id ? undefined : i18n.t('A program is required'),
    })

    return (
        <Field
            dataTest={DATA_TEST}
            label={i18n.t('Program')}
            required
            error={meta.invalid}
            validationText={(meta.touched && meta.error?.toString()) || ''}
        >
            <div className={classes.wrapper}>
                <ModelSingleSelectFF
                    input={input}
                    meta={meta}
                    query={PROGRAMS_QUERY}
                    disabled={isEditing}
                />
                {isEditing && (
                    <Tooltip content={i18n.t('View program')}>
                        <a
                            href={programHref}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                secondary
                                dataTest={`${DATA_TEST}-view-link`}
                                icon={<IconLaunch16 />}
                            />
                        </a>
                    </Tooltip>
                )}
            </div>
        </Field>
    )
}
