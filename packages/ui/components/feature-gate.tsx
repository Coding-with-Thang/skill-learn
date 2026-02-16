'use client'

import { useFeatures } from '@skill-learn/lib/hooks/useFeatures'
import { Lock, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from './card'
import { Button } from './button'
import Link from 'next/link'

/**
 * FeatureGate component - Conditionally renders children based on feature availability
 * 
 * @param {Object} props
 * @param {string} props.feature - The feature key to check
 * @param {React.ReactNode} props.children - Content to render if feature is enabled
 * @param {React.ReactNode} [props.fallback] - Optional custom fallback content
 * @param {boolean} [props.showDisabledMessage=true] - Whether to show disabled message or nothing
 * @param {string} [props.featureName] - Display name of the feature for the disabled message
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showDisabledMessage = true,
  featureName,
}) {
  const { isEnabled, isLoading } = useFeatures()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isEnabled(feature)) {
    if (fallback) {
      return fallback
    }

    if (!showDisabledMessage) {
      return null
    }

    return (
      <FeatureDisabledMessage
        featureName={featureName || feature}
      />
    )
  }

  return children
}

interface FeatureDisabledMessageProps {
  featureName?: string;
  title?: string;
  description?: string;
  showContactAdmin?: boolean;
  showBackButton?: boolean;
  className?: string;
}

/**
 * FeatureDisabledMessage component - Shows a message when a feature is disabled
 */
export function FeatureDisabledMessage({
  featureName = 'This feature',
  title,
  description,
  showContactAdmin = true,
  showBackButton = true,
  className = '',
}: FeatureDisabledMessageProps) {
  const displayName = featureName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <div className={`flex items-center justify-center min-h-[400px] p-4 ${className}`}>
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>

          <h2 className="text-xl font-semibold mb-2">
            {title || `${displayName} is Not Available`}
          </h2>

          <p className="text-muted-foreground mb-6">
            {description || `The ${displayName.toLowerCase()} feature is currently disabled for your organization.`}
          </p>

          {showContactAdmin && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground text-left">
                  Please contact your administrator if you believe this feature should be enabled for your organization.
                </p>
              </div>
            </div>
          )}

          {showBackButton && (
            <Link href="/home">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface FeatureDisabledPageProps {
  featureName?: string;
  title?: string;
  description?: string;
}

/**
 * FeatureDisabledPage component - Full page version for route-level feature gating
 */
export function FeatureDisabledPage({
  featureName = 'This feature',
  title,
  description,
}: FeatureDisabledPageProps) {
  const displayName = featureName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="p-10 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-8">
            <Lock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>

          <h1 className="text-2xl font-bold mb-3">
            {title || `${displayName} is Not Available`}
          </h1>

          <p className="text-muted-foreground text-lg mb-8">
            {description || `The ${displayName.toLowerCase()} feature is currently disabled for your organization.`}
          </p>

          <div className="bg-muted/50 rounded-lg p-5 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-left">
                <p className="font-medium mb-1">Need this feature?</p>
                <p className="text-sm text-muted-foreground">
                  Contact your organization administrator to request access to this feature.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link href="/home">
              <Button variant="outline">
                Back to Home
              </Button>
            </Link>
            <Link href="/discover">
              <Button>
                Explore Other Features
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * withFeatureGate HOC - Wraps a component with feature gating
 * 
 * Usage:
 * const GatedGamesPage = withFeatureGate(GamesPage, 'games', 'Games')
 */
export function withFeatureGate(Component, feature, featureName) {
  return function FeatureGatedComponent(props) {
    return (
      <FeatureGate
        feature={feature}
        featureName={featureName}
        fallback={<FeatureDisabledPage featureName={featureName || feature} />}
      >
        <Component {...props} />
      </FeatureGate>
    )
  }
}

export default FeatureGate
