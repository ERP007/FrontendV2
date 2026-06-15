import { api } from '@/shared/api'

export interface OAuth2DebugToken {
  expiresAt: string | null
  issuedAt: string | null
  scopes?: string[]
  tokenPresent: boolean
  tokenSha256?: string | null
  tokenType?: string
  tokenValue?: string | null
  userRole?: unknown
  claims: Record<string, unknown>
}

export interface OAuth2DebugRefreshToken {
  expiresAt: string | null
  issuedAt: string | null
  tokenPresent: boolean
  tokenSha256?: string | null
}

export interface OAuth2DebugTokenResponse {
  accessToken: OAuth2DebugToken
  clientRegistrationId: string
  principalName: string
  refreshToken: OAuth2DebugRefreshToken | null
}

export async function fetchOAuth2DebugToken() {
  const response = await api.get<OAuth2DebugTokenResponse>('/debug/oauth2-token')
  return response.data
}

export async function logOAuth2DebugToken() {
  const token = await fetchOAuth2DebugToken()

  console.group('[ERP debug] OAuth2 token')
  console.log('accessToken.tokenPresent', token.accessToken.tokenPresent)
  console.log('accessToken.tokenValue', token.accessToken.tokenValue ?? null)
  console.log('accessToken.tokenSha256', token.accessToken.tokenSha256 ?? null)
  console.log('accessToken.userRole', token.accessToken.userRole)
  console.log('accessToken.claims', token.accessToken.claims)
  console.log('refreshToken.tokenPresent', token.refreshToken?.tokenPresent ?? false)
  console.log('refreshToken.tokenSha256', token.refreshToken?.tokenSha256 ?? null)
  console.log('raw', token)
  console.groupEnd()

  return token
}

declare global {
  interface Window {
    erpDebug?: {
      fetchOAuth2Token: typeof fetchOAuth2DebugToken
      logOAuth2Token: typeof logOAuth2DebugToken
    }
  }
}

export function installOAuth2TokenDebug() {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return
  }

  window.erpDebug = {
    ...window.erpDebug,
    fetchOAuth2Token: fetchOAuth2DebugToken,
    logOAuth2Token: logOAuth2DebugToken,
  }
}
