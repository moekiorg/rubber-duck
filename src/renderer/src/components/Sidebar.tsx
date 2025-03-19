import { NavLink } from 'react-router'
import { File } from './Page'
import { MaterialSymbol } from 'react-material-symbols'
import { MouseEvent } from 'react'

interface Props {
  files: Array<File>
  currentFile: File | null
  onCreate: () => void
  isSearchVisible: boolean
  onChange: (value: string) => void
  filteredFiles: Array<File>
  query: string
  isVisible: boolean
}

export default function Sidebar({
  files,
  currentFile,
  onCreate,
  isSearchVisible,
  onChange,
  filteredFiles,
  query,
  isVisible
}: Props): JSX.Element {
  const handleContextMenu = (
    e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>,
    fileTitle: string
  ): void => {
    e.preventDefault()
    window.electron.ipcRenderer.send('show-context-menu', fileTitle)
  }

  if (!isVisible) {
    return <></>
  }

  return (
    <aside className="bg-gray-100 border-r border-[rgb(218,218,218)] max-w-[200px] w-[200px] min-w-[200px]">
      {isSearchVisible && (
        <div className="p-3 pb-0">
          <input
            value={query || ''}
            type="text"
            autoFocus
            onChange={(e) => onChange(e.target.value)}
            className="bg-white border border-gray-300 p-1 rounded w-full"
          />
        </div>
      )}
      <div className="p-2 overflow-y-scroll h-[calc(100vh-80px)]">
        {(query ? filteredFiles : files).map((file, i) => (
          <NavLink
            key={i}
            to={`/notes/${file.title}`}
            state={{ id: file.title }}
            replace
            className={`file-item w-full text-left block cursor-default truncate p-2 rounded ${file.title == currentFile?.title ? 'bg-gray-200' : ''}`}
            onContextMenu={(e) => handleContextMenu(e, file.title)}
          >
            {file.title}
          </NavLink>
        ))}
      </div>
      <div className="sticky bottom-0 left-0 w-full h-[50px] p-2 text-left z-10 bg-gray-100">
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
