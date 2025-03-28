import { useIntl } from 'react-intl'
import { CiCirclePlus, CiSearch } from 'react-icons/ci'

export default function Header({
  title,
  onCreate,
  onToggleSearchMode
}: {
  title: string
  onCreate?: () => void
  onToggleSearchMode?: () => void
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

      {onToggleSearchMode && (
        <button
          type="button"
          className="search-button"
          onClick={onToggleSearchMode}
          aria-label={intl.formatMessage({ id: 'searchFullText' })}
        >
          <CiSearch size={20} />
        </button>
      )}
    </header>
  )
}
