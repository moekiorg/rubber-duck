import { NavLink } from 'react-router'
import { File } from './Page'
import { MouseEvent, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { FixedSizeList } from 'react-window'
import { EditorContext } from '@renderer/contexts/editorContext'
import { useIntl } from 'react-intl'
import interact from 'interactjs'
import scrollIntoView from 'scroll-into-view-if-needed'

interface Props {
  files: Array<File>
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
        state={{ title, force: true }}
        replace
        id={title}
        data-id={id}
        data-next={nextId}
        data-previous={previousId}
        className={`file-item ${isActive || isSelected ? 'bg-[rgba(0,0,0,0.05)]' : ''}`}
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
  const intl = useIntl()
  const [width, setWidth] = useState(300)

  useEffect(() => {
    window.api.getConfig('sidebar.width').then((value) => {
      setWidth(Number(value))
    })
    window.electron.ipcRenderer.on('toggle-sidebar', async () => {
      const value = await window.api.getConfig('sidebar.width')
      setWidth(Number(value))
    })
  }, [])

  const updateSelection = useCallback(
    (e): void => {
      if (e.target.closest('input')) {
        return
      }
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
        const currentEl = document.querySelector<HTMLElement>(`[data-id="${selectedFileId}"]`)
        const id = currentEl?.dataset.next
        setSelectedFileId(
          currentEl?.parentElement?.nextElementSibling ? id || null : selectedFileId
        )
        const el = document.querySelector<HTMLElement>(`[data-id="${id}"]`)!
        try {
          scrollIntoView(el, { behavior: 'smooth', scrollMode: 'if-needed' })
        } catch (e) {
          console.warn(e)
        }
        e.preventDefault()
        if (editorRef?.current?.view?.hasFocus) {
          setIsEditorVisible(false)
          setTimeout(() => setIsEditorVisible(true), 1)
        }
      }
      if (e.key === 'ArrowUp') {
        const currentEl = document.querySelector<HTMLElement>(`[data-id="${selectedFileId}"]`)
        const id = currentEl?.dataset.previous
        setSelectedFileId(
          currentEl?.parentElement?.previousElementSibling ? id || null : selectedFileId
        )
        if (!currentEl?.parentElement?.previousElementSibling) {
          searchField.current?.focus()
        }
        const el = document.querySelector<HTMLElement>(`[data-id="${id}"]`)!
        try {
          scrollIntoView(el, { behavior: 'smooth', scrollMode: 'if-needed' })
        } catch (e) {
          console.warn(e)
        }
        e.preventDefault()
        if (editorRef?.current?.view?.hasFocus) {
          setIsEditorVisible(false)
          setTimeout(() => setIsEditorVisible(true), 1)
        }
      }
      if (e.metaKey && e.key === '1') {
        setIsFocused(false)
      }
      if (e.key === ' ') {
        e.preventDefault()
        document.querySelector<HTMLElement>(`[data-id="${selectedFileId}"]`)?.click()
      }
    },
    [currentId, editorRef, isFocused, selectedFileId, setIsEditorVisible]
  )

  useEffect(() => {
    setTimeout(() => {
      setListHeight(
        listRef.current?.getBoundingClientRect().height
          ? listRef.current?.getBoundingClientRect().height - (isSearchVisible ? 80 : 20)
          : 0
      )
    }, 5)

    const handleResize = (): void => {
      setListHeight(listRef.current!.getBoundingClientRect().height - (isSearchVisible ? 80 : 20))
    }

    window.addEventListener('resize', handleResize)

    const updateFocus = (e): void => {
      if (e.target.dataset.id) {
        return
      }
      setIsFocused(false)
    }

    window.addEventListener('click', updateFocus)
    window.addEventListener('keydown', updateSelection)

    return (): void => {
      window.removeEventListener('click', updateFocus)
      window.removeEventListener('keydown', updateSelection)
      window.removeEventListener('resize', handleResize)
    }
  }, [
    currentId,
    editorRef,
    isFocused,
    isSearchVisible,
    selectedFileId,
    setIsEditorVisible,
    updateSelection
  ])

  useEffect(() => {
    interact('aside').resizable({
      edges: { left: false, right: true, bottom: false, top: false },
      modifiers: [
        interact.modifiers.restrictSize({
          min: { width: 100, height: 500 },
          max: { width: 500, height: 500 }
        })
      ],
      listeners: {
        move(event) {
          requestAnimationFrame(() => {
            const target = event.target
            const newWidth = event.rect.width * 1.3
            target.style.width = newWidth + 'px'
            setWidth(newWidth)
            window.api.setConfig('sidebar.width', newWidth)
          })
        }
      }
    })
  }, [])

  useEffect(() => {
    listRef.current?.children[0].addEventListener('scroll', (e) => {
      const header = document.querySelector('.sidebar-header')
      if ((e.target as HTMLElement)?.scrollTop > 0) {
        header?.classList?.add('shadow-sm')
      } else {
        header?.classList?.remove('shadow-sm')
      }
    })
  }, [listRef])

  if (!isVisible) {
    return <></>
  }

  return (
    <aside style={{ width: `${width}px` }}>
      <div className="sidebar-header"></div>
      {isSearchVisible && (
        <div className="search-bar-container">
          <input
            value={query || ''}
            type="text"
            ref={searchField}
            placeholder={intl.formatMessage({ id: 'search' })}
            autoFocus
            onChange={(e) => onChange(e.target.value)}
            className="search-field"
            onKeyDown={(e) => {
              if (isFocused) {
                return
              }
              if (e.key === 'ArrowDown') {
                const firstItem = listRef.current!.children[0]!.children[0].children[0]!
                  .children[0]! as HTMLDivElement
                setSelectedFileId(firstItem.dataset.id as string)
                setIsFocused(true)
                ;(e.target as HTMLInputElement).blur()
                e.preventDefault()
              }
            }}
            onFocusCapture={() => {
              setIsFocused(false)
            }}
          />
        </div>
      )}
      <div ref={listRef} className="file-list">
        <FixedSizeList
          height={listHeight}
          width="100%"
          itemCount={query ? filteredFiles.length : files.length}
          itemSize={24}
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
    </aside>
  )
}
