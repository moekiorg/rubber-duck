import { useIntl } from 'react-intl'
import { useContext } from 'react'
import { FocusContext } from '@renderer/contexts/FocusContext'
import { MaterialSymbol } from 'react-material-symbols'
import 'react-material-symbols/rounded'

export default function Header({ onCreate }: { onCreate?: () => void }): JSX.Element {
  const intl = useIntl()
  const { toggleFocus } = useContext(FocusContext)

  return (
    <header>
      {onCreate && (
        <button
          type="button"
          className="i-button"
          onClick={onCreate}
          aria-label={intl.formatMessage({ id: 'add' })}
        >
          <MaterialSymbol icon="add" size={20} />
        </button>
      )}

      <button
        type="button"
        className="i-button"
        onClick={() => toggleFocus('fileSearch')}
        aria-label={intl.formatMessage({ id: 'searchFile' })}
      >
        <MaterialSymbol icon="manage_search" size={20} />
      </button>

      <button
        type="button"
        className="i-button"
        onClick={() => toggleFocus('fullTextSearch')}
        aria-label={intl.formatMessage({ id: 'searchFullText' })}
      >
        <MaterialSymbol icon="search" size={20} />
      </button>
    </header>
  )
}
