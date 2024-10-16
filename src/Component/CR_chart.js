import React, { useEffect } from 'react';
import * as d3 from 'd3';

const CRGraph = ({ data, onClick }) => {
  useEffect(() => {
    const svg = d3.select('#cr-graph'); // Select the SVG element
    svg.selectAll('*').remove(); // Clear previous elements

    const width = 800;
    const height = 400;

    svg.attr('width', width).attr('height', height);

    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.cr)])
      .range([height, 0]);

    // Create bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.date))
      .attr('y', d => yScale(d.cr))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.cr))
      .on('click', d => onClick(d.date, d.serviceId)); // Handle click event

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g')
      .call(d3.axisLeft(yScale));
  }, [data, onClick]);

  return <svg id="cr-graph" />;
};

export default CRGraph;
