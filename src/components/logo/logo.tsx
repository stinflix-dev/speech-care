import { SpeechIcon } from 'lucide-react'

export const Logo = () => {
  return (
    <div className="flex items-center gap-x-2 text-inherit">
      <div className="grid place-items-center rounded-lg bg-current/15 p-2">
        <SpeechIcon />
      </div>
      <span className="text-xl font-semibold">Speech Care</span>
    </div>
  )
}
