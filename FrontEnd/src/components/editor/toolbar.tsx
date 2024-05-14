import { StyledEditorToolbar } from './styles';

// ----------------------------------------------------------------------

export const formats = [
  'align',
  'background',
  'blockquote',
  'bold',
  'bullet',
  'code',
  'code-block',
  'color',
  'direction',
  'font',
  'formula',
  'header',
  'image',
  'indent',
  'italic',
  'link',
  'list',
  'script',
  'size',
  'strike',
  'table',
  'underline',
  'video',
];

type EditorToolbarProps = {
  id: string;
  simple?: boolean;
};

export default function Toolbar({ id, simple, ...other }: EditorToolbarProps) {
  return (
    <StyledEditorToolbar {...other}>
      <div id={id}>
        <div className="ql-formats">
          <button type="button" className="ql-bold" />
          <button type="button" className="ql-italic" />
        </div>
      </div>
    </StyledEditorToolbar>
  );
}
