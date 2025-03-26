import { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { createContext } from 'react'

export const EditorContext = createContext<React.RefObject<ReactCodeMirrorRef> | null>(null)
