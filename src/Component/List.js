import React, { useEffect, useState } from 'react';
import Filterdata from './Filter'; // Assuming this is your Tab 1 filter component
import ServiceOwner from './Service_owner'; // Assuming this is your Tab 1 data display component
import '../css/hourlydata.css'; // Styles for tabs
import TrafficFilterdata from './TrafficFilter'; // Your Tab 2 filter component
import TrafficDataComponent from './Traffic'; //
import { fetchHourlyInappReport } from '../Utils'

const Hourlydata = () => {
  const [data, setData] = useState([]); // Raw data from the API
  const [filteredDataTab1, setFilteredDataTab1] = useState([]); // For Tab 1
  const [filteredDataTab2, setFilteredDataTab2] = useState([]); // For Tab 2
  const [loading, setLoading] = useState(true);

  const [filtersTab1, setFiltersTab1] = useState({
    serviceOwner: '',
    dateRange: { from: '', to: '' },
    serviceName: '',
    territory: '',
    operator: '',
    partnerName: '',
  });

  const [filtersTab2, setFiltersTab2] = useState({
    partnerName: '',
    dateRange: { from: '', to: '' },
    serviceName: '',
    territory: '',
    operator: '',
  });

  const [activeTab, setActiveTab] = useState('tab1'); // State to track active tab

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchHourlyInappReport(); // Use the centralized API call
        setData(result);
        setLoading(false);
        applyFilters(result); // Apply filters for the active tab when data is fetched
      } catch (error) {
        setLoading(false);
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Apply filters for the active tab
  const applyFilters = (dataToFilter) => {
    if (activeTab === 'tab1') {
      applyFiltersTab1(dataToFilter);
    } else if (activeTab === 'tab2') {
      applyFiltersTab2(dataToFilter);
    }
  };

  // Apply filters for Tab 1
  const applyFiltersTab1 = (dataToFilter) => {
    let filtered = dataToFilter || [];
    // Filtering logic for Tab 1
    if (filtersTab1.serviceOwner) {
      filtered = filtered.filter((item) => item.service_owner === filtersTab1.serviceOwner);
    }
    if (filtersTab1.dateRange?.from && filtersTab1.dateRange?.to) {
      const fromDate = new Date(filtersTab1.dateRange.from);
      const toDate = new Date(filtersTab1.dateRange.to);
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.timestamp.split(' ')[0]);
        return itemDate >= fromDate && itemDate <= toDate;
      });
    }
    if (filtersTab1.serviceName) {
      filtered = filtered.filter((item) => item.serviceName === filtersTab1.serviceName);
    }
    if (filtersTab1.territory) {
      filtered = filtered.filter((item) => item.territory === filtersTab1.territory);
    }
    if (filtersTab1.operator) {
      filtered = filtered.filter((item) => item.operatorname === filtersTab1.operator);
    }
    if (filtersTab1.partnerName) {
      filtered = filtered.filter((item) => item.partnerName === filtersTab1.partnerName);
    }
    setFilteredDataTab1(filtered);
  };

  // Apply filters for Tab 2
  const applyFiltersTab2 = (dataToFilter) => {
    let filtered = dataToFilter || [];
    // Filtering logic for Tab 2
    if (filtersTab2.partnerName) {
      filtered = filtered.filter((item) => item.partnerName === filtersTab2.partnerName);
    }
    if (filtersTab2.serviceName) {
      filtered = filtered.filter((item) => item.serviceName === filtersTab2.serviceName);
    }
    if (filtersTab2.territory) {
      filtered = filtered.filter((item) => item.territory === filtersTab2.territory);
    }
    if (filtersTab2.operator) {
      filtered = filtered.filter((item) => item.operatorname === filtersTab2.operator);
    }

    setFilteredDataTab2(filtered);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);  // Let useEffect handle the filter application
  };

  useEffect(() => {
    // Apply filters based on the current tab
    if (activeTab === 'tab1') {
      applyFiltersTab1(data); // Apply Tab 1 filters
    } else if (activeTab === 'tab2') {
      applyFiltersTab2(data); // Apply Tab 2 filters
    }
  }, [activeTab, filtersTab1, filtersTab2, data]);

  // Separate filter dropdown options logic for each tab
  const getUniqueValues = (key, tab) => {
    let filteredForOptions = data;
    if (tab === 'tab1') {
      // Filtering for options based on Tab 1 filters
      if (filtersTab1.serviceOwner) {
        filteredForOptions = data.filter((item) => item.service_owner === filtersTab1.serviceOwner);
      }
    } else if (tab === 'tab2') {
      // Filtering for options based on Tab 2 filters
      if (filtersTab2.partnerName) {
        filteredForOptions = data.filter((item) => item.partnerName === filtersTab2.partnerName);
      }
    }
    return [...new Set(filteredForOptions.map((item) => item[key]))];
  };

  // Separate dropdown values for each tab
  const serviceOwners = getUniqueValues('service_owner', 'tab1');
  const serviceNamesTab1 = getUniqueValues('serviceName', 'tab1');
  const territoriesTab1 = getUniqueValues('territory', 'tab1');
  const operatorsTab1 = getUniqueValues('operatorname', 'tab1');
  const partnerNamesTab1 = getUniqueValues('partnerName', 'tab1');

  const serviceNamesTab2 = getUniqueValues('serviceName', 'tab2');
  const territoriesTab2 = getUniqueValues('territory', 'tab2');
  const operatorsTab2 = getUniqueValues('operatorname', 'tab2');
  const partnerNamesTab2 = getUniqueValues('partnerName', 'tab2');

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="tab-container">
        <button
          className={`tab ${activeTab === 'tab1' ? 'active' : ''}`}
          onClick={() => handleTabChange('tab1')}
        >
          Service Partner
        </button>
        <button
          className={`tab ${activeTab === 'tab2' ? 'active' : ''}`}
          onClick={() => handleTabChange('tab2')}
        >
          Traffic Partner
        </button>
      </div>

      {activeTab === 'tab1' && (
        <>
          <Filterdata
            setFilters={setFiltersTab1}
            serviceOwners={serviceOwners}
            serviceNames={serviceNamesTab1}
            territories={territoriesTab1}
            operators={operatorsTab1}
            partnerNames={partnerNamesTab1}
            data={data} // Pass the fetched data to filter
            applyFilters={() => applyFilters(data)} // Ensure filters are applied on change
          />
          <ServiceOwner data={filteredDataTab1} filters={filtersTab1} />
        </>
      )}

      {activeTab === 'tab2' && (
        <>
          <TrafficFilterdata
            setFilters={setFiltersTab2}
            partnerNames={partnerNamesTab2}
            serviceNames={serviceNamesTab2}
            territories={territoriesTab2}
            operators={operatorsTab2}
            applyFilters={() => applyFilters(data)} // Ensure filters are applied on change
          />
          <TrafficDataComponent data={filteredDataTab2} filters={filtersTab2} />
        </>
      )}
    </div>
  );
};

export default Hourlydata;
