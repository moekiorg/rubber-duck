import { CompletionContext, CompletionResult } from '@codemirror/autocomplete'

export function internalLinkCompletion(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/\[\[[\p{L}\p{N}\p{M}\p{Pc}\p{Pd}]*$/u)
  if (!word) return null
  if (word.from == word.to && !context.explicit) return null
  return {
    from: word.from + 2,
    options: window.rubberDuck.files.map((file) => {
      return {
        label: file.title,
        type: 'text',
        apply: file.title
      }
    }),
    validFor: /^\[\[[^\]]*$/
  }
}
