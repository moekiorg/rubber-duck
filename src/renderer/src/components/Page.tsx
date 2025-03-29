import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import Sidebar from './Sidebar'
import Header from './Header'
import Fuse from 'fuse.js'
import Editor from './Editor'
import { FormattedMessage } from 'react-intl'
import { Search } from './Search'
import { EditorContext } from '@renderer/contexts/editorContext'

export interface File {
  id: string
  title: string
  mtime: number
}

export default function Page(): JSX.Element {
  const location = useLocation()
  const [files, setFiles] = useState<Array<File>>([])
  const [allFiles, setAllFiles] = useState<Array<File>>([])
  const navigate = useNavigate()
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [currentTitle, setCurrentTitle] = useState<string | null>(null)
  const [filteredFiles, setFilteredFiles] = useState<Array<File>>([])
  const [query, setQuery] = useState('')
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const titleEditor = useRef<HTMLTextAreaElement>(null)
  const { ref: bodyEditor } = useContext(EditorContext)
  const [isSearchMode, setIsSearchMode] = useState(false)

  useEffect(() => {
    if (location.state?.line) {
      setTimeout(() => {
        const linePos = bodyEditor?.current?.view?.state.doc.line(location.state.line)
        if (linePos) {
          bodyEditor?.current?.view?.focus()
          bodyEditor?.current?.view?.dispatch({
            selection: { anchor: linePos.from, head: linePos.from },
            scrollIntoView: true
          })
        }
      }, 50)
    }
  }, [bodyEditor, location])

  useEffect(() => {
    window.electron.ipcRenderer.on('toggle-search-full-text', () => {
      setIsSearchMode(!isSearchMode)
      document.querySelector('article')!.scrollTo(0, 0)
    })
  }, [isSearchMode])

  useEffect(() => {
    window.api.getConfig('sidebar.visible').then((value) => {
      setIsSidebarVisible(Boolean(value))
    })
    window.electron.ipcRenderer.on('toggle-sidebar', async () => {
      const value = await window.api.getConfig('sidebar.visible')
      setIsSidebarVisible(Boolean(value))
    })
  }, [])

  useEffect(() => {
    if (isSearchVisible) {
      setIsSidebarVisible(true)
    }
  }, [isSearchVisible, setIsSidebarVisible, isSidebarVisible])

  const handleCreate = useCallback(
    async (t = null): Promise<void> => {
      let title: string | null = t
      let counter = 0
      if (!t) {
        do {
          title = counter === 0 ? 'Untitled' : `Untitled${counter}`
          counter++
        } while (files.map((f) => f.title).includes(title))
      }
      const result = await window.api.createFile(title)
      setFiles([result, ...files])
      setAllFiles([result, ...files])
      await navigate(`/notes/${result.title}`, {
        replace: true,
        state: { title: result.title }
      })
      setTimeout(() => titleEditor.current?.select(), 50)
    },
    [files, navigate]
  )

  useEffect(() => {
    const file = location.state
      ? allFiles.find((f) => {
          return f.title === location.state.title
        }) || null
      : null
    if (allFiles.length > 0 && !file && location.pathname.match('notes') && !isDeleted) {
      handleCreate(location.state.title)
      return
    }
    setCurrentId(file?.id || null)
    setCurrentFile(file)
    if (file?.id !== currentId) {
      setCurrentTitle(file?.title || null)
    }
  }, [location.state, allFiles, handleCreate, location.pathname, isDeleted, currentId])

  useEffect(() => {
    setIsDeleted(false)
  }, [location])

  const init = useCallback(async (): Promise<void> => {
    window.api
      .getFiles()
      .then(async (fs) => {
        setFiles(fs)
        setAllFiles(fs)
        window.textZen.files = fs
      })
      .catch(() => {
        navigate('/setup', { replace: true })
      })
  }, [navigate])

  useEffect(() => {
    window.electron.ipcRenderer.on('delete-file', async (_, id) => {
      const result = await window.api.deleteFile(id)
      if (result) {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id))
        setAllFiles((prevFiles) => prevFiles.filter((file) => file.id !== id))
        if (id === currentId) {
          setCurrentFile(null)
          setCurrentId(null)
          setIsDeleted(true)
          return
        }
      }
    })

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('delete-file')
    }
  }, [currentFile, currentId, navigate])

  useEffect(() => {
    window.electron.ipcRenderer.on('replace', async (_, title) => {
      navigate(`/notes/${title}`, {
        replace: true,
        state: { title }
      })
    })
  }, [location.state, navigate])

  const handleQueryChange = (q): void => {
    setQuery(q)
    if (q === '') {
      setFilteredFiles(allFiles)
      return
    }
    const fuse = new Fuse(allFiles, { keys: ['title'] })
    setFilteredFiles(fuse.search(q).map((res) => res.item))
  }

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
    window.electron.ipcRenderer.on('new', () => {
      handleCreate()
    })

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('new')
    }
  }, [files, handleCreate])

  const handleTitleChange = (title): void => {
    if (!currentFile) {
      return
    }
    const f = files.find((f) => f.id === currentFile.id)!
    setFiles([{ ...f, title }, ...files.filter((f) => f.id !== currentFile.id)])
  }

  const handleBodyChange = (): void => {
    if (!currentFile) {
      return
    }
    const f = files.find((f) => f.id === currentFile.id)!
    setFiles([f, ...files.filter((f) => f.id !== currentFile.id)])
  }

  useEffect(() => {
    if (location.state?.force) {
      setIsSearchMode(false)
    }
  }, [location])

  return (
    <>
      <main>
        <Sidebar
          files={files}
          isVisible={isSidebarVisible}
          filteredFiles={filteredFiles}
          isSearchVisible={isSearchVisible}
          onChange={handleQueryChange}
          currentFile={currentFile}
          currentId={currentId}
          query={query}
        />
        <article>
          <Header
            title={isSearchMode ? '' : currentTitle || ''}
            onCreate={() => handleCreate()}
            onToggleSearchMode={() => {
              setIsSearchMode(!isSearchMode)
            }}
          />
          <Search visible={isSearchMode} setIsSearchMode={setIsSearchMode}></Search>
          {!isSearchMode && (
            <>
              {currentFile ? (
                <Editor
                  currentFile={currentFile}
                  currentTitle={currentTitle || ''}
                  setCurrentTitle={setCurrentTitle}
                  files={allFiles}
                  onTitleChange={handleTitleChange}
                  onBodyChange={handleBodyChange}
                  titleEditor={titleEditor}
                />
              ) : (
                <div className="empty-page">
                  <div className="container">
                    <button
                      type="button"
                      onClick={() => handleCreate()}
                      className="new-file-button"
                    >
                      <FormattedMessage id="add" />
                    </button>
                    <div className="shortcut">
                      <div className="keyboard">⌘</div>
                      <div className="keyboard">N</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </article>
      </main>
    </>
  )
}
