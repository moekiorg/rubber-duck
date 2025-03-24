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
    window.electron.ipcRenderer.send('show-context-menu', id)
  }

  return (
    <div style={style} className="px-2">
      <NavLink
        key={title}
        to={`/notes/${title}`}
        state={{ title }}
        replace
        className={`file-item h-full w-full text-left block cursor-default rounded truncate p-2 ${isActive ? 'bg-gray-200' : ''}`}
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
  const [isTransitionVisible, setIsTransitionVisible] = useState(true)

  useEffect(() => {
    setTimeout(() => setListHeight(listRef.current?.getBoundingClientRect().height || 0), 5)

    window.addEventListener('resize', () => {
      setListHeight(listRef.current!.getBoundingClientRect().height)
    })

    setTimeout(() => {
      listRef.current?.children[0]?.addEventListener('scroll', (e) => {
        const el = e.target as HTMLElement
        if (
          (el.children[0].clientHeight - (el.scrollTop + el.clientHeight)) /
            el.children[0].clientHeight <
          0.1
        ) {
          setIsTransitionVisible(false)
        } else {
          setIsTransitionVisible(true)
        }
      })
    }, 10)
  }, [])

  if (!isVisible) {
    return <></>
  }

  return (
    <aside className="bg-gray-100 border-r border-[rgb(218,218,218)] max-w-[200px] w-[200px] min-w-[200px]">
      {isSearchVisible && (
        <div className="p-3 pb-0">
          <div className="bg-white border gap-1 border-gray-300 rounded-lg p-1 flex items-center">
            <MaterialSymbol icon="search" size={20} className="text-gray-600" />
            <input
              value={query || ''}
              type="text"
              ref={searchField}
              placeholder="Search"
              autoFocus
              onChange={(e) => onChange(e.target.value)}
              className="outline-none placeholder:text-gray-300"
            />
          </div>
        </div>
      )}
      <div
        ref={listRef}
        className={`h-[calc(100vh-90px)] relative pt-2 pb-[70px] ${isTransitionVisible ? 'after:block' : 'after:hidden'} after:bg-gradient-to-t after:from-gray-100 after:content-[''] after:h-[30px] after:w-full after:absolute after:-bottom-[8px] after:left-0`}
      >
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
      <div className="fixed bottom-0 left-0 w-[200px] border-r border-[rgb(218,218,218)] h-[50px] p-2 text-left z-10 bg-gray-100">
        <button
          type="button"
          className="rounded p-1 hover:bg-gray-200 flex items-center transition-all"
          onClick={onCreate}
          title="Add"
        >
          <MaterialSymbol icon="add" size={20} />
        </button>
      </div>
    </aside>
  )
}
