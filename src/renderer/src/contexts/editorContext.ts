import { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { createContext } from 'react'

interface ContextType {
  ref: React.RefObject<ReactCodeMirrorRef> | null
  isVisible: boolean
  setIsVisible: (value: boolean) => void
}

export const EditorContext = createContext<ContextType>({
  ref: null,
  isVisible: true,
  setIsVisible: () => {}
})
