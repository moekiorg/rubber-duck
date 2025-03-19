import { HashRouter, Route, Routes } from 'react-router'
import Setup from './components/Setup'
import Page from './components/Page'

export default function App(): JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Page />} />
        <Route path="/notes/:id" element={<Page />} />
        <Route path="/setup" element={<Setup />} />
      </Routes>
    </HashRouter>
  )
}
