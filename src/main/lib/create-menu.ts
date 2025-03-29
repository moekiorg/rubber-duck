import { Menu, shell } from 'electron'
import { intl } from './intl'
import { join } from 'path'
import { store } from './store'

export const createMenu = (event, id, title): Electron.Menu => {
  return Menu.buildFromTemplate([
    {
      label: intl.formatMessage({ id: 'openInDefaultApp' }),
      click: (): void => {
        const dirPath = store.get('path') as string
        shell.openPath(join(dirPath, `${title}.md`))
      }
    },
    {
      label: intl.formatMessage({ id: 'revealInFinder' }),
      click: (): void => {
        const dirPath = store.get('path') as string
        shell.showItemInFolder(join(dirPath, `${title}.md`))
      }
    },
    {
      type: 'separator'
    },
    {
      label: intl.formatMessage({ id: 'delete' }),
      click: (): void => {
        event.sender.send('delete-file', id)
      }
    }
  ])
}
