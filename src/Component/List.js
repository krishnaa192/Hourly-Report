import React, { useEffect, useState } from 'react';
import Filterdata from './Filter'; // Assuming this is your Tab 1 filter component
import ServiceOwner from './Service_owner'; // Assuming this is your Tab 1 data display component
import '../css/hourlydata.css'; // Styles for tabs
import TrafficFilterdata from './TrafficFilter'; // Your Tab 2 filter component
import TrafficDataComponent from './Traffic'; //
import { fetchHourlyInappReport } from '../Utils'
import Loaders from './Loader';

const Hourlydata = () => {
  const [data, setData] = useState([]);
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
      setLoading(true);
      try {
        const result = await fetchHourlyInappReport();
        setData(result);
        applyFilters(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
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
        const itemDate = new Date(item.actDate);
        return itemDate >= fromDate && itemDate <= toDate;
      });
    }
    if (filtersTab1.serviceName) {
      filtered = filtered.filter((item) => item.serviceName === filtersTab1.serviceName);
    }
    if (filtersTab1.territory) {
      filtered = filtered.filter((item) => item.territory.toUpperCase() === filtersTab1.territory.toUpperCase());
    }
    if (filtersTab1.operator) {
      filtered = filtered.filter((item) => item.operatorname.toUpperCase() === filtersTab1.operator.toUpperCase());
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
      filtered = filtered.filter((item) => item.territory.toUpperCase() === filtersTab2.territory.toUpperCase());

    }
    if (filtersTab2.operator) {
      filtered = filtered.filter((item) => item.operatorname.toUpperCase() === filtersTab2.operator.toUpperCase());
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

  const getFilteredDataForTab = (tab) => {
    if (tab === 'tab1') {
      return filtersTab1.serviceOwner
        ? data.filter((item) =>
          item.service_owner === filtersTab1.serviceOwner &&
          item.operatorname.toUpperCase() === filtersTab1.operator.toUpperCase() &&
          item.territory.toUpperCase() === filtersTab1.territory.toUpperCase()
        )
        : data;
    }
    if (tab === 'tab2') {
      return filtersTab2.partnerName
        ? data.filter((item) =>
          item.partnerName === filtersTab2.partnerName &&
          item.operatorname.toUpperCase() === filtersTab2.operator.toUpperCase() &&
          item.territory.toUpperCase() === filtersTab2.territory.toUpperCase()
        )
        : data;
    }
    return data;
  };


  const getUniqueValuesForTab = (tab) => {
    const filteredData =
      tab === 'tab1'
        ? data.filter((item) => {
          return (
            (!filtersTab1.serviceOwner || item.service_owner === filtersTab1.serviceOwner) &&
            (!filtersTab1.serviceName || item.serviceName === filtersTab1.serviceName) &&
            (!filtersTab1.territory || item.territory.toUpperCase() === filtersTab1.territory.toUpperCase()) &&
            (!filtersTab1.operator || item.operatorname.toUpperCase() === filtersTab1.operator.toUpperCase())
          );
        })
        : data.filter((item) => {
          return (
            (!filtersTab2.partnerName || item.partnerName === filtersTab2.partnerName) &&
            (!filtersTab2.serviceName || item.serviceName === filtersTab2.serviceName) &&
            (!filtersTab2.territory || item.territory.toUpperCase() === filtersTab2.territory.toUpperCase()) &&
            (!filtersTab2.operator || item.operatorname.toUpperCase() === filtersTab2.operator.toUpperCase())
          );
        });

    const uniqueValues = {
      serviceOwners: [...new Set(filteredData.map((item) => item.service_owner))],
      serviceNames: [...new Set(filteredData.map((item) => item.serviceName))],
      territories: [...new Set(filteredData.map((item) => item.territory))].map((territory) => territory.toUpperCase()),
   
      operators: [...new Set(filteredData.map((item) => item.operatorname))].map((operator) => operator.toUpperCase()),
      partnerNames: [...new Set(filteredData.map((item) => item.partnerName))],
    };

   

    return uniqueValues;
  };


  const tab1Values = getUniqueValuesForTab('tab1');
  const tab2Values = getUniqueValuesForTab('tab2');
 

  const {
    serviceOwners: serviceOwnersTab1,
    serviceNames: serviceNamesTab1,
    territories: territoriesTab1,
    operators: operatorsTab1,
    partnerNames: partnerNamesTab1,
  } = tab1Values;

  const {
    serviceNames: serviceNamesTab2,
    territories: territoriesTab2,
    operators: operatorsTab2,
    partnerNames: partnerNamesTab2,
  } = tab2Values;


  if (loading) {
    return <Loaders />;
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
            serviceOwners={serviceOwnersTab1}
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
            territories={territoriesTab2.map((territory) => territory.toUpperCase())}  // Corrected
            operators={operatorsTab2.map((operator) => operator.toUpperCase())}  // Corrected
            data={data}
            applyFilters={() => applyFilters(data)}
          />

          <TrafficDataComponent data={filteredDataTab2} filters={filtersTab2} />
        </>
      )}
    </div>
  );
};

export default Hourlydata;
