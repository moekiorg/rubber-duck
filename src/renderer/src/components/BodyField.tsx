import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { hyperLink } from '@renderer/lib/hyper-link-plugin'
import { internalLink } from '@renderer/lib/internal-link-plugin'
import { markdownImagePlugin } from '@renderer/lib/markdown-image-plugin'
import CodeMirror, { EditorView, ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { KeyboardEventHandler, LegacyRef } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  editorRef: LegacyRef<ReactCodeMirrorRef> | undefined
  onKeyDownCapture: KeyboardEventHandler<HTMLDivElement>
}

export default function BodyField({
  value,
  onChange,
  editorRef,
  onKeyDownCapture
}: Props): JSX.Element {
  return (
    <CodeMirror
      value={value}
      extensions={[
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        hyperLink,
        EditorView.lineWrapping,
        markdownImagePlugin,
        internalLink
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
