import { markdownLanguage } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

let specs = [
  { tag: tags.meta, color: '#404740' },
  { tag: tags.link, textDecoration: 'underline' },
  { tag: tags.heading, textDecoration: 'underline', fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.keyword, color: '#708' },
  {
    tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
    color: '#219'
  },
  { tag: [tags.literal, tags.inserted], color: '#164' },
  { tag: [tags.string, tags.deleted], color: '#a11' },
  { tag: [tags.regexp, tags.escape, tags.special(tags.string)], color: '#e40' },
  { tag: tags.definition(tags.variableName), color: '#00f' },
  { tag: tags.local(tags.variableName), color: '#30a' },
  { tag: [tags.typeName, tags.namespace], color: '#085' },
  { tag: tags.className, color: '#167' },
  { tag: [tags.special(tags.variableName), tags.macroName], color: '#256' },
  { tag: tags.definition(tags.propertyName), color: '#00c' },
  { tag: tags.comment, color: '#940' },
  { tag: tags.invalid, color: '#f00' }
]

if (window.textZen?.editorStyles) {
  specs = window.textZen.editorStyles
}

export const highlights = [
  syntaxHighlighting(
    HighlightStyle.define(specs, {
      scope: markdownLanguage,
      all: { fontFamily: 'sans-serif !important' }
    })
  ),
  syntaxHighlighting(
    HighlightStyle.define(specs, {
      all: { fontFamily: 'monospace' }
    })
  )
]
