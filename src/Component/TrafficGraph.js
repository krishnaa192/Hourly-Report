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

    // Create or select the chart group
    let g = svg.selectAll('g.chart-group').data([filteredData]);

    // Enter new chart group
    g = g.enter()
      .append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .merge(g);

    // Set up scales
    const x = d3.scaleLinear()
      .domain([0, 23]) // X-axis from 0 to 23 for hours
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, 100]) // Conversion rate (CR) is in percentage
      .range([innerHeight, 0]);

    const yCount = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => Math.max(d.pinGenSucCount, d.pinVerSucCount))])
      .range([innerHeight, 0]);

    // Clear previous axes, grid, lines, and area
    g.selectAll('.x-axis').remove();
    g.selectAll('.y-axis').remove();
    g.selectAll('.y-axis-count').remove(); // Clear old count axis
    g.selectAll('.grid').remove();
    g.selectAll('.line').remove();
    g.selectAll('.area').remove();
    g.selectAll('.label').remove(); // Clear old labels

    // Add X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(24)); // 24 ticks for each hour

    // Add Y axis for CR
    const yAxisCR = g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

    // Add Y axis for counts (pinGenSucCount and pinVerSucCount) on the right
    const yAxisCount = g.append('g')
      .attr('class', 'y-axis-count')
      .attr('transform', `translate(${innerWidth}, 0)`)
      .call(d3.axisRight(yCount));

    // Label the Y-axes
    yAxisCR.append('text')
      .attr('class', 'y-axis-label')
      .attr('x', -margin.left)
      .attr('y', 6)
      .attr('dy', '.71em')
      .attr('text-anchor', 'end')
      .text('CR (%)')
      .attr('fill', '#1f77b4');

    yAxisCount.append('text')
      .attr('class', 'y-axis-label')
      .attr('x', margin.right)
      .attr('y', -6)
      .attr('dy', '.71em')
      .attr('text-anchor', 'start')
      .text('PinGenSucCount & PinVerSucCount')
      .attr('fill', '#ff7f0e');

    // Add horizontal grid lines
    const yTicks = y.ticks();
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#ccc')
      .attr('stroke-dasharray', '2,2');

    // Define line generator for CR
    const lineGeneratorCR = d3.line()
      .x(d => x(d.hour))
      .y(d => y(d.cr));

    // Define line generators for pinGenSucCount and pinVerSucCount
    const lineGeneratorPinGen = d3.line()
      .x(d => x(d.hour))
      .y(d => yCount(d.pinGenSucCount));

    const lineGeneratorPinVer = d3.line()
      .x(d => x(d.hour))
      .y(d => yCount(d.pinVerSucCount));

    // Add line for CR
    g.append('path')
      .datum(filteredData)
      .attr('class', 'line cr')
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('d', lineGeneratorCR);

    // Add line for pinGenSucCount
    g.append('path')
      .datum(filteredData)
      .attr('class', 'line pin-gen')
      .attr('fill', 'none')
      .attr('stroke', '#ff7f0e') // Use different color for pinGenSucCount
      .attr('stroke-width', 2)
      .attr('d', lineGeneratorPinGen);

    // Add line for pinVerSucCount
    g.append('path')
      .datum(filteredData)
      .attr('class', 'line pin-ver')
      .attr('fill', 'none')
      .attr('stroke', '#2ca02c') // Use different color for pinVerSucCount
      .attr('stroke-width', 2)
      .attr('d', lineGeneratorPinVer);

    // Add tooltip handling logic for each line
    const handleMouseOver = (event, d) => {
      let tooltipContent = `Hour: ${d.hour}<br>`;
      
      // Show CR value or indicate it's zero
      if (d.cr === 0) {
        tooltipContent += 'CR: 0 (No conversion)<br>';
      } else {
        tooltipContent += `CR: ${d.cr}<br>`;
      }
      
      tooltipContent += `PinGenSucCount: ${d.pinGenSucCount}<br>PinVerSucCount: ${d.pinVerSucCount}`;
      
      tooltip.style('opacity', 1)
        .html(tooltipContent)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 20}px`);
    };
    

    const handleMouseOut = () => {
      tooltip.style('opacity', 0);
    };

    // Add dots for each data point and handle tooltip interaction
    ['cr', 'pin-gen', 'pin-ver'].forEach((lineClass, idx) => {
      g.selectAll(`.dot-${lineClass}`)
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('class', `dot dot-${lineClass}`)
        .attr('cx', d => x(d.hour))
        .attr('cy', d => {
          if (lineClass === 'cr') return y(d.cr.toFixed(2));
          return idx === 1 ? yCount(d.pinGenSucCount) : yCount(d.pinVerSucCount);
        })
        .attr('r', 4)
        .attr('fill', idx === 0 ? '#1f77b4' : idx === 1 ? '#ff7f0e' : '#2ca02c')
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);
    });
  }, [data, title]);

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
