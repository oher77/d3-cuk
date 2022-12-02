d3.json('data/data-race1.json')
  .then(function (data) {
    // const width = 550;
    // const height = 224;
    let [mt, mr, mb, ml] = [10, 10, 10, 10];
    const barSize = 18;
    const height = mt + barSize * n + mb;

    const y = d3.scaleBand()
      .domain(d3.range(n + 1))
      .rangeRound([mt, mt + barSize * (n + 1 + 0.1)])
      .padding(0.1)

    const x = d3.scaleLinear([0, 1], [ml, width - mr])

    const formatDate = d3.utcFormat('%Y')

    function ticker(svg) {
      const now = svg.append('text')
      .style("font", `italic ${barSize}px`)
      .style('font-variant-numeric','tabular-nums' )
      .attr("text-anchor", "end")
      .attr("x", width - 6)
    }

  })
  .catch(function (err) {
    console.log('실패!');
    console.error(err);
  })