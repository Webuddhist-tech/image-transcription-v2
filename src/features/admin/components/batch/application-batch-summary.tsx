import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { BatchItem, BatchItemSkeleton } from './batch-item'
import type { ApplicationBatchReport, Batch } from '@/types'

function percent(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

interface ApplicationBatchSummaryProps {
  report: ApplicationBatchReport | undefined
  batches?: Batch[]
  isLoading: boolean
  isBatchesLoading?: boolean
}

export function ApplicationBatchSummary({
  report,
  batches = [],
  isLoading,
  isBatchesLoading = false,
}: ApplicationBatchSummaryProps) {
  const { t } = useTranslation('admin')
  const [isExpanded, setIsExpanded] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <Skeleton className="h-4 w-56" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!report) return null

  const total = report.total_tasks
  const stats = [
    { label: 'Total', value: report.total_tasks, meta: '100%' },
    { label: 'Pending', value: report.pending, meta: `${percent(report.pending, total)}%` },
    { label: 'Half Annotated', value: report.half_annotated, meta: `${percent(report.half_annotated, total)}%` },
    { label: 'Annotated', value: report.annotated, meta: `${percent(report.annotated, total)}%` },
    { label: 'Half Reviewed', value: report.half_reviewed, meta: `${percent(report.half_reviewed, total)}%` },
    { label: 'Reviewed', value: report.reviewed, meta: `${percent(report.reviewed, total)}%` },
    { label: 'Finalised', value: report.finalised, meta: `${percent(report.finalised, total)}%` },
    { label: 'Trashed', value: report.trashed, meta: `${percent(report.trashed, total)}%` },
  ] as const

  const batchCount = batches.length

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="text-sm font-semibold tracking-tight capitalize">
            {report.name}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
            {t('batches.batchCount', { count: batchCount })}
          </span>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {stats.map((item) => (
          <div key={item.label} className="rounded-lg border bg-card px-3 py-2">
            <div className="text-[11px] font-medium text-muted-foreground">{item.label}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-lg font-semibold tabular-nums leading-none">{item.value}</div>
              <div className="text-xs text-muted-foreground tabular-nums">{item.meta}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t pt-4">
            {isBatchesLoading ? (
              [...Array(2)].map((_, i) => <BatchItemSkeleton key={i} />)
            ) : batchCount === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">
                {t('batches.noBatchesInGroup')}
              </p>
            ) : (
              batches.map((batch) => <BatchItem key={batch.id} batch={batch} />)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
