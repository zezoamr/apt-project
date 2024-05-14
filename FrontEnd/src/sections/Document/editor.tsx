import Quill from 'quill';
import React, { useRef, useEffect } from 'react';

const QuillEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      // eslint-disable-next-line no-new
      new Quill(editorRef.current, {
        modules: {
          toolbar: [['bold', 'italic']],
        },
        placeholder: 'Compose an epic...',
        theme: 'snow', // or 'bubble'
      });
    }
  }, []);

  return <div ref={editorRef} />;
};

export default QuillEditor;
