import { Decoration, DecorationSet, EditorView, ViewPlugin, WidgetType } from '@codemirror/view'
import { Range } from '@uiw/react-codemirror'

class ImageWidget extends WidgetType {
  constructor(private src: string) {
    super()
  }

  toDOM(): HTMLImageElement {
    const img = document.createElement('img')
    img.src = this.src
    return img
  }
}

export const markdownImagePlugin = ViewPlugin.fromClass(
  class {
    decorations

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view)
    }

    update(update): void {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view)
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
      const widgets: Array<Range<Decoration>> = []
      const regex = /!\[.*?\]\((.*?)\)/g

      for (const { from, to } of view.visibleRanges) {
        const text = view.state.sliceDoc(from, to)
        let match: RegExpExecArray | null
        while ((match = regex.exec(text))) {
          const url = match[1]
          const start = from + match.index
          widgets.push(
            Decoration.widget({
              widget: new ImageWidget(url),
              side: 1
            }).range(start)
          )
        }
      }

      return Decoration.set(widgets)
    }
  },
  {
    decorations: (v) => v.decorations
  }
)
