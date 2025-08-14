import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface PolygonRefreshButtonProps {
  onRefresh: () => void
  loading: boolean
  disabled?: boolean
}

export function PolygonRefreshButton({ onRefresh, loading, disabled }: PolygonRefreshButtonProps) {
  return (
    <Button
      onClick={onRefresh}
      disabled={disabled || loading}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Refreshing...' : 'Refresh Data'}
    </Button>
  )
} 