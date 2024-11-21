import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ThreeLinearChart = ({ data, title }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 50, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Prepare data for D3
    const filteredData = data.map(d => ({
      hour: d.hour,
      cr: d.cr,
      pinGenSucCount: d.pinGenSucCount,
      pinVerSucCount: d.pinVerSucCount,
    }));

    // Clear SVG before rendering
    svg.selectAll('*').remove();

    // Set up scales
    const x = d3.scaleLinear().domain([0, 23]).range([0, innerWidth]); // Hourly X-axis
    const y = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]); // Y-axis for CR percentage
    const yCount = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => Math.max(d.pinGenSucCount, d.pinVerSucCount))])
      .range([innerHeight, 0]);

    // Add chart group
    const g = svg.append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(24));

    // Add Y axis for CR
    const yAxisCR = g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));
      
    // Label for Y axis (CR)
    yAxisCR.append('text')
      .attr('class', 'y-axis-label')
      .attr('x', -margin.left)
      .attr('y', -10)
      .attr('text-anchor', 'end')
      .text('CR (%)')
      .attr('fill', '#1f77b4');

    // Add Y axis for counts on the right
    const yAxisCount = g.append('g')
      .attr('class', 'y-axis-count')
      .attr('transform', `translate(${innerWidth}, 0)`)
      .call(d3.axisRight(yCount));
      
    // Label for Y axis (Counts)
    yAxisCount.append('text')
      .attr('class', 'y-axis-label')
      .attr('x', margin.right)
      .attr('y', -10)
      .attr('text-anchor', 'start')
      .text('PinGenSucCount & PinVerSucCount')
      .attr('fill', '#ff7f0e');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(y.ticks())
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#ccc')
      .attr('stroke-dasharray', '2,2');

    // Define line generators
    const lineGeneratorCR = d3.line().x(d => x(d.hour)).y(d => y(d.cr));
    const lineGeneratorPinGen = d3.line().x(d => x(d.hour)).y(d => yCount(d.pinGenSucCount));
    const lineGeneratorPinVer = d3.line().x(d => x(d.hour)).y(d => yCount(d.pinVerSucCount));

    // Add lines for CR, PinGenSucCount, and PinVerSucCount
    g.append('path')
      .datum(filteredData)
      .attr('class', 'line cr')
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('d', lineGeneratorCR);

    g.append('path')
      .datum(filteredData)
      .attr('class', 'line pin-gen')
      .attr('fill', 'none')
      .attr('stroke', '#ff7f0e')
      .attr('stroke-width', 2)
      .attr('d', lineGeneratorPinGen);

    g.append('path')
      .datum(filteredData)
      .attr('class', 'line pin-ver')
      .attr('fill', 'none')
      .attr('stroke', '#2ca02c')
      .attr('stroke-width', 2)
      .attr('d', lineGeneratorPinVer);

    // Tooltip handling
    const handleMouseOver = (event, d) => {
      tooltip.style('opacity', 1)
        .html(`
          <strong>Hour:</strong> ${d.hour}<br>
          <strong>CR:</strong> ${d.cr === 0 ? '0 (No conversion)' : d.cr.toFixed(2)}%<br>
          <strong>PinGenSucCount:</strong> ${d.pinGenSucCount}<br>
          <strong>PinVerSucCount:</strong> ${d.pinVerSucCount}
        `)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 20}px`);
    };

    const handleMouseOut = () => {
      tooltip.style('opacity', 0);
    };

    // Add dots for data points and tooltip interaction
    
  }, [data]);

  return (
    <>
      <svg ref={svgRef} width={800} height={400}></svg>
      <div
        ref={tooltipRef}
        className="tooltip"
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          borderRadius: '5px',
          padding: '5px',
        }}
      ></div>
    </>
  );
};

export default ThreeLinearChart;
