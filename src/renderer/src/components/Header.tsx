import { useIntl } from 'react-intl'
import { CiCirclePlus } from 'react-icons/ci'

export default function Header({
  title,
  onCreate
}: {
  title: string
  onCreate?: () => void
}): JSX.Element {
  const intl = useIntl()

  return (
    <header>
      {onCreate && (
        <button
          type="button"
          className="add-button"
          onClick={onCreate}
          aria-label={intl.formatMessage({ id: 'add' })}
        >
          <CiCirclePlus size={20} />
        </button>
      )}

      <h1>{title}</h1>

      <div></div>
    </header>
  )
}
