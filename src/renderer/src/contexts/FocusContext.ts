import { createContext, Dispatch, SetStateAction } from 'react'

export type FocusTarget = 'fileList' | 'editor' | 'fullTextSearch' | 'fileSearch'

interface ContextType {
  focus: FocusTarget
  setFocus: Dispatch<SetStateAction<FocusTarget>>
  isFileSearchVisible: boolean
  toggleFileSearchVisible: () => void
}

export const FocusContext = createContext<ContextType>({
  focus: 'fileList',
  setFocus: () => {},
  isFileSearchVisible: false,
  toggleFileSearchVisible: () => {}
})
