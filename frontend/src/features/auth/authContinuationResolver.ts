type AuthEntryPoint = 'signup' | 'login' | 'google-callback'

type AuthContinuationContext = {
  entryPoint: AuthEntryPoint
  source?: string | null
}

interface AuthContinuationStrategy {
  canHandle(context: AuthContinuationContext): boolean
  resolvePath(context: AuthContinuationContext): string
}

class QuestionnaireSourceStrategy implements AuthContinuationStrategy {
  canHandle(context: AuthContinuationContext): boolean {
    return normalizeSource(context.source) === 'questionnaire'
  }

  resolvePath(): string {
    return '/app/onboarding'
  }
}

class SignupDefaultStrategy implements AuthContinuationStrategy {
  canHandle(context: AuthContinuationContext): boolean {
    return context.entryPoint === 'signup'
  }

  resolvePath(): string {
    return '/app/onboarding'
  }
}

class DefaultAppStrategy implements AuthContinuationStrategy {
  canHandle(): boolean {
    return true
  }

  resolvePath(): string {
    return '/app'
  }
}

const strategies: AuthContinuationStrategy[] = [
  new QuestionnaireSourceStrategy(),
  new SignupDefaultStrategy(),
  new DefaultAppStrategy(),
]

function normalizeSource(source?: string | null): string | undefined {
  if (!source || typeof source !== 'string') {
    return undefined
  }

  const trimmed = source.trim().toLowerCase()
  return trimmed || undefined
}

export function resolveAuthContinuationPath(context: AuthContinuationContext): string {
  const normalizedContext: AuthContinuationContext = {
    ...context,
    source: normalizeSource(context.source),
  }

  const strategy = strategies.find((candidate) => candidate.canHandle(normalizedContext))
  if (!strategy) {
    return '/app'
  }

  return strategy.resolvePath(normalizedContext)
}

export type { AuthContinuationContext, AuthEntryPoint }