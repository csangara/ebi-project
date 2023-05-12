<script>

    import {extent} from "d3-array";
	import {scaleLinear, scalePoint, scaleOrdinal, scaleBand } from "d3-scale";
    import RadialBarchart from '../../components/RadialBarchart.svelte';
    import {schemeCategory10} from "d3-scale-chromatic";

    export let data = {};
    let parsed_data = data.protein
    let xMax = parsed_data.length;
	
	// define plot size and margins
	let width = 800;
	let height = 600;
	const margins = {top:25, right:20, bottom:45, left: 25};

    // Get modification array then flatten it
    let mod_array = parsed_data.residues.map(element => element.modifications);
    let mod_array_flat = mod_array.map(element => element.map(x => x.mod)).filter(arr => arr.length).flat();
    let mod_types = [... new Set(mod_array_flat)];

    // create dictionary of artefacts
    let mod_artefacts = mod_array.map(element => element.map(x => x.type))
    
    let mod_artefacts_counts = mod_artefacts.map(function(element) {
        const occurrences = element.reduce(function (agg, curr) {
            if (curr == "Artefact") {
                agg.artefact += 1
            } else {
                agg.other += 1
            }
            return agg;
        }, {artefact: 0, other: 0});
        return occurrences
    })

    // make x linear and y discrete scales for scatterplot
    let dotSize = 3;
	let xScale = scaleLinear().domain([0, xMax]).range([margins.left+dotSize, width - margins.right]);    
    let yScale = scalePoint().domain(mod_types).range([height - margins.bottom, margins.top]);

    let xScaleBand = scaleBand().domain(parsed_data.residues.map(d => d.pos)).range([margins.left+dotSize, width - margins.right-100]);

    let yMax = Math.max(...mod_artefacts_counts.map((d) => Math.max(d.other, d.artefact)));
    let yScaleBand = scaleLinear().domain([0, yMax]).range([0, height/5])
    
    

	// make ticks
	let xTicks = xScale.ticks(5);
    let tickSize = 5;
    let yAxisShift = 3;
    

    // create ordinal scale
	let artefact_type_unique = [... new Set(mod_artefacts.filter(arr => arr.length).flat())];
	let colorScale = scaleOrdinal()
		.domain(artefact_type_unique)
		.range(schemeCategory10)
    
</script>

<style>
    circle.artefact {                         
    fill: gray;
    fill-opacity: 0.2;
  }
</style>

<h2>{parsed_data.name}</h2>
[<a href="http://localhost:5173/">Back</a>]<br />
<b>Symbol:</b> {parsed_data.symbol} <br />
<b>Function:</b> {parsed_data.function} <br />



<!-- Scatterplot -->
<svg {width} {height}>
	<g class="x-axis">
        <line x1={margins.left} y1={height - margins.bottom + yAxisShift} x2={width-margins.right+dotSize} y2={height - margins.bottom + yAxisShift} stroke="black"/>
        <text y={height - margins.bottom + (yAxisShift*7) + tickSize} x={width/2} alignment-baseline="hanging" text-anchor="middle">Position</text>
			
		{#each xTicks as tick}
			<g class = "tick" transform='translate({xScale(tick)}, 0)'>
				<line y1={height - margins.bottom + yAxisShift} y2={height - margins.bottom + tickSize + yAxisShift} stroke="black"/>
				<text y={height - margins.bottom + (yAxisShift*2) + tickSize} alignment-baseline="hanging" text-anchor="middle">{tick}</text >
			</g>
		{/each}
	</g>
	
	<g class="y-axis">
        <g transform='rotate(-90 {margins.left} {height/2})'><text x="-30" y={(height/2)-10}>Type of modification </text></g>
        <line x1={margins.left} y1={margins.top} x2={margins.left} y2={height-margins.bottom+yAxisShift} stroke="black"/>
	
	</g>
	
	<g class="dots">
		{#each parsed_data.residues as residue, i}
            {#if mod_array[i].length}
                {#each residue.modifications as resmod}
                    
                    <circle cx={xScale(residue.pos)}
                            cy={yScale(resmod.mod)}
                            r={dotSize}
                            fill={colorScale(resmod.type)}
                            class:artefact="{resmod.type == "Artefact"}"
                            />
                {/each}
            {/if}
		{/each}
	</g>
</svg>

<!-- Histogram -->
<svg {width} height=300>
	<g class="bars" transform="translate(50, 150)">
        <text x=30 y=-100 fill="crimson">Real</text>
        <text x=30 y=100 fill="gray">Artefact</text>
		{#each parsed_data.residues as residue, i}
        <g >
            <rect x={xScaleBand(residue.pos)}
                    y=0
                    width={xScaleBand.bandwidth()}
                    height={yScaleBand(mod_artefacts_counts[i].artefact)}
                    fill="grey"
            />

            <g transform="scale(1,-1)">
            <rect x={xScaleBand(residue.pos)}
                    y=0
                    width={xScaleBand.bandwidth()}  
                    height={yScaleBand(mod_artefacts_counts[i].other)}
                    fill="crimson"
            />
            </g>
            
        </g>
            
    
		{/each}
	</g>
</svg>

<svg {width} {height}>
    <g transform="translate({width/2}, {height/2})">
    <RadialBarchart datapoints={data.protein} width={width} height={height}/> 
    </g>
</svg>