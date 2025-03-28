import { autocompletion } from '@codemirror/autocomplete'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorContext } from '@renderer/contexts/editorContext'
import { highlights } from '@renderer/lib/highlights'
import { hyperLink } from '@renderer/lib/hyper-link-plugin'
import { internalLinkCompletion } from '@renderer/lib/internal-link-completion'
import { internalLink } from '@renderer/lib/internal-link-plugin'
import { markdownImagePlugin } from '@renderer/lib/markdown-image-plugin'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { KeyboardEventHandler, useCallback, useContext, useEffect } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  onKeyDownCapture: KeyboardEventHandler<HTMLDivElement>
}

window.EditContext = false

export default function BodyField({ value, onChange, onKeyDownCapture }: Props): JSX.Element {
  const { ref: editorRef, isVisible, setIsVisible } = useContext(EditorContext)

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
