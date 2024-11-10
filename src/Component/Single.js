import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LinearChart = ({ data, title }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const filteredData = data.map(d => ({
      hour: d.hour,
      cr: d.cr,
    }));

    let g = svg.selectAll('g.chart-group').data([filteredData]);
    g = g.enter()
      .append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .merge(g);

    const x = d3.scaleLinear()
      .domain([0, 23])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    g.selectAll('.x-axis').remove();
    g.selectAll('.y-axis').remove();
    g.selectAll('.grid').remove();

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(24));

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y));

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

    g.selectAll('.line').remove();
    g.selectAll('.area').remove();

    const lineGenerator = d3.line()
      .x(d => x(d.hour))
      .y(d => y(d.cr));

    const areaGenerator = d3.area()
      .x(d => x(d.hour))
      .y0(innerHeight)
      .y1(d => y(d.cr));

    g.append('path')
      .datum(filteredData)
      .attr('class', 'area cr')
      .attr('fill', '#b3d9ff')
      .attr('d', areaGenerator);

    g.append('path')
      .datum(filteredData)
      .attr('class', 'line cr')
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    g.selectAll('.dot').remove();

    g.selectAll('.dot')
      .data(filteredData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.hour))
      .attr('cy', d => y(d.cr))
      .attr('r', 5)
      .attr('fill', 'black')
      .on('mouseover', (event, d) => {
        tooltip
          .style('opacity', 1)
          .html(`
            Hour: ${d.hour}-${d.hour+1}<br/>
            CR: ${d.cr.toFixed(2)}%
          `);
      })
      .on('mousemove', (event) => {
        const svgPosition = svgRef.current.getBoundingClientRect(); // Get SVG position
        const tooltipWidth = tooltip.node().offsetWidth;
        const tooltipHeight = tooltip.node().offsetHeight;
    
        tooltip
          .style('left', `${event.clientX - svgPosition.left - tooltipWidth / 2}px`)
          .style('top', `${event.clientY - svgPosition.top - tooltipHeight +40}px`); // Adjust to show above the point
    })
    
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });

  }, [data, title]);

  return (
    <>
      <svg
        ref={svgRef}
        width={800}
        height={400}
      ></svg>
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
          transition: 'opacity 0.2s ease', // Smooth transition
          zIndex: 10 // Ensures tooltip is on top of SVG
        }}
      ></div>
    </>
  );
};

export default LinearChart;
