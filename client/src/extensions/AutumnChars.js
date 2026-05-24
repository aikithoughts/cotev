import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DecorationSet, Decoration } from '@tiptap/pm/view';

export const autumnPendingKey = new PluginKey('autumnPending');

export const AutumnChars = Extension.create({
  name: 'autumnChars',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: autumnPendingKey,
        state: {
          init: () => ({ items: [], decorations: DecorationSet.empty }),
          apply(tr, prev) {
            // Remap each tracked position through the transaction.
            // If the character was deleted, from === to and gets filtered out.
            let items = prev.items
              .map(item => ({
                ...item,
                from: tr.mapping.map(item.from),
                to: tr.mapping.map(item.to),
              }))
              .filter(item => item.from < item.to);

            const meta = tr.getMeta(autumnPendingKey);
            if (meta?.add) items = [...items, meta.add];
            if (meta?.removeId != null) {
              items = items.filter(i => i.id !== meta.removeId);
            }

            const decorations = items.length
              ? DecorationSet.create(tr.doc, items.map(item =>
                  Decoration.inline(item.from, item.to, { class: 'char-pending' })
                ))
              : DecorationSet.empty;

            return { items, decorations };
          },
        },
        props: {
          decorations(state) {
            return autumnPendingKey.getState(state).decorations;
          },
        },
      }),
    ];
  },
});
