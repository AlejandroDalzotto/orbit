type Props = {
  icon: React.ReactNode,
  color: 'neutral' | 'red',
  onClick: VoidFunction | (() => Promise<void>)
  text: string,
  disabled?: boolean
}

export default function DropdownMenuButton({ text, color, icon, disabled, onClick }: Props) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex disabled:opacity-50 items-center not-disabled:hover:bg-neutral-900 w-full gap-x-2 ${color === 'red' ? 'text-red-400 not-disabled:hover:text-red-300' : 'text-neutral-300 not-disabled:hover:text-white'}`}>
      {icon}
      {text}
    </button>
  )
}