/* Entry point for the standalone program stage form.
   The stage form is shared with the in-program drawer, so the schema, types and
   form building blocks live under programs/form/programStage and are re-exported
   here so the standalone section owns a single, conventional import surface. */
export { StageFormContents } from '../../programs/form/programStage/StageFormContents'
export { StageFormDescriptor } from '../../programs/form/programStage/stageFormDescriptor'
export {
    initialStageValue,
    stageListSchema,
    stageSchema,
} from '../../programs/form/programStage/stageSchema'
export {
    fieldFilters,
    stageSchemaSection,
} from '../../programs/form/programStage/stageFormShared'
export type {
    PartialStageFormValues,
    StageFormValues,
    StageFormValuesFromFilters,
    SubmittedStageFormValues,
} from '../../programs/form/programStage/stageFormShared'
