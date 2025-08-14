type Props = {
  icon: React.ReactNode,
  color: 'neutral' | 'red',
  onClick: VoidFunction | (() => Promise<void>)
  text: string,
}

export default function DropdownMenuButton({ text, color, icon, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center hover:bg-neutral-900 w-full gap-x-2 ${color === 'red' ? 'text-red-400 hover:text-red-300' : 'text-neutral-300 hover:text-white'}`}>
      {icon}
      {text}
    </button>
  )
}