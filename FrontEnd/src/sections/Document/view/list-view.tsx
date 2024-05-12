import { Button } from '@mui/material';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import DocumentsView from '../DocumentView';

// ----------------------------------------------------------------------

export default function DocumentView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Your Document"
        links={[{ name: 'Docs' }, { name: 'List' }]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.new}
            color="primary"
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Create Document
          </Button>
        }
      />
      <DocumentsView />
    </Container>
  );
}
