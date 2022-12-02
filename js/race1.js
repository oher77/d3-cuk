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

    function color(d) {
      const scale = d3.scaleOrdinal(d3.schemTableau10);
      if (data.some(d => d.category !== undefined)) {
        const categoryByName = new Map(data.map(d => [d.name, d.category]))
        scale.domain(categoryByName.values());
        return d => scale(categoryByName.get(d.name));
      }
      return d => scale(d.name);
    }

    function ticker(svg) {
      const now = svg.append('text')
        .style("font", `italic ${barSize}px`)
        .style('font-variant-numeric', 'tabular-nums')
        .attr("text-anchor", "end")
        .attr("x", width - 6)
    }
    const tickFormat = undefined;
    function axis(svg) {
      const g = swg.append('g')
        .attr('transform', `translate(0,${mt})`);

      const axis = d3.axisTop(x)
        .ticks(width / 160, tickFormat)
        .tickSizeOuter(0)
        //tick을 안 쪽으로 해서 길게 뺀다. 근데 '-'네?
        .tickSizeInner(-barSize * (n + y.padding()));
      //상단 axis 시작과 끝 수치 없애기. 안으로 길게 뺀 tick white로 칠하기
      return (_, transition) => {
        g.transition(transition).call(axis);
        g.select(".tick:first-of-type text").remove();
        g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
        g.select(".domain").remove();
      };
    }

    const formatNumber = d3.format(",d")
    function textTween(a, b) {
      const i = d3.interpolateNumber(a, b);
      return function (t) {
        this.textContent = formatNumber(i(t));
      }
    }

    //bar 
    function labels(svg) {
      let label = svg.append("g")
        .style("font", "bold 12px var(--sans-serif)")
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
        .selectAll("text");

      return ([date, data], transition) => label = label
        .data(data.slice(0, n), d => d.name)
        .join(
          enter => enter.append("text")
            .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
            .attr("y", y.bandwidth() / 2)
            .attr("x", -6)
            .attr("dy", "-0.25em")
            .text(d => d.name)
            .call(text => text.append("tspan")
              .attr("fill-opacity", 0.7)
              .attr("font-weight", "normal")
              .attr("x", -6)
              .attr("dy", "1.15em")),
          update => update,
          exit => exit.transition(transition).remove()
            .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
            .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
        )
        .call(bar => bar.transition(transition)
          .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
          .call(g => g.select("tspan").tween("text", d => textTween((prev.get(d) || d).value, d.value))));
    }

  })
  .catch(function (err) {
    console.log('실패!');
    console.error(err);
  })