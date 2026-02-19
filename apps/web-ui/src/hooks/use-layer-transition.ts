/**
 * Layer Transition Hook
 * Story 2.3: Progressive Disclosure - Layer 1 to 2
 *
 * Manages transitions between progressive disclosure layers.
 * Detects user intent and orchestrates smooth layer transitions.
 */

import { useEffect, useCallback, useRef, useState, useMemo } from 'react'
import { useConversationStore, Layer } from '@/stores/conversation-store'
import { detectIntent, type MessageIntent } from '@/lib/message-utils'

/**
 * Transition direction for animations
 */
export type TransitionDirection = 'forward' | 'backward' | 'none'

/**
 * Layer transition state
 */
interface LayerTransitionState {
  isTransitioning: boolean
  direction: TransitionDirection
  currentLayer: Layer
  previousLayer: Layer | null
}

/**
 * Intent detection result with layer recommendation
 */
interface IntentAnalysis {
  intent: MessageIntent
  confidence: number
  recommendedLayer: Layer
  requiresTeamSelection: boolean
  requiresWorkflowSelection: boolean
  reason: string
}

/**
 * Options for layer transitions
 */
interface LayerTransitionOptions {
  animated?: boolean
  duration?: number
  onLayerChange?: (from: Layer, to: Layer) => void
  onTransitionStart?: () => void
  onTransitionEnd?: () => void
}

/**
 * Analyze user message to determine layer needs
 */
function analyzeIntent(message: string): IntentAnalysis {
  const intent = detectIntent(message)

  // Default to Layer 2 for any interaction
  const analysis: IntentAnalysis = {
    intent,
    confidence: 0.7,
    recommendedLayer: 2,
    requiresTeamSelection: false,
    requiresWorkflowSelection: false,
    reason: 'User engaged in conversation',
  }

  // Specific intent handling
  switch (intent) {
    case 'investigation':
    case 'security':
    case 'strategy':
      analysis.recommendedLayer = 2
      analysis.reason = `User expressed ${intent} intent - guidance needed`
      analysis.requiresTeamSelection = true
      break
    case 'general':
      analysis.recommendedLayer = 2
      analysis.reason = 'User asked general question - clarification needed'
      break
    default:
      analysis.confidence = 0.3
      analysis.reason = 'Unclear intent - staying in current layer'
  }

  return analysis
}

/**
 * Hook for managing layer transitions
 */
export function useLayerTransition(options: LayerTransitionOptions = {}) {
  const {
    animated = true,
    duration = 300,
    onLayerChange,
    onTransitionStart,
    onTransitionEnd,
  } = options

  const {
    currentLayer,
    previousLayer,
    setLayer,
    goToPreviousLayer,
    messages,
    context,
  } = useConversationStore()

  const isTransitioningRef = useRef(false)
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Determine transition direction
   */
  const getDirection = useCallback(
    (from: Layer, to: Layer): TransitionDirection => {
      if (to > from) return 'forward'
      if (to < from) return 'backward'
      return 'none'
    },
    []
  )

  /**
   * Get current transition state
   */
  const getTransitionState = useCallback((): LayerTransitionState => {
    return {
      isTransitioning: isTransitioningRef.current,
      direction: getDirection(previousLayer || 1, currentLayer),
      currentLayer,
      previousLayer,
    }
  }, [currentLayer, previousLayer, getDirection])

  /**
   * Transition to a specific layer
   */
  const transitionTo = useCallback(
    async (targetLayer: Layer) => {
      if (isTransitioningRef.current || targetLayer === currentLayer) {
        return
      }

      // Clear any pending transition
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }

      const direction = getDirection(currentLayer, targetLayer)

      // Start transition
      isTransitioningRef.current = true
      onTransitionStart?.()
      onLayerChange?.(currentLayer, targetLayer)

      // Update layer in store
      setLayer(targetLayer)

      // Wait for animation if animated
      if (animated) {
        await new Promise((resolve) => {
          transitionTimeoutRef.current = setTimeout(resolve, duration)
        })
      }

      // End transition
      isTransitioningRef.current = false
      onTransitionEnd?.()
    },
    [
      currentLayer,
      setLayer,
      getDirection,
      animated,
      duration,
      onTransitionStart,
      onTransitionEnd,
      onLayerChange,
    ]
  )

  /**
   * Go back to previous layer
   */
  const goBack = useCallback(async () => {
    if (previousLayer !== null && !isTransitioningRef.current) {
      await transitionTo(previousLayer)
    }
  }, [previousLayer, transitionTo])

  /**
   * Analyze message and transition if needed
   */
  const analyzeAndTransition = useCallback(
    async (message: string) => {
      const analysis = analyzeIntent(message)

      // Only auto-transition from Layer 1 to Layer 2
      if (currentLayer === 1 && analysis.recommendedLayer === 2) {
        await transitionTo(2)
      }

      return analysis
    },
    [currentLayer, transitionTo]
  )

  /**
   * Check if we should show team/workflow selection
   */
  const shouldShowTeamSelection = useCallback((): boolean => {
    return currentLayer >= 2 && (context.requiresTeam || false)
  }, [currentLayer, context])

  const shouldShowWorkflowSelection = useCallback((): boolean => {
    return currentLayer >= 2 && (context.requiresWorkflow || false)
  }, [currentLayer, context])

  /**
   * Check if we should show suggestions
   */
  const shouldShowSuggestions = useCallback((): boolean => {
    return currentLayer === 2 && messages.length > 0
  }, [currentLayer, messages.length])

  /**
   * Get transition animation class
   */
  const getAnimationClass = useCallback((): string => {
    const state = getTransitionState()
    if (!state.isTransitioning) return ''

    const baseClasses = 'transition-all duration-300'

    switch (state.direction) {
      case 'forward':
        return `${baseClasses} animate-in fade-in slide-in-from-right-4`
      case 'backward':
        return `${baseClasses} animate-in fade-in slide-in-from-left-4`
      default:
        return baseClasses
    }
  }, [getTransitionState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  return {
    // State
    currentLayer,
    previousLayer,
    transitionState: getTransitionState(),

    // Actions
    transitionTo,
    goBack,
    analyzeAndTransition,

    // Queries
    shouldShowTeamSelection,
    shouldShowWorkflowSelection,
    shouldShowSuggestions,
    getAnimationClass,
  }
}

/**
 * Hook for layer transition animations
 * Returns CSS classes for enter/exit animations
 */
export function useLayerAnimation(
  layer: Layer,
  isActive: boolean
): {
  className: string
  style: React.CSSProperties
} {
  const [isVisible, setIsVisible] = useState(isActive)

  useEffect(() => {
    if (isActive) {
      setIsVisible(true)
    } else {
      // Delay hiding for exit animation
      const timeout = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [isActive])

  const className = useMemo(() => {
    if (!isVisible) return 'hidden'

    if (isActive) {
      return 'animate-in fade-in slide-in-from-bottom-2 duration-300'
    }

    return 'animate-out fade-out slide-out-to-top-2 duration-300'
  }, [isVisible, isActive])

  const style: React.CSSProperties = {
    animationDuration: '300ms',
    animationTimingFunction: 'ease-out',
  }

  return { className, style }
}
