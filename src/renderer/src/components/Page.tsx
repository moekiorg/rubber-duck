import { useCallback, useEffect, useState } from 'react'
import 'react-material-symbols/rounded'
import { useLocation, useNavigate } from 'react-router'
import Sidebar from './Sidebar'
import Header from './Header'
import Fuse from 'fuse.js'
import Editor from './Editor'

export interface File {
  title: string
}

export default function Page(): JSX.Element {
  const location = useLocation()
  const [files, setFiles] = useState<Array<File>>([])
  const [allFiles, setAllFiles] = useState<Array<File>>([])
  const [currentTitle, setCurrentTitle] = useState('')
  const navigate = useNavigate()
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [filteredFiles, setFilteredFiles] = useState<Array<File>>([])
  const [query, setQuery] = useState('')
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)

  useEffect(() => {
    window.api.getSidebarState().then((value) => {
      setIsSidebarVisible(value)
    })
    window.electron.ipcRenderer.on('toggle-sidebar', async () => {
      const value = await window.api.getSidebarState()
      setIsSidebarVisible(value)
    })
  }, [])

  useEffect(() => {
    if (isSearchVisible) {
      setIsSidebarVisible(true)
    }
  }, [isSearchVisible, setIsSidebarVisible, isSidebarVisible])

  useEffect(() => {
    setCurrentFile(
      location.state ? allFiles.find((f) => f.title === location.state.id) || null : null
    )
  }, [location.state, allFiles])

  const init = useCallback(async (): Promise<void> => {
    window.api
      .getFiles()
      .then(async (fs) => {
        const files = fs.map((f) => ({ title: f }))
        setFiles(files)
        setAllFiles(files)
      })
      .catch(() => {
        navigate('/setup', { replace: true })
      })
  }, [navigate])

  useEffect(() => {
    window.electron.ipcRenderer.on('delete-file', async (_, fileTitle) => {
      const result = await window.api.deleteFile(fileTitle)
      if (result) {
        setFiles((prevFiles) => prevFiles.filter((file) => file.title !== fileTitle))
        setAllFiles((prevFiles) => prevFiles.filter((file) => file.title !== fileTitle))
      }
    })

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('delete-file')
    }
  }, [])

  const handleQueryChange = (q): void => {
    setQuery(q)
    if (q === '') {
      setFilteredFiles(allFiles)
      return
    }
    const fuse = new Fuse(allFiles, { keys: ['title'] })
    setFilteredFiles(fuse.search(q).map((res) => res.item))
  }

  const handleCreate = useCallback(async (): Promise<void> => {
    const title = await window.api.createFile()
    setFiles([{ title }, ...files])
    setAllFiles([{ title }, ...files])
    await navigate(`/notes/${title}`, { replace: true, state: { id: title } })
  }, [files, navigate])

  const toggleSearchSection = useCallback((): void => {
    setIsSearchVisible(!isSearchVisible)

    if (isSearchVisible) {
      setQuery('')
    }
  }, [isSearchVisible])

  useEffect(() => {
    init()

    window.electron.ipcRenderer.on('open-directory', init)

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('open-dir')
    }
  }, [init])

  useEffect(() => {
    window.electron.ipcRenderer.on('search', toggleSearchSection)

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('search')
    }
  }, [toggleSearchSection])

  useEffect(() => {
    window.electron.ipcRenderer.on('new', handleCreate)

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('new')
    }
  }, [handleCreate])

  const handleTitleChange = (title): void => {
    const f = files.map((f) => (f.title === currentTitle ? { ...f, title } : f))
    setFiles(f)
  }

  return (
    <>
      <Header title={currentTitle || ''} />
      <div className="text-xs pt-0 flex grow">
        <Sidebar
          files={files}
          isVisible={isSidebarVisible}
          filteredFiles={filteredFiles}
          currentFile={currentFile || null}
          onCreate={handleCreate}
          isSearchVisible={isSearchVisible}
          onChange={handleQueryChange}
          query={query}
        />
        <main className="w-full h-[calc(100vh-30px)] overflow-y-scroll">
          {currentFile ? (
            <Editor
              isSidebarVisible={isSidebarVisible}
              currentTitle={currentTitle}
              setCurrentTitle={setCurrentTitle}
              currentFile={currentFile}
              files={allFiles}
              onTitleChange={handleTitleChange}
            />
          ) : (
            <div className={`w-full h-full grow bg-gray-50`}></div>
          )}
        </main>
      </div>
    </>
  )
}
