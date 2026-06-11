export interface PasswordRuleInput {
  currentPassword: string
  newPassword: string
}

export interface PasswordRule {
  id: string
  isSatisfied: (input: PasswordRuleInput) => boolean
  label: string
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'min-length',
    isSatisfied: ({ newPassword }) => newPassword.length >= 8,
    label: '8자 이상',
  },
  {
    id: 'has-letter',
    isSatisfied: ({ newPassword }) => /[A-Za-z]/.test(newPassword),
    label: '영문 포함',
  },
  {
    id: 'has-digit',
    isSatisfied: ({ newPassword }) => /\d/.test(newPassword),
    label: '숫자 포함',
  },
  {
    id: 'different-from-current',
    isSatisfied: ({ currentPassword, newPassword }) =>
      newPassword.length > 0 && newPassword !== currentPassword,
    label: '현재 비밀번호와 다름',
  },
]

export function isPasswordValid(input: PasswordRuleInput): boolean {
  return PASSWORD_RULES.every((rule) => rule.isSatisfied(input))
}
