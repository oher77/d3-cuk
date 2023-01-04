
d3.json('data/data-arc3.json')
.then(function (data) {
    const svg = d3.select('#arc4>.canvas')
      .append('svg')
      .attr('width', 180)
      .attr('height', 180)
    const arc = svg.append('g')
      .attr('transform', 'translate(90,90)');
    
    const tick = d3.select('#arc4>.flex-grow-1');

    const f = d3.arc()
      .innerRadius(84)
      .outerRadius(90)

    const pie = d3.pie()
      .sort(null)
      .value(d => d.value / d.total * 100)

    const color = d3.scaleOrdinal([color4, trackColor]);

    arc.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('fill', (i) => color(i))
      .attr('stroke', 'none')
      .attr('d', f)
    arc.append('text')
      .attr('x', arc.width)
      .attr('y', arc.height)
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate(0,16)')
      .text(Math.round(data[0].value / data[0].total * 100) + '%')
      .attr('fill', color4)
      .style('font-size', '50px')

    tick.append('text')
      .text('TOTAL:' + '\u00a0' + data[0].total)
      .style('display', 'block')
    tick.append('text')
      .text('VALUE:' + '\u00a0' + data[0].value)
  })
  .catch(function (err) {
    console.log('실패!');
    console.error(err);
  })