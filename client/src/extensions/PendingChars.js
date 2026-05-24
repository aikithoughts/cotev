import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DecorationSet, Decoration } from '@tiptap/pm/view';

export const pendingKey = new PluginKey('pendingChars');

export const PendingChars = Extension.create({
  name: 'pendingChars',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: pendingKey,
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

            const meta = tr.getMeta(pendingKey);
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
            return pendingKey.getState(state).decorations;
          },
        },
      }),
    ];
  },
});
