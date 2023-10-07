import React from 'react';
import { Box, Tab, Tabs } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box py={2}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface TabData {
  label: string,
  body: React.ReactNode | React.ReactNode[],
  disabled?: boolean,
}

interface Props {
  tabsData: TabData[],
  selectedTab: number,
  setSelectedTab: (newSelection: number) => void,
}

const CustomTabs: React.FC<Props> = ({ selectedTab, setSelectedTab, tabsData }) => {
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box width="100%">
      <Box borderBottom={1} borderColor="divider">
        <Tabs value={selectedTab} onChange={handleChange}>
          {tabsData.map(tab => (
            <Tab key={tab.label} label={tab.label} disabled={tab.disabled} />
          ))}
        </Tabs>
      </Box>
      {tabsData.map((tab, i) => (
        <CustomTabPanel key={tab.label} value={selectedTab} index={i}>
          {tab.body}
        </CustomTabPanel>
      ))}
    </Box>
  );
};

export default CustomTabs;
