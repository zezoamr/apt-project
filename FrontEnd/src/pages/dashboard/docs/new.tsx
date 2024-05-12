import { Helmet } from 'react-helmet-async';

import DocumentNewView from 'src/sections/Document/view/new-view';

// ----------------------------------------------------------------------

export default function DocumentNewPage() {
  return (
    <>
      <Helmet>
        <title> New Document</title>
      </Helmet>
      <DocumentNewView />
    </>
  );
}
