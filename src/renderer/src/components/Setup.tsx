import { useEffect } from 'react'
import Header from './Header'
import { useNavigate } from 'react-router'
import { FormattedMessage } from 'react-intl'

export default function Setup(): JSX.Element {
  const navigate = useNavigate()

  useEffect(() => {
    window.electron.ipcRenderer.on('open-directory', () => navigate('/'))
  })

  return (
    <>
      <Header title="" />
      <div className="setup-container">
        <div className="setup">
          <button
            type="button"
            onClick={async () => {
              await window.api.openFile()
              navigate('/')
            }}
            className="open-file-button"
          >
            <FormattedMessage id="openFolder" />
          </button>
          <div className="open-file-shortcut">
            <div className="keyboard">⌘</div>
            <div className="keyboard">O</div>
          </div>
        </div>
      </div>
    </>
  )
}
