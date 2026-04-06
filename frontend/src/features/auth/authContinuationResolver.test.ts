import { describe, expect, it } from 'vitest'
import { resolveAuthContinuationPath } from '@/features/auth/authContinuationResolver'

describe('resolveAuthContinuationPath', () => {
  it('routes questionnaire source to onboarding for signup', () => {
    const path = resolveAuthContinuationPath({
      entryPoint: 'signup',
      source: 'questionnaire',
    })

    expect(path).toBe('/app/onboarding')
  })

  it('routes questionnaire source to onboarding for login', () => {
    const path = resolveAuthContinuationPath({
      entryPoint: 'login',
      source: 'questionnaire',
    })

    expect(path).toBe('/app/onboarding')
  })

  it('routes questionnaire source to onboarding for google callback', () => {
    const path = resolveAuthContinuationPath({
      entryPoint: 'google-callback',
      source: 'questionnaire',
    })

    expect(path).toBe('/app/onboarding')
  })

  it('routes signup without questionnaire source to onboarding', () => {
    const path = resolveAuthContinuationPath({
      entryPoint: 'signup',
      source: null,
    })

    expect(path).toBe('/app/onboarding')
  })

  it('routes login without questionnaire source to app', () => {
    const path = resolveAuthContinuationPath({
      entryPoint: 'login',
      source: null,
    })

    expect(path).toBe('/app')
  })

  it('routes google callback without questionnaire source to app', () => {
    const path = resolveAuthContinuationPath({
      entryPoint: 'google-callback',
      source: null,
    })

    expect(path).toBe('/app')
  })

  it('normalizes source casing and whitespace', () => {
    const path = resolveAuthContinuationPath({
      entryPoint: 'google-callback',
      source: '  QuEsTiOnNaIrE  ',
    })

    expect(path).toBe('/app/onboarding')
  })
})
