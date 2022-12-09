d3.json('data/data-marimekko-pop.json')
  .then(function (data) {
    const width = 1800;
    const height = 900
    const margin = ({ top: 50, right: -1, bottom: -1, left: 1 })
    //const color = d3.scaleOrdinal(d3.schemeTableau10).domain(data.map(d => d.y))
    let names = d3.map(data, d => d.y);
    names = new d3.InternSet(names);
    let colors = d3.schemeSpectral[names.size];
    colors = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), names.size);
    const color = d3.scaleOrdinal(names, colors);

    const format = d => d.toLocaleString()
    const treemap = data => d3.treemap()
      .round(true)
      .tile(d3.treemapSliceDice)
      .size([
        width - margin.left - margin.right,
        height - margin.top - margin.bottom
      ])
      (d3.hierarchy(d3.group(data, d => d.x, d => d.y)).sum(d => d.value))
      .each(d => {
        d.x0 += margin.left;
        d.x1 += margin.left;
        d.y0 += margin.top;
        d.y1 += margin.top;
      })
    function chart() {
      const root = treemap(data);

      const svg = d3.select('.canvas')
        .append('svg')
        .attr("viewBox", [0, 0, width, height])
        .attr('width', width)
        .attr('height', height)
        .attr('style', 'max-width:100%;height:auto;height:intrinsic;')
        .style("font", "10px sans-serif");

      const node = svg.selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

      const column = node.filter(d => d.depth === 1);
      //학년
      column.append("text")
        .attr("x", 3)
        .attr("y", "-1.7em")
        .attr("font-size", '16')
        //.style("font-weight", "bold")
        .attr("fill", textColor)
        .text(d => d.data[0]);
      //학년 수
      column.append("text")
        .attr("x", 3)
        .attr("y", "-0.5em")
        .attr("font-size", '14')
        .attr("fill-opacity", 0.7)
        .attr("fill", textColor)
        .text(d => format(d.value));

      const tick = node.filter(d => d.depth === 3);
      //tick
      tick.append("line")
        .attr("x1", -0.5)
        .attr("x2", -0.5)
        .attr("y1", -30)
        .attr("y2", d => d.y1 - d.y0)
        .attr("stroke", "#000")

      const cell = node.filter(d => d.depth === 2);
      //Rect
      cell.append("rect")
        .attr("fill", d => color(d.data[0]))
        //.attr("fill-opacity", (d, i) => d.value / d.parent.value * 5)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

      //휴학사유
      cell.append("text")
        .attr("x", 3)
        .attr("y", "1.1em")
        .attr("font-size", (d, i) => {
          if (d.value / d.parent.value >= 0.3) {
            return 24;
          } else {
            return 12;
          }
        })
        .text(d => d.data[0])
      //휴학명수        
      cell.append("text")
        .attr("x", 3)
        .attr("y", (d, i) => {
          if (d.value / d.parent.value >= 0.3) {
            return 54;
          } else {
            return 26;
          }
        })
        .attr("fill-opacity", 0.5)
        .attr("font-size", (d, i) => {
          if (d.value / d.parent.value >= 0.3) {
            return 24;
          } else {
            return 12;
          }
        })
        .text(d => format(d.value));

      return svg.node();
    }
    chart();
  });