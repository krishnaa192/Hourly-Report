import React, { useState } from 'react';
import '../css/Table.css';
import '../css/filter.css'

const Filterdata = ({ setFilters, serviceOwners, serviceNames, territories, operators, partnerNames,datefilter }) => {
    const [serviceOwner, setServiceOwner] = useState('');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [serviceName, setServiceName] = useState('');
    const [territory, setTerritory] = useState('');
    const [operator, setOperator] = useState('');
    const [partnerName, setPartnerName] = useState('');

    const applyFilters = () => {
        // Validate date range
        if (new Date(dateRange.from) > new Date(dateRange.to)) {
            alert('The "from" date cannot be later than the "to" date.');
            return;
        }

        setFilters({
            serviceOwner,
            dateRange,
            serviceName,
            territory,
            operator,
            partnerName,
        });
    };

    const clearFilters = () => {
        setServiceOwner('');
        setDateRange({ from: '', to: '' });
        setServiceName('');
        setTerritory('');
        setOperator('');
        setPartnerName('');
        setFilters({}); // Reset filters in the parent component
    };

    return (
      <>
       <div className='filter-obj'>
        <div className='filter-container'>
            {/* Service Owner Dropdown */}
            <div>
              
                <select value={serviceOwner} onChange={(e) => setServiceOwner(e.target.value)}>
                    <option value="">Select Service Owner</option>
                    {serviceOwners.map((owner, idx) => (
                        <option key={idx} value={owner}>
                            {owner}
                        </option>
                    ))}
                </select>
            </div>

            {/* Date Range Input */}
            <div className="date">
             
                <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
                <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
            </div>

            {/* Service Name Dropdown */}
            <div>
         
                <select value={serviceName} onChange={(e) => setServiceName(e.target.value)}>
                    <option value="">Select Service Name</option>
                    {serviceNames.map((name, idx) => (
                        <option key={idx} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Territory Dropdown */}
            <div>
       
                <select value={territory} onChange={(e) => setTerritory(e.target.value)}>
                    <option value="">Select Territory</option>
                    {territories.map((territory, idx) => (
                        <option key={idx} value={territory}>
                            {territory}
                        </option>
                    ))}
                </select>
            </div>

            {/* Operator Dropdown */}
            <div>
             
                <select value={operator} onChange={(e) => setOperator(e.target.value)}>
                    <option value="">Select Operator</option>
                    {operators.map((operator, idx) => (
                        <option key={idx} value={operator}>
                            {operator}
                        </option>
                    ))}
                </select>
            </div>

            {/* Partner Name Dropdown */}
            <div>
          
                <select value={partnerName} onChange={(e) => setPartnerName(e.target.value)}>
                    <option value="">Select Partner Name</option>
                    {partnerNames.map((partner, idx) => (
                        <option key={idx} value={partner}>
                            {partner}
                        </option>
                    ))}
                </select>
            </div>
            </div>
            <div className="action-btn">
            <button onClick={applyFilters}>Apply Filters</button>
            <button onClick={clearFilters}>Clear Filters</button>
            </div>
            </div>
        </>
    );
};

export default Filterdata;
