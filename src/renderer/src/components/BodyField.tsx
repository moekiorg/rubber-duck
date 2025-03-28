import { autocompletion } from '@codemirror/autocomplete'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorContext } from '@renderer/contexts/editorContext'
import { highlights } from '@renderer/lib/highlights'
import { hyperLink } from '@renderer/lib/hyper-link-plugin'
import { internalLinkCompletion } from '@renderer/lib/internal-link-completion'
import { internalLink } from '@renderer/lib/internal-link-plugin'
import { markdownImagePlugin } from '@renderer/lib/markdown-image-plugin'
import CodeMirror, { EditorState, EditorView } from '@uiw/react-codemirror'
import { KeyboardEventHandler, useCallback, useContext, useEffect } from 'react'
import { useIntl } from 'react-intl'

interface Props {
  value: string
  onChange: (value: string) => void
  onKeyDownCapture: KeyboardEventHandler<HTMLDivElement>
}

window.EditContext = false

export default function BodyField({ value, onChange, onKeyDownCapture }: Props): JSX.Element {
  const { ref: editorRef, isVisible, setIsVisible } = useContext(EditorContext)
  const intl = useIntl()

  useEffect(() => {
    const handleKeyDown = (e): void => {
      if (e.metaKey && e.key === '1' && editorRef?.current) {
        editorRef.current.view?.focus()
      }
      if (e.metaKey && e.key === '0') {
        setIsVisible(false)
        setTimeout(() => setIsVisible(true), 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return (): void => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [editorRef, setIsVisible])

  const insertImage = useCallback(
    (name, pos): void => {
      const state = editorRef?.current?.state
      if (!state) {
        return
      }
      editorRef.current.view?.dispatch({
        changes: { from: pos, insert: `![](${name})` },
        selection: { anchor: pos + 2 }
      })
      editorRef.current.view?.focus()
    },
    [editorRef]
  )

  const handleFileDrop = (e): void => {
    e.preventDefault()

    const items = e.dataTransfer!.items!
    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry()
      if (item && item.isFile) {
        new Promise<File>((resolve, reject) => {
          ;(item as FileSystemFileEntry).file(resolve, reject)
        }).then((file) => {
          window.api.copyFile(file).then(() => {
            const pos = editorRef?.current?.view?.posAtCoords({
              x: e.pageX,
              y: e.pageY
            })
            insertImage(item.name, pos)
          })
        })
      }
    }
  }

  if (!isVisible) {
    return <></>
  }

  return (
    <CodeMirror
      value={value}
      extensions={[
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        hyperLink,
        EditorView.lineWrapping,
        markdownImagePlugin,
        internalLink,
        ...highlights,
        autocompletion({
          override: [internalLinkCompletion]
        }),
        EditorView.domEventHandlers({
          drop: handleFileDrop
        }),
        EditorState.phrases.of({
          Find: intl.formatMessage({ id: 'find' }),
          Replace: intl.formatMessage({ id: 'replace' }),
          next: intl.formatMessage({ id: 'next' }),
          previous: intl.formatMessage({ id: 'previous' }),
          all: intl.formatMessage({ id: 'all' }),
          'match case': intl.formatMessage({ id: 'match case' }),
          'by word': intl.formatMessage({ id: 'by word' }),
          replace: intl.formatMessage({ id: 'replace' }),
          regexp: intl.formatMessage({ id: 'regexp' }),
          'replace all': intl.formatMessage({ id: 'replace all' }),
          close: intl.formatMessage({ id: 'close' }),
          'current match': 'aktueller Treffer',
          'replaced $ matches': '$ Treffer ersetzt',
          'replaced match on line $': 'Treffer on Zeile $ ersetzt',
          'on line': 'auf Zeile'
        })
      ]}
      onChange={onChange}
      ref={editorRef}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false
      }}
      onKeyDownCapture={onKeyDownCapture}
    />
  )
}
