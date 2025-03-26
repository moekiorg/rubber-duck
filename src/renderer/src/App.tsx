import { HashRouter, Route, Routes } from 'react-router'
import Setup from './components/Setup'
import Page from './components/Page'
import { EditorContext } from './contexts/editorContext'
import { useRef, useState } from 'react'

export default function App(): JSX.Element {
  const editorRef = useRef(null)
  const [isEditorVisible, setIsEditorVisible] = useState(true)

  return (
    <EditorContext.Provider
      value={{
        ref: editorRef,
        isVisible: isEditorVisible,
        setIsVisible: setIsEditorVisible
      }}
    >
      <HashRouter>
        <Routes>
          <Route path="/" element={<Page />} />
          <Route path="/notes/:id" element={<Page />} />
          <Route path="/setup" element={<Setup />} />
        </Routes>
      </HashRouter>
    </EditorContext.Provider>
  )
}
