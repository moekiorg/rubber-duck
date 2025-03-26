import { NavLink } from 'react-router'
import { File } from './Page'
import { MaterialSymbol } from 'react-material-symbols'
import { MouseEvent, useContext, useEffect, useRef, useState } from 'react'
import { FixedSizeList } from 'react-window'
import { EditorContext } from '@renderer/contexts/editorContext'

interface Props {
  files: Array<File>
  onCreate: () => void
  isSearchVisible: boolean
  onChange: (value: string) => void
  filteredFiles: Array<File>
  query: string
  isVisible: boolean
  currentFile: File | null
  currentId: string | null
}

const FileItem = ({
  title,
  isActive,
  isSelected,
  style,
  id,
  nextId,
  previousId,
  onClick
}: {
  title: string
  isActive: boolean
  style: React.CSSProperties | undefined
  isSelected: boolean
  id: string
  nextId: string | null
  previousId: string | null
  onClick: () => void
}): JSX.Element => {
  const handleContextMenu = (
    e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>,
    id: string
  ): void => {
    e.preventDefault()
    window.electron.ipcRenderer.send('show-context-menu', id, title)
  }

  return (
    <div style={style} className="px-2">
      <NavLink
        key={title}
        to={`/notes/${title}`}
        state={{ title }}
        replace
        id={title}
        data-id={id}
        data-next={nextId}
        data-previous={previousId}
        className={`file-item ${isActive || isSelected ? 'bg-gray-200' : ''}`}
        onContextMenu={(e) => handleContextMenu(e, id)}
        onClick={onClick}
      >
        {title}
      </NavLink>
    </div>
  )
}

export default function Sidebar({
  files,
  onCreate,
  isSearchVisible,
  onChange,
  filteredFiles,
  query,
  currentId,
  isVisible
}: Props): JSX.Element {
  const [listHeight, setListHeight] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const searchField = useRef<HTMLInputElement>(null)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const { ref: editorRef, setIsVisible: setIsEditorVisible } = useContext(EditorContext)

  useEffect(() => {
    setTimeout(() => setListHeight(listRef.current?.getBoundingClientRect().height || 0), 5)

    const handleResize = (): void => {
      setListHeight(listRef.current!.getBoundingClientRect().height)
    }

    window.addEventListener('resize', handleResize)

    const updateFocus = (e): void => {
      if (e.target.dataset.id) {
        return
      }
      setIsFocused(false)
    }

    const updateSelection = (e): void => {
      if (e.metaKey && e.key === '0') {
        setIsFocused(true)
        if (!selectedFileId) {
          setSelectedFileId(currentId)
        }
      }
      if (!isFocused) {
        return
      }
      if (e.key === 'ArrowDown') {
        setSelectedFileId(
          document.querySelector<HTMLElement>(`[data-id="${selectedFileId}"]`)?.dataset.next || null
        )
        if (editorRef?.current?.view?.hasFocus) {
          setIsEditorVisible(false)
          setTimeout(() => setIsEditorVisible(true), 1)
        }
      }
      if (e.key === 'ArrowUp') {
        setSelectedFileId(
          document.querySelector<HTMLElement>(`[data-id="${selectedFileId}"]`)?.dataset.previous ||
            null
        )
        if (editorRef?.current?.view?.hasFocus) {
          setIsEditorVisible(false)
          setTimeout(() => setIsEditorVisible(true), 1)
        }
      }
      if (e.metaKey && e.key === '1') {
        setIsFocused(false)
      }
      if (e.key === ' ') {
        document.querySelector<HTMLElement>(`[data-id="${selectedFileId}"]`)?.click()
      }
    }

    window.addEventListener('click', updateFocus)
    window.addEventListener('keydown', updateSelection)

    return (): void => {
      window.removeEventListener('click', updateFocus)
      window.removeEventListener('keydown', updateSelection)
      window.removeEventListener('resize', handleResize)
    }
  }, [currentId, editorRef, isFocused, selectedFileId])

  if (!isVisible) {
    return <></>
  }

  return (
    <aside>
      {isSearchVisible && (
        <div className="search-bar-container">
          <div className="search-bar">
            <MaterialSymbol icon="search" size={20} className="search-icon" />
            <input
              value={query || ''}
              type="text"
              ref={searchField}
              placeholder="Search"
              autoFocus
              onChange={(e) => onChange(e.target.value)}
              className="search-field"
            />
          </div>
        </div>
      )}
      <div ref={listRef} className="file-list">
        <FixedSizeList
          height={listHeight}
          itemCount={query ? filteredFiles.length : files.length}
          itemSize={32}
        >
          {({ style, index }) => {
            const file = query ? filteredFiles[index] : files[index]
            return FileItem({
              style,
              title: file?.title,
              isActive: file.id === currentId,
              isSelected: file.id === selectedFileId,
              id: file.id,
              previousId: (query ? filteredFiles[index - 1]?.id : files[index - 1]?.id) || null,
              nextId: (query ? filteredFiles[index + 1]?.id : files[index + 1]?.id) || null,
              onClick: () => {
                setSelectedFileId(file.id)
                setIsFocused(true)
              }
            })
          }}
        </FixedSizeList>
      </div>
      <div className="sidebar-footer">
        <button type="button" className="add-button" onClick={onCreate} title="Add">
          <MaterialSymbol icon="add" size={20} />
        </button>
      </div>
    </aside>
  )
}
