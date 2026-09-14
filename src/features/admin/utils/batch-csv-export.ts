import Papa from 'papaparse'

import type { BatchExportTask } from '@/types'

/**
 * CSV column headers mapping to BatchExportTask fields
 * Order determines column order in exported CSV
 */
const CSV_COLUMNS = [
  { key: 'file_number', header: 'File Number' },
  { key: 'image_url', header: 'Image URL' },
  { key: 'orientation', header: 'Orientation' },
  { key: 'state', header: 'Status' },
  { key: 'final_transcript', header: 'Final Transcript' },
  { key: 'annotator_1_id', header: 'Annotator 1 ID' },
  { key: 'annotator_1_text', header: 'Annotator 1 Text' },
  { key: 'annotator_2_id', header: 'Annotator 2 ID' },
  { key: 'annotator_2_text', header: 'Annotator 2 Text' },
  { key: 'reviewer_1_id', header: 'Reviewer 1 ID' },
  { key: 'reviewer_1_text', header: 'Reviewer 1 Text' },
  { key: 'reviewer_2_id', header: 'Reviewer 2 ID' },
  { key: 'reviewer_2_text', header: 'Reviewer 2 Text' },
  { key: 'final_reviewer_id', header: 'Final Reviewer ID' },
  { key: 'annotator_1_assigned', header: 'Annotator 1 Assigned' },
  { key: 'annotator_1_submitted', header: 'Annotator 1 Submitted' },
  { key: 'annotator_2_assigned', header: 'Annotator 2 Assigned' },
  { key: 'annotator_2_submitted', header: 'Annotator 2 Submitted' },
  { key: 'reviewer_1_assigned', header: 'Reviewer 1 Assigned' },
  { key: 'reviewer_1_submitted', header: 'Reviewer 1 Submitted' },
  { key: 'reviewer_2_assigned', header: 'Reviewer 2 Assigned' },
  { key: 'reviewer_2_submitted', header: 'Reviewer 2 Submitted' },
  { key: 'final_reviewer_assigned', header: 'Final Reviewer Assigned' },
  { key: 'final_reviewer_submitted', header: 'Final Reviewer Submitted' },
  { key: 'annotation_a_rejection_count', header: 'Annotation A Rejection Count' },
  { key: 'annotation_b_rejection_count', header: 'Annotation B Rejection Count' },
  { key: 'review_a_rejection_count', header: 'Review A Rejection Count' },
  { key: 'review_b_rejection_count', header: 'Review B Rejection Count' },
  { key: 'changed_assignee_slots', header: 'Changed Assignee Slots' },
  { key: 'final_char_count', header: 'Final Char Count' },
  { key: 'annotator_1_total_char_difference', header: 'Annotator 1 Total Char Difference' },
  { key: 'annotator_1_char_percent_diff', header: 'Annotator 1 Char Percent Diff' },
  { key: 'annotator_2_total_char_difference', header: 'Annotator 2 Total Char Difference' },
  { key: 'annotator_2_char_percent_diff', header: 'Annotator 2 Char Percent Diff' },
  { key: 'reviewer_1_total_char_difference', header: 'Reviewer 1 Total Char Difference' },
  { key: 'reviewer_1_char_percent_diff', header: 'Reviewer 1 Char Percent Diff' },
  { key: 'reviewer_2_total_char_difference', header: 'Reviewer 2 Total Char Difference' },
  { key: 'reviewer_2_char_percent_diff', header: 'Reviewer 2 Char Percent Diff' },
  { key: 'final_reviewer_total_char_difference', header: 'Final Reviewer Total Char Difference' },
  { key: 'final_reviewer_char_percent_diff', header: 'Final Reviewer Char Percent Diff' },
  { key: 'annotator_pair_levenshtein_distance', header: 'Annotator Pair Levenshtein Distance' },
  { key: 'annotator_pair_similarity_ratio', header: 'Annotator Pair Similarity Ratio' },
  { key: 'annotator_pair_diff_percentage', header: 'Annotator Pair Diff Percentage' },
  { key: 'reviewer_pair_levenshtein_distance', header: 'Reviewer Pair Levenshtein Distance' },
  { key: 'reviewer_pair_similarity_ratio', header: 'Reviewer Pair Similarity Ratio' },
  { key: 'reviewer_pair_diff_percentage', header: 'Reviewer Pair Diff Percentage' },
] as const satisfies ReadonlyArray<{ key: keyof BatchExportTask; header: string }>

type MissingExportCsvColumns = Exclude<
  keyof BatchExportTask,
  (typeof CSV_COLUMNS)[number]['key']
>
type AssertAllExportFieldsMapped = [MissingExportCsvColumns] extends [never] ? true : never
const _allExportFieldsMapped: AssertAllExportFieldsMapped = true
void _allExportFieldsMapped

/**
 * Transforms a BatchExportTask to a CSV row with all fields
 * Null values are converted to empty strings
 */
function transformTaskToCsvRow(task: BatchExportTask): Record<string, string | number> {
  const row: Record<string, string | number> = {}

  for (const { key, header } of CSV_COLUMNS) {
    const value = task[key]
    row[header] = value ?? ''
  }

  return row
}

/**
 * Sanitizes filename by removing invalid characters
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'batch-export'
}

/**
 * Triggers a browser download for the given content
 */
function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Exports batch tasks to CSV and triggers download
 *
 * @param tasks - Array of batch export tasks to export
 * @param batchName - Name of the batch (used for filename)
 */
export function exportBatchTasksToCsv(tasks: BatchExportTask[], batchName: string): void {
  if (tasks.length === 0) {
    return
  }

  const csvRows = tasks.map(transformTaskToCsvRow)
  const headers = CSV_COLUMNS.map(({ header }) => header)

  const csvContent = Papa.unparse(csvRows, {
    columns: headers,
    quotes: true,
    newline: '\n',
  })

  const filename = `${sanitizeFilename(batchName)}.csv`
  downloadFile(csvContent, filename)
}
