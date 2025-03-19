import { useEffect } from 'react'
import Header from './Header'
import { useNavigate } from 'react-router'

export default function Setup(): JSX.Element {
  const navigate = useNavigate()

  useEffect(() => {
    window.electron.ipcRenderer.on('open-directory', () => navigate('/'))
  })

  return (
    <>
      <Header title="" />
      <div className="p-20 flex text-xs items-center justify-center h-[calc(100vh-30px)]">
        <div className="flex gap-2 items-center text-gray-500 ">
          <button
            type="button"
            onClick={async () => {
              await window.api.openFile()
              navigate('/')
            }}
            className="hover:bg-gray-50 rounded py-1 px-2"
          >
            Open
          </button>
          <div className="flex gap-1 items-center">
            <div className="border border-gray-300 bg-gray-50 w-6 flex items-center h-6 shadow rounded p-2 justify-center">
              ⌘
            </div>
            <div className="border border-gray-300 bg-gray-50 w-6 flex items-center h-6 shadow rounded p-2 justify-center">
              O
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
