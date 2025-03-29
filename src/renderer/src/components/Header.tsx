import { useIntl } from 'react-intl'
import { CiCirclePlus, CiSearch } from 'react-icons/ci'
import { useContext } from 'react'
import { FocusContext } from '@renderer/contexts/FocusContext'

export default function Header({
  title,
  onCreate
}: {
  title: string
  onCreate?: () => void
}): JSX.Element {
  const intl = useIntl()
  const { focus, setFocus } = useContext(FocusContext)

  return (
    <header>
      {onCreate && (
        <button
          type="button"
          className="i-button"
          onClick={onCreate}
          aria-label={intl.formatMessage({ id: 'add' })}
        >
          <CiCirclePlus size={20} />
        </button>
      )}

      <h1>{title}</h1>

      <button
        type="button"
        className="i-button"
        onClick={() => {
          if (focus !== 'fullTextSearch') {
            setFocus('fullTextSearch')
          } else {
            setFocus('editor')
          }
        }}
        aria-label={intl.formatMessage({ id: 'searchFullText' })}
      >
        <CiSearch size={20} />
      </button>
    </header>
  )
}
