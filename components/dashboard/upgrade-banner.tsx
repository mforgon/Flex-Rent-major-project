import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface UpgradeBannerProps {
  propertyCount: number
  limit: number
}

export function UpgradeBanner({ propertyCount, limit }: UpgradeBannerProps) {
  const isAtLimit = propertyCount >= limit

  if (!isAtLimit) {
    return null
  }

  return (
    <Alert className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Free Plan Limit Reached</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <span>
          You&apos;ve reached the limit of {limit} properties on the free plan. Upgrade to Pro to manage unlimited properties.
        </span>
        <Button variant="default" size="sm" className="shrink-0" asChild>
          <Link href="/dashboard/billing">
            Upgrade to Pro
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
} 