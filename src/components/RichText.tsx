import React from 'react';

/** Teks ringan dari template: **tebal** dan `kode`. Dipakai dashboard dan PDF agar satu sumber teks. */
export const RichText: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : part.startsWith('`') && part.endsWith('`') && part.length > 2 ? (
        <code key={i}>{part.slice(1, -1)}</code>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    )}
  </>
);
