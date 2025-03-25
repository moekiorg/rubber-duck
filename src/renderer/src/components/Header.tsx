export default function Header({ title }: { title: string }): JSX.Element {
  return (
    <header>
      <h1>{title}</h1>
    </header>
  )
}
