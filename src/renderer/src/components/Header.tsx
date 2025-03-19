export default function Header({ title }: { title: string }): JSX.Element {
  return (
    <header className="bg-gray-100 text-xs flex items-center justify-center px-3 h-[30px] border-b border-[rgb(218,218,218)]">
      <h1>{title}</h1>
    </header>
  )
}
