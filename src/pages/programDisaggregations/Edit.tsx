import i18n from '@dhis2/d2-i18n'
import { Button, CircularLoader, NoticeBox } from '@dhis2/ui'
import { useQuery } from '@tanstack/react-query'
import arrayMutators from 'final-form-arrays'
import React, { useEffect, useMemo, useState } from 'react'
import { Form as ReactFinalForm, useForm, useFormState } from 'react-final-form'
import { To, useParams } from 'react-router-dom'
import { createPortalToFooter } from '../../app/layout'
import {
    DefaultSectionedFormSidebar,
    FormFooterWrapper,
    SectionedFormLayout,
    StandardFormActions,
} from '../../components'
import {
    DEFAULT_FIELD_FILTERS,
    getSectionPath,
    SectionedFormProvider,
    SECTIONS_MAP,
    useBoundResourceQueryFn,
} from '../../lib'
import {
    ModelCollectionResponse,
    PickWithFieldFilters,
    Program,
    ProgramIndicator,
} from '../../types/generated'
import { ProgramDisaggregationFormFields } from './form'
import { apiResponseToFormValues } from './form/apiResponseToFormValues'
import { ProgramDisaggregationFormValues } from './form/programDisaggregationSchema'
import { useOnSubmit } from './form/useOnSubmit'

const fieldFilters = [
    ...DEFAULT_FIELD_FILTERS,
    'name',
    'shortName',
    'code',
    'categoryMappings',
] as const

const programIndicatorFieldFilters = [
    'id',
    'name',
    'displayName',
    'categoryMappingIds',
    'attributeCombo[id, displayName, dataDimensionType, categories[id, displayName,name,dataDimensionType,categoryOptions[id, displayName]]]',
    'categoryCombo[id, displayName, dataDimensionType, categories[id, displayName,name,dataDimensionType,categoryOptions[id, displayName]]]',
    'aggregateExportDataElement',
    'aggregateExportCategoryOptionCombo',
    'aggregateExportAttributeOptionCombo',
] as const

export type ProgramData = PickWithFieldFilters<Program, typeof fieldFilters>
export type ProgramIndicatorData = ModelCollectionResponse<
    PickWithFieldFilters<ProgramIndicator, typeof programIndicatorFieldFilters>,
    'programIndicators'
>
export type ProgramIndicatorWithMapping = {
    displayName: string
    name: string
    id: string
}

const section = SECTIONS_MAP.programDisaggregation

export const Component = () => {
    const id = useParams().id!
    const queryFn = useBoundResourceQueryFn()
    const query = {
        resource: 'programs',
        id: id,
        params: { fields: fieldFilters.concat() },
    }

    const programQuery = useQuery({
        queryKey: [query],
        queryFn: queryFn<ProgramData>,
    })

    const programIndicatorsQuery = useQuery({
        queryKey: [
            {
                resource: 'programIndicators',
                params: {
                    fields: programIndicatorFieldFilters.concat(),
                    filter: [`program.id:eq:${id}`],
                    paging: false,
                },
            },
        ],
        queryFn: queryFn<ProgramIndicatorData>,
    })

    const isLoading = programQuery.isLoading || programIndicatorsQuery.isLoading
    const isError = programQuery.isError || programIndicatorsQuery.isError

    const initialValues: ProgramDisaggregationFormValues = useMemo(() => {
        if (programQuery.data && programIndicatorsQuery.data) {
            const { programIndicatorMappings, categoryMappings } =
                apiResponseToFormValues({
                    program: programQuery.data,
                    programIndicators: programIndicatorsQuery.data,
                })

            return {
                deletedCategories: [],
                deletedProgramIndicatorMappings: [],
                programIndicatorMappings,
                categoryMappings,
            }
        }

        return {
            categoryMappings: {},
            programIndicatorMappings: {},
            deletedCategories: [],
            deletedProgramIndicatorMappings: [],
        }
    }, [programQuery.data, programIndicatorsQuery.data])

    const initialProgramIndicators: ProgramIndicatorWithMapping[] =
        useMemo(() => {
            if (initialValues.programIndicatorMappings) {
                return Object.entries(
                    initialValues.programIndicatorMappings
                ).map(([id, value]) => ({
                    id,
                    name: value.name,
                    displayName: value.displayName,
                }))
            }
            return []
        }, [initialValues.programIndicatorMappings])

    const closeOnSubmitRef = React.useRef(false)
    const setCloseOnSubmit = (value: boolean) => {
        closeOnSubmitRef.current = value
    }
    const listPath = `/${getSectionPath(section)}`

    return (
        <ReactFinalForm
            initialValues={initialValues}
            onSubmit={useOnSubmit(id, initialValues, closeOnSubmitRef)}
            mutators={{ ...arrayMutators }}
            destroyOnUnregister={false}
            subscription={{}}
        >
            {({ handleSubmit }) => {
                return (
                    <SectionedFormProvider
                        formDescriptor={{
                            name: 'programDisaggregationForm',
                            label: i18n.t('Program Disaggregation Form'),
                            sections: [
                                {
                                    name: 'programIndicatorMappings',
                                    label: i18n.t('Program indicator mappings'),
                                    fields: [],
                                },
                                {
                                    name: 'disaggregationCategories',
                                    label: i18n.t('Disaggregation categories'),
                                    fields: [],
                                },
                                {
                                    name: 'attributeCategories',
                                    label: i18n.t('Attribute categories'),
                                    fields: [],
                                },
                            ],
                        }}
                    >
                        {isLoading && (
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <CircularLoader />
                            </div>
                        )}
                        {isError && (
                            <NoticeBox title={i18n.t('Error')} error>
                                {i18n.t(
                                    'Could not load programs or indicators data.'
                                )}
                                <br />
                                <Button
                                    small
                                    onClick={() => {
                                        programIndicatorsQuery.refetch()
                                        programQuery.refetch()
                                    }}
                                >
                                    {i18n.t('Retry')}
                                </Button>
                            </NoticeBox>
                        )}
                        {!isLoading && !isError && (
                            <SectionedFormLayout
                                sidebar={<DefaultSectionedFormSidebar />}
                            >
                                <form onSubmit={handleSubmit}>
                                    <ProgramDisaggregationFormFields
                                        initialProgramIndicators={
                                            initialProgramIndicators
                                        }
                                        programName={
                                            programQuery?.data?.displayName
                                        }
                                    />
                                    <ProgramDisaggregationFooter
                                        cancelTo={listPath}
                                        setCloseOnSubmit={setCloseOnSubmit}
                                    />
                                </form>
                            </SectionedFormLayout>
                        )}
                    </SectionedFormProvider>
                )
            }}
        </ReactFinalForm>
    )
}

type ProgramDisaggregationFooterProps = {
    cancelTo: To
    setCloseOnSubmit: (value: boolean) => void
}

const ProgramDisaggregationFooter = ({
    cancelTo,
    setCloseOnSubmit,
}: ProgramDisaggregationFooterProps) => {
    const { submit } = useForm()

    const { submitting } = useFormState({
        subscription: { submitting: true },
    })

    const [activeAction, setActiveAction] = useState<
        'save' | 'saveAndExit' | null
    >(null)

    const handleSubmit = (shouldClose: boolean) => {
        const action = shouldClose ? 'saveAndExit' : 'save'

        setActiveAction(action)
        setCloseOnSubmit(shouldClose)
        submit()
    }

    useEffect(() => {
        if (!submitting) {
            setActiveAction(null)
        }
    }, [submitting])

    return createPortalToFooter(
        <FormFooterWrapper>
            <StandardFormActions
                cancelLabel={i18n.t('Cancel')}
                submitLabel={i18n.t('Save and close')}
                submitting={submitting}
                activeAction={activeAction}
                onSubmitClick={() => handleSubmit(true)}
                onSaveClick={() => handleSubmit(false)}
                cancelTo={cancelTo}
            />
        </FormFooterWrapper>
    )
}
