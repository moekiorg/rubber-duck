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
import { KeyboardEventHandler, useContext, useEffect } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  onKeyDownCapture: KeyboardEventHandler<HTMLDivElement>
}

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
