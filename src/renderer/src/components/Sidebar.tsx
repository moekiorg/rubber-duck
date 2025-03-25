import { NavLink } from 'react-router'
import { File } from './Page'
import { MaterialSymbol } from 'react-material-symbols'
import { MouseEvent, useEffect, useRef, useState } from 'react'
import { FixedSizeList } from 'react-window'

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
  style,
  id
}: {
  title: string
  isActive: boolean
  style: React.CSSProperties | undefined
  id: string
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
        className={`file-item ${isActive ? 'bg-gray-200' : ''}`}
        onContextMenu={(e) => handleContextMenu(e, id)}
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

  useEffect(() => {
    setTimeout(() => setListHeight(listRef.current?.getBoundingClientRect().height || 0), 5)

    window.addEventListener('resize', () => {
      setListHeight(listRef.current!.getBoundingClientRect().height)
    })
  }, [])

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
              id: file.id
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
