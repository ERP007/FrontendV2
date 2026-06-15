import { api } from '@/shared/api'

export interface OAuth2DebugToken {
  expiresAt: string | null
  issuedAt: string | null
  scopes?: string[]
  tokenType?: string
  tokenValue: string
  userRole?: unknown
  claims: Record<string, unknown>
}

export interface OAuth2DebugRefreshToken {
  expiresAt: string | null
  issuedAt: string | null
  tokenValue: string
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
  console.log('accessToken.tokenValue', token.accessToken.tokenValue)
  console.log('accessToken.userRole', token.accessToken.userRole)
  console.log('accessToken.claims', token.accessToken.claims)
  console.log('refreshToken.tokenValue', token.refreshToken?.tokenValue ?? null)
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
