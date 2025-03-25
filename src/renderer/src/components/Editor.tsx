import { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import BodyField from './BodyField'
import TitleField from './TitleField'
import { KeyboardEventHandler, RefObject, useEffect, useRef, useState } from 'react'
import { File } from './Page'
import { useDebouncedCallback } from 'use-debounce'

interface Props {
  currentFile: File
  onTitleChange: (value: string) => void
  files: Array<File>
  setCurrentTitle: (value: string) => void
  currentTitle: string
  isSidebarVisible: boolean
  onBodyChange: (value: string) => void
  titleEditor: RefObject<HTMLTextAreaElement>
}

export default function Editor({
  currentFile,
  onTitleChange,
  files,
  setCurrentTitle,
  currentTitle,
  isSidebarVisible,
  onBodyChange,
  titleEditor
}: Props): JSX.Element {
  const [editorVisible, setEditorVisible] = useState(true)
  const [currentBody, setCurrentBody] = useState('')
  const editor = useRef<ReactCodeMirrorRef>(null)

  const writeFile = useDebouncedCallback(async (t, b, target) => {
    const result = window.api.writeFile(t, b, target)
    if (!result) {
      return
    }
  }, 500)

  const handleUpdate = (value: string): void => {
    if (files.find((f) => f !== currentFile && f.title === currentFile?.title)) {
      return
    }
    writeFile(currentTitle, value, currentFile.id)
    setCurrentBody(value)
    onBodyChange(value)
  }

  const handleTitleKeyDown = (e): void => {
    if (e.keyCode === 13) {
      e.preventDefault()
      editor.current?.view?.focus()
      setCurrentBody(`\n${currentBody}`)
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      editor.current?.view?.focus()
    }
  }

  const handleTitleChange = (value): void => {
    let title = value
    if (!title) {
      let counter = 0
      do {
        title = counter === 0 ? 'Untitled' : `Untitled${counter}`
        counter++
      } while (files.find((f) => f.title === title))
    }
    setCurrentTitle(value)

    writeFile(`${title}`, currentBody, currentFile.id)

    onTitleChange(value)
  }

  const handleBodyKeyDownCapture: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'ArrowUp') {
      const view = editor.current?.view
      if (!view) return

      const line = view.state.doc.lineAt(view.state.selection.main.head)

      if (line.number === 1) {
        e.preventDefault()
        titleEditor.current?.focus()
        titleEditor.current?.setSelectionRange(
          titleEditor.current.value.length,
          titleEditor.current.value.length
        )
      }
    }
  }

  useEffect(() => {
    if (!currentFile) {
      return
    }
    window.api.getBody(currentFile.id).then(setCurrentBody)
    setEditorVisible(false)
    setTimeout(() => setEditorVisible(true), 1)
  }, [currentFile, setCurrentTitle])

  useEffect(() => {
    setCurrentTitle(currentFile.title)
  }, [currentFile.title, setCurrentTitle])

  return (
    <div className={`p-5 ${isSidebarVisible ? 'max-w-[calc(100vw-200px)]' : 'max-w-full'}`}>
      <TitleField
        value={currentTitle || ''}
        onChange={handleTitleChange}
        editorRef={titleEditor}
        onKeyDown={handleTitleKeyDown}
      />
      {editorVisible && (
        <BodyField
          value={currentBody}
          editorRef={editor}
          onChange={handleUpdate}
          onKeyDownCapture={handleBodyKeyDownCapture}
        />
      )}
    </div>
  )
}
