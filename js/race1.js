d3.json('data/data-race1.json')
  .then(function (data) {
    const width = 550;
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

    function textTween(a, b) {
      const i = d3.interpolateNumber(a, b);
      return function (t) {
        this.textContent = formatNumber(i(t));
      };
    }

    //bar 에 표현될 name 과 value
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
    //bar 추가
    function bars(svg) {
      let bar = svg.append("g")
        .attr("fill-opacity", 0.6)
        .selectAll("rect");

      return ([date, data], transition) => bar = bar
        .data(data.slice(0, n), d => d.name)
        .join(
          enter => enter.append("rect")
            .attr("fill", color)
            .attr("height", y.bandwidth())
            .attr("x", x(0))
            .attr("y", d => y((prev.get(d) || d).rank))
            .attr("width", d => x((prev.get(d) || d).value) - x(0)),
          update => update,
          exit => exit.transition(transition).remove()
            .attr("y", d => y((next.get(d) || d).rank))
            .attr("width", d => x((next.get(d) || d).value) - x(0))
        )
        .call(bar => bar.transition(transition)
          .attr("y", d => y(d.rank))
          .attr("width", d => x(d.value) - x(0)));
    }
    //rank 배열만들기
    let names = new Set(data.map(d => d.name))

    function rank(value) {
      const data = Array.from(names, name => ({ name, value: value(name) }));
      data.sort((a, b) => d3.descending(a.value, b.value));
      for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
      return data;
    }

    //rank 애니메이션을 위한 값
    const k = 10;
    let datevalues = Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name))
    .map(([date, data]) => [new Date(date), data])
    .sort(([a], [b]) => d3.ascending(a, b))

    function keyframes() {
      const keyframes = [];
      let ka, a, kb, b;
      for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
        for (let i = 0; i < k; ++i) {
          const t = i / k;
          keyframes.push([
            new Date(ka * (1 - t) + kb * t),
            rank(name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
          ]);
        }
      }
      keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);
      return keyframes;
    }
    
    const nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name)
    const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))
    const prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])))

    //기본 세팅
    const n = 5;
    const duration = 250;

    async function* chart() {
    
      const svg = d3.select('#race1>.canvas')
          .append('svg')
          .attr("viewBox", [0, 0, width, height]);
    
      const updateBars = bars(svg);
      const updateAxis = axis(svg);
      const updateLabels = labels(svg);
      const updateTicker = ticker(svg);
    
      yield svg.node();
    
      for (const keyframe of keyframes) {
        const transition = svg.transition()
            .duration(duration)
            .ease(d3.easeLinear);
    
        // Extract the top bar’s value.
        x.domain([0, keyframe[1][0].value]);
    
        updateAxis(keyframe, transition);
        updateBars(keyframe, transition);
        updateLabels(keyframe, transition);
        updateTicker(keyframe, transition);
    
        // invalidation.then(() => svg.interrupt());
        await transition.end();
      }
    }
    
    chart();
  })
  .catch(function (err) {
    console.log('실패!');
    console.error(err);
  })