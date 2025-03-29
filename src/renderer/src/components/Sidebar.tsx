import { NavLink } from 'react-router'
import { File } from './Page'
import { MouseEvent, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { FixedSizeList } from 'react-window'
import { EditorContext } from '@renderer/contexts/editorContext'
import { useIntl } from 'react-intl'
import interact from 'interactjs'
import scrollIntoView from 'scroll-into-view-if-needed'
import { FocusContext } from '@renderer/contexts/FocusContext'
import { useHotKey } from '@renderer/hooks/useHotKey'
import { FileListContext } from '@renderer/contexts/FIleListContext'

interface Props {
  files: Array<File>
  onChange: (value: string) => void
  filteredFiles: Array<File>
  query: string
  isVisible: boolean
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
        className={`fs-i ${isActive || isSelected ? 'fs-i--active' : ''}`}
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
  onChange,
  filteredFiles,
  query,
  isVisible
}: Props): JSX.Element {
  const [listHeight, setListHeight] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const searchField = useRef<HTMLInputElement>(null)
  const { current: currentListItem, setCurrent: setCurrentListItem } = useContext(FileListContext)
  const { focus, setFocus, isFileSearchVisible } = useContext(FocusContext)
  const { bodyEditor, setIsVisible: setIsEditorVisible, current } = useContext(EditorContext)
  const intl = useIntl()
  const [width, setWidth] = useState(300)
  useHotKey()

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'n' && e.metaKey) {
        setFocus('editor')
      }
    })
  })

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
      if (focus !== 'fileList') {
        return
      }
      if (e.key === 'ArrowDown') {
        const currentEl = document.querySelector<HTMLElement>(`[data-id="${currentListItem}"]`)
        const id = currentEl?.dataset.next
        setCurrentListItem(
          currentEl?.parentElement?.nextElementSibling ? id || null : currentListItem
        )
        const el = document.querySelector<HTMLElement>(`[data-id="${id}"]`)!
        try {
          scrollIntoView(el, { behavior: 'smooth', scrollMode: 'if-needed' })
        } catch (e) {
          console.warn(e)
        }
        e.preventDefault()
        if (bodyEditor?.current?.view?.hasFocus) {
          setIsEditorVisible(false)
          setTimeout(() => setIsEditorVisible(true), 1)
        }
      }
      if (e.key === 'ArrowUp') {
        const currentEl = document.querySelector<HTMLElement>(`[data-id="${currentListItem}"]`)
        const id = currentEl?.dataset.previous
        setCurrentListItem(
          currentEl?.parentElement?.previousElementSibling ? id || null : currentListItem
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
        if (bodyEditor?.current?.view?.hasFocus) {
          setIsEditorVisible(false)
          setTimeout(() => setIsEditorVisible(true), 1)
        }
      }
      if (e.metaKey && e.key === '1') {
        setFocus('editor')
      }
      if (e.key === ' ') {
        e.preventDefault()
        document.querySelector<HTMLElement>(`[data-id="${currentListItem}"]`)?.click()
      }
    },
    [currentListItem, bodyEditor, focus, setCurrentListItem, setFocus, setIsEditorVisible]
  )

  useEffect(() => {
    setTimeout(() => {
      setListHeight(
        listRef.current?.getBoundingClientRect().height
          ? listRef.current?.getBoundingClientRect().height - (isFileSearchVisible ? 80 : 20)
          : 0
      )
    }, 5)

    const handleResize = (): void => {
      setListHeight(
        listRef.current!.getBoundingClientRect().height - (isFileSearchVisible ? 80 : 20)
      )
    }

    window.addEventListener('resize', handleResize)

    window.addEventListener('keydown', updateSelection)

    return (): void => {
      window.removeEventListener('keydown', updateSelection)
      window.removeEventListener('resize', handleResize)
    }
  }, [bodyEditor, isFileSearchVisible, setFocus, setIsEditorVisible, updateSelection])

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
      const header = document.querySelector('.s-h')
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
      <div className="s-h"></div>
      {isFileSearchVisible && (
        <div className="fs-c">
          <input
            value={query || ''}
            type="text"
            ref={searchField}
            placeholder={intl.formatMessage({ id: 'search' })}
            autoFocus
            onChange={(e) => onChange(e.target.value)}
            className="fs-f"
            onKeyDown={(e) => {
              if (focus !== 'fileList') {
                return
              }
              if (e.key === 'ArrowDown') {
                const firstItem = listRef.current!.children[0]!.children[0].children[0]!
                  .children[0]! as HTMLDivElement
                setCurrentListItem(firstItem.dataset.id as string)
                setFocus('fileList')
                ;(e.target as HTMLInputElement).blur()
                e.preventDefault()
              }
            }}
            onFocusCapture={() => {
              setFocus('fileSearch')
            }}
          />
        </div>
      )}
      <div ref={listRef} className="fl">
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
              isActive: file.id === current,
              isSelected: file.id === currentListItem,
              id: file.id,
              previousId: (query ? filteredFiles[index - 1]?.id : files[index - 1]?.id) || null,
              nextId: (query ? filteredFiles[index + 1]?.id : files[index + 1]?.id) || null,
              onClick: () => {
                setCurrentListItem(file.id)
                setFocus('fileList')
              }
            })
          }}
        </FixedSizeList>
      </div>
    </aside>
  )
}
