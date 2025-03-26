import { HashRouter, Route, Routes } from 'react-router'
import Setup from './components/Setup'
import Page from './components/Page'
import { EditorContext } from './contexts/editorContext'
import { useRef } from 'react'

export default function App(): JSX.Element {
  const editorRef = useRef(null)

  return (
    <EditorContext.Provider value={editorRef}>
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
