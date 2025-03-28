import { useState } from 'react'
import { NavLink } from 'react-router'
import { useDebouncedCallback } from 'use-debounce'
import parse from 'html-react-parser'
import { FormattedMessage, useIntl } from 'react-intl'

type Line = {
  num: number
  text: string
}

export type SearchResult = {
  title: string
  lines: Array<Line>
}

export function Search({
  setIsSearchMode,
  visible
}: {
  visible: boolean
  setIsSearchMode: (boolean) => void
}): JSX.Element {
  const [results, setResults] = useState<Array<SearchResult>>([])
  const [query, setQuery] = useState<string>('')
  const [history, setHistory] = useState<Array<string>>([])
  const [currentHistoryIndex, setCurrentHistoryindex] = useState<number>(0)
  const intl = useIntl()
  const [isNotFound, setIsNotFound] = useState(false)

  const handleSearch = useDebouncedCallback(async (e): Promise<void> => {
    if (e.target.value === '') {
      setResults([])
      return
    }
    const res = await window.api.searchFullText(e.target.value)
    setResults(res)
    if (res.length === 0) {
      setIsNotFound(true)
    } else {
      setIsNotFound(false)
    }
  }, 500)

  if (!visible) {
    return <></>
  }

  return (
    <div className="fts">
      <div className="fts-header">
        <input
          className="fts-field"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery((e.target as HTMLInputElement).value)
          }}
          placeholder={intl.formatMessage({ id: 'searchFullTextPlaceHolder' })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(e)
              setHistory([query, ...history])
            }
            if (e.key === 'ArrowUp' && currentHistoryIndex < history.length - 1) {
              e.preventDefault()
              setQuery(history[currentHistoryIndex + 1])
              setCurrentHistoryindex(currentHistoryIndex + 1)
            }
            if (e.key === 'ArrowDown' && currentHistoryIndex > 0) {
              e.preventDefault()
              setQuery(history[currentHistoryIndex - 1])
              setCurrentHistoryindex(currentHistoryIndex - 1)
            }
          }}
          autoFocus
        />
      </div>
      <div className="fts-result">
        {isNotFound ? (
          <div className="container fts-nf">
            <FormattedMessage id="notFound" />
          </div>
        ) : (
          <>
            {results.map((result) => (
              <div key={result.title} className="fts-rc">
                <NavLink
                  to={`/notes/${result.title}`}
                  state={{ title: result.title }}
                  className="fts-title"
                  onClick={() => setIsSearchMode(false)}
                >
                  {result.title}
                </NavLink>
                <div>
                  {result.lines.map((line, index) => (
                    <NavLink
                      to={`/notes/${result.title}`}
                      state={{ title: result.title, line: line.num }}
                      key={result.title + index}
                      className="fts-line"
                      onClick={() => setIsSearchMode(false)}
                    >
                      {parse(line.text)}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
