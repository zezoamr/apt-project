import Container from '@mui/material/Container';
import { Button, Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import DocumentsView from '../DocumentView';

// ----------------------------------------------------------------------

export default function DocumentView() {
  const settings = useSettingsContext();
  const dialog = useBoolean();

  return (
    <>
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
      <Dialog fullWidth maxWidth="xs" open={dialog.value} onClose={dialog.onFalse}>
        <DialogTitle sx={{ pb: 2 }}>test</DialogTitle>
        <DialogContent sx={{ typography: 'body2' }}> gg </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={dialog.onFalse}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
