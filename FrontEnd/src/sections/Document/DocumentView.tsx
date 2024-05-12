import { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'mydocs',
    label: 'My Docs',
    icon: <Iconify icon="simple-icons:googledocs" width={24} />,
  },

  {
    value: 'shared',
    label: 'Shared Docs',
    icon: <Iconify icon="clarity:file-share-2-solid" width={24} />,
  },
];

// ----------------------------------------------------------------------
export default function DocumentsView() {
  const [currentTab, setCurrentTab] = useState('mydocs');

  const handleChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <>
      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {currentTab === 'mydocs' && <h1>Mine</h1>}

      {currentTab === 'shared' && <h1>Shared</h1>}
    </>
  );
}
