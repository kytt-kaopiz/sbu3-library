import { useStore } from '../store'
import clsx from 'clsx'

const ICONS = { success: '✅', error: '❌', info: 'ℹ️' }
const COLORS = {
  success: 'bg-green-900 border-l-4 border-green-400',
  error:   'bg-red-900 border-l-4 border-red-400',
  info:    'bg-blue-900 border-l-4 border-blue-400',
}

export default function Toast() {
  const { toasts } = useStore()
  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={clsx('toast-enter text-white px-4 py-3 rounded-xl text-sm font-medium shadow-xl max-w-xs flex items-center gap-2', COLORS[t.type])}>
          <span>{ICONS[t.type]}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}
