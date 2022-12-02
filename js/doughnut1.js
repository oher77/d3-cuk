d3.json('data/data-doughnut1.json')
  .then(function (data) {
    const width = 560;
    const height = 295;
    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select('#doughnut1>.canvas')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width:100%;height:auto;height:intrinsic;')
    const graph = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    const arc = d3.arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius * 0.9)

    const outerArc = d3.arc()
      .innerRadius(radius)
      .outerRadius(radius)

    const pie = d3.pie()
      .sort((a, b) => b.value - a.value)
      .value(d => d.value)
    const dataReady = pie(data)

    let names = d3.map(data, d => d.name);
    names = new d3.InternSet(names);
    let colors = d3.schemeSpectral[names.size];
    colors = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), names.size);

    const color = d3.scaleOrdinal(names, colors);

    graph.selectAll('allSlices')
      .data(dataReady)
      .enter()
      .append('path')
      .attr('fill', color)
      .attr('stroke-color', 'white')
      .attr('d', arc)
    graph.selectAll('allPolylines')
      .data(dataReady)
      .enter()
      .append('polyline')
      .attr('stroke', 'gray')
      .style('fill', 'none')
      .attr('stroke-width', (d) => {
        if(d.index >= 8 ) {
          return '0';
        } else {
          return '1';
        }
        })
      .attr('points', (d) => {
        const posA = arc.centroid(d) // line insertion in the slice
        const posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
        const posC = outerArc.centroid(d); // Label position = almost the same as posB
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
        posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        return [posA, posB, posC]
      })

    graph.selectAll('allLabels')
      .data(dataReady)
      .enter()
      .append('text')
      .text((d) => { return d.data.name })
      .attr('transform', (d) => {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
      })
      .style('text-anchor', (d) => {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return (midangle < Math.PI ? 'start' : 'end')
      })
      .attr('font-size', (d) => {
        if(d.index < 3 ) {
          return '1.1em';
        } else if(3 <= d.index & d.index < 8) {
          return '0.8em';
        } else {
          return '0';
        }
      })
      .attr('fill', (d) => {
        if(d.index < 3 ) {
          return 'white';
          return color(d);
        } else {
          return textColor;
        }
      })

    // 휴학사유 타이틀
    graph.append('text')
      .attr('x', graph.width)
      .attr('y', graph.height)
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(0,8)`)
      .text('휴학사유')
      .attr('fill', 'white')
      .style('font-size', '1.5em')


  })
  .catch(function (err) {
    console.log('실패!');
    console.error(err);
  })