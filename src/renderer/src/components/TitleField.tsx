import { KeyboardEventHandler } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

interface Props {
  value: string
  onChange: (value: string) => void
  editorRef: React.RefObject<HTMLTextAreaElement>
  onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> | undefined
}

export default function TitleField({ value, editorRef, onChange, onKeyDown }: Props): JSX.Element {
  return (
    <TextareaAutosize
      value={value}
      className="outline-none text-lg p-2 resize-none w-full"
      ref={editorRef}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      title="Title"
    />
  )
}
