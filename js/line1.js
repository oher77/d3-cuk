    d3.json('data/data-line1.json')
      .then(function (data) {
        const width = 800;
        const height = 260;
        let [mt, mr, mb, ml] = [20, 30, 30, 30];

        const svg = d3.select('#line1>.canvas')
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .attr('viewBox', [0, 0, width, height])
          .attr('style', 'max-width:100%;height:auto;height:intrinsic;')

        const graphWidth = width - ml - mr;
        const graphHeight = height - mt - mb;

        const graph = svg.append('g')
          .attr('width', graphWidth)
          .attr('height', graphHeight)
          .attr('transform', `translate(${ml},${mt})`)

        // data로 시작
        const xAxisG = graph.append('g')
          .attr('transform', `translate(0, ${graphHeight})`)
          .style('font-size', '.8em')
        const yAxisG = graph.append('g')
          .style('font-size', '.8em')


        const x = d3.scaleBand()
          .domain(data.map(item => item.year))
          .range([0, graphWidth])
          .padding(-1)

        const y = d3.scaleLinear()
          .domain([0, 100])
          .range([graphHeight, 0])


        const lines = graph.selectAll('path')
          .data(data)

        const lineNew = d3.line()
          .x(d => x(d.year))
          .y(d => y(d.new))
          .curve(d3.curveBasis)
        const lineAttend = d3.line()
          .x(d => x(d.year))
          .y(d => y(d.attend))
          .curve(d3.curveBasis)
        const lineOut = d3.line()
          .x(d => x(d.year))
          .y(d => y(d.out))
          .curve(d3.curveBasis)
        const lineAbsence = d3.line()
          .x(d => x(d.year))
          .y(d => y(d.absence))
          .curve(d3.curveBasis)

        lines.enter()
          .append('path')
          .attr('fill', 'none')
          .attr('stroke', color1)
          .attr('stroke-width', '2px')
          .attr('d', lineNew(data))
          .attr('transform', 'translate(85,0)')
        lines.enter()
          .append('path')
          .attr('fill', 'none')
          .attr('stroke', color2)
          .attr('stroke-width', '2px')
          .attr('d', lineAttend(data))
          .attr('transform', 'translate(85,0)')
        lines.enter()
          .append('path')
          .attr('fill', 'none')
          .attr('stroke', color3)
          .attr('stroke-width', '2px')
          .attr('d', lineOut(data))
          .attr('transform', 'translate(85,0)')
        lines.enter()
          .append('path')
          .attr('fill', 'none')
          .attr('stroke', color4)
          .attr('stroke-width', '2px')
          .attr('d', lineAbsence(data))
          .attr('transform', 'translate(85,0)')

        const xAxis = d3.axisBottom(x);
        const yAxis = d3.axisLeft(y);

        xAxisG.call(xAxis);
        yAxisG.call(yAxis);

        // const f = d3.line()
        //   .x()
        //   .y()
        //   .curve()
        const lagend = d3.select('#line1>.canvas').append('text')
          .text('legend')

      })
      .catch(function (err) {
        console.log('실패!');
        console.error(err);
      })