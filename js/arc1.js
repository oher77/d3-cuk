const arc1Svg = d3.select('#arc1>.canvas')
  .append('svg')
  .attr('width', 180)
  .attr('height', 180)
const arc1G = arc1Svg.append('g')
  .attr('transform', 'translate(90,90)');

const arc1G2 = d3.select('#arc1>.flex-grow-1');

d3.json('data/data-arc1.json')
  .then(function (data) {

    const f = d3.arc()
      .innerRadius(84)
      .outerRadius(90)

    const pie = d3.pie()
      .sort(null)
      .value(d => d.value / d.total * 100)

    const color = d3.scaleOrdinal([color1, trackColor]);
    
    arc1G.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('fill', (i) => color(i))
      .attr('stroke', 'none')
      .attr('d', f)
    arc1G.append('text')
      .attr('x', arc1G.width)
      .attr('y', arc1G.height)
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate(0,16)')
      .text(Math.round(data[0].value / data[0].total * 100) + '%')
      .attr('fill', color1)
      .style('font-size', '50px')

    arc1G2.append('text')
      .text('TOTAL:' + '\u00a0' + data[0].total)
      .style('display', 'block')
    arc1G2.append('text')
      .text('VALUE:' + '\u00a0' + data[0].value)
  })
  .catch(function (err) {
    console.log('실패!');
    console.error(err);
  })