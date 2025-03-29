import { useContext, useState } from 'react'
import { NavLink } from 'react-router'
import { useDebouncedCallback } from 'use-debounce'
import parse from 'html-react-parser'
import { FormattedMessage, useIntl } from 'react-intl'
import sum from 'lodash/sum'
import scrollIntoView from 'scroll-into-view-if-needed'
import { FocusContext } from '@renderer/contexts/FocusContext'

type Line = {
  num: number
  text: string
}

export type SearchResult = {
  title: string
  lines: Array<Line>
}

export function Search(): JSX.Element {
  const [results, setResults] = useState<Array<SearchResult>>([])
  const [query, setQuery] = useState<string>('')
  const [history, setHistory] = useState<Array<string>>([])
  const [currentHistoryIndex, setCurrentHistoryindex] = useState<number>(0)
  const intl = useIntl()
  const [isNotFound, setIsNotFound] = useState(false)
  const [currentSelectedResult, setCurrentSelectedResult] = useState(-1)
  const { focus, setFocus } = useContext(FocusContext)

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

  console.log(focus)

  if (focus !== 'fullTextSearch') {
    return <></>
  }

  return (
    <div
      className="fts"
      onKeyDown={(e) => {
        if (
          e.key === 'ArrowDown' &&
          currentHistoryIndex === 0 &&
          currentSelectedResult < sum(results.map((result) => result.lines.length)) - 1
        ) {
          setCurrentSelectedResult(currentSelectedResult + 1)
          const el = document.querySelector(`#result-${currentSelectedResult + 1}`)!
          try {
            scrollIntoView(el, { behavior: 'smooth', scrollMode: 'if-needed' })
          } catch (e) {
            console.warn(e)
          }
        }
        if (e.key === 'ArrowUp' && currentSelectedResult > -1) {
          setCurrentSelectedResult(currentSelectedResult - 1)
          const el = document.querySelector(`#result-${currentSelectedResult - 1}`)!
          try {
            scrollIntoView(el, { behavior: 'smooth', scrollMode: 'if-needed' })
          } catch (e) {
            console.warn(e)
          }
        }
        if (e.key === 'Enter' || (e.key === ' ' && currentSelectedResult > 0)) {
          document.querySelector<HTMLAnchorElement>(`#result-${currentSelectedResult}`)!.click()
        }
      }}
    >
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
            if (e.key === 'Escape') {
              ;(e.target as HTMLInputElement).blur()
            }
            if (e.key === 'Enter' && currentSelectedResult === -1) {
              handleSearch(e)
              setHistory([query, ...history])
            }
            if (
              e.key === 'ArrowUp' &&
              currentHistoryIndex < history.length - 1 &&
              currentSelectedResult === -1
            ) {
              e.preventDefault()
              setQuery(history[currentHistoryIndex + 1])
              setCurrentHistoryindex(currentHistoryIndex + 1)
            }
            if (e.key === 'ArrowDown' && currentHistoryIndex > 0 && currentSelectedResult === -1) {
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
            {results.map((result, index) => (
              <div key={result.title} className="fts-rc">
                <NavLink
                  to={`/notes/${result.title}`}
                  state={{ title: result.title }}
                  className="fts-title"
                  onClick={() => setFocus('editor')}
                >
                  {result.title}
                </NavLink>
                <div>
                  {result.lines.map((line, lineIndex) => (
                    <NavLink
                      to={`/notes/${result.title}`}
                      id={`result-${
                        sum(results.slice(0, index).map((result) => result.lines.length)) +
                        lineIndex
                      }`}
                      state={{ title: result.title, line: line.num }}
                      key={result.title + lineIndex}
                      className={`fts-line ${sum(results.slice(0, index).map((result) => result.lines.length)) + lineIndex === currentSelectedResult ? 'fts-line--active' : ''}`}
                      onClick={() => setFocus('editor')}
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
