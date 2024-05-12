import { Helmet } from 'react-helmet-async';

import DocumentView from 'src/sections/Document/view/list-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> My Document</title>
      </Helmet>

      <DocumentView />
    </>
  );
}
