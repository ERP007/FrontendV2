import { Eye, EyeOff } from 'lucide-react'

export interface PasswordVisibilityToggleProps {
  onToggle: () => void
  visible: boolean
}

export function PasswordVisibilityToggle({ onToggle, visible }: PasswordVisibilityToggleProps) {
  return (
    <button
      aria-label={visible ? '비밀번호 숨기기' : '비밀번호 표시'}
      className="text-faint transition-colors hover:text-muted"
      type="button"
      onClick={onToggle}
    >
      {visible ? <EyeOff aria-hidden className="h-5 w-5" /> : <Eye aria-hidden className="h-5 w-5" />}
    </button>
  )
}
