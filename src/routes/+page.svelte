<script>
    import {extent} from "d3-array";
	import {scaleLinear, scaleOrdinal} from "d3-scale";
    import {schemeCategory10} from "d3-scale-chromatic";
	import RadialBarchart from '../components/RadialBarchart.svelte';
    
    import { select } from 'd3-selection'
    export let data;

    let parsed_data = data.ebi_ptm.map((d) => {
		return {
            name: d.name,
			length: d.length,
			nr_modifications: d.nr_modifications,
			species: d.species
		}
	})

    let xExtent = extent(parsed_data, (d)=> d.length);
	let yExtent = extent(parsed_data, (d)=> d.nr_modifications);

	// define plot size and margins
	let width = 700;
	let height = 500;
	const margins = {top:20, right:20, bottom:20, left: 50};
	
	// make x and y linear scales
	let xScale = scaleLinear().domain([xExtent[0]-20, xExtent[1]+20]).range([margins.left, width - margins.right]);
	let yScale = scaleLinear().domain(yExtent).range([height - margins.bottom, margins.top]); 

	// create ordinal scale (obsolete)
	let species = [... new Set(parsed_data.map((d) => d.species))];
	let colorScale = scaleOrdinal()
		.domain(species)
		.range(schemeCategory10)
	
	// make ticks
	let xTicks = xScale.ticks(5);
	let yTicks = yScale.ticks(5);
    let tickSize = 3;

    // hover
    let selected_datapoint = undefined;

    // mouse_position
    let mouse_x, mouse_y;                            
    const setMousePosition = function(event) {       
        mouse_x = event.clientX;
        mouse_y = event.clientY;
  }
</script>

<style>
  circle.selected {                         
    fill: gainsboro;
    fill-opacity: 1;
  }

  #tooltip {                                       
    position: fixed;
    background-color: white;
    padding: 3px;
    border: solid 1px;
  }

  svg.tooltip {                                    
    margin: 0px;
    padding: 0px;
  }

</style>

<h2>Welcome to the world's smallest PTM database!</h2>
<h3 style="margin-left:{margins.left}px;">Length of protein vs number of modifications</h3>
<svg {width} {height}>
	<g class="x-axis">
        <line x1={margins.left} y1={height - margins.bottom} x2={width-margins.right} y2={height - margins.bottom} stroke="black"/>
		{#each xTicks as tick}
			<g class = "tick" transform='translate({xScale(tick)}, 0)'>
				<line y1={height - margins.bottom - tickSize} y2={height - margins.bottom + tickSize} stroke="black"/>
				<text y={height - margins.bottom + 5} alignment-baseline="hanging" text-anchor="middle">{tick}<text />
			</g>
		{/each}
	</g>
	
	<g class="y-axis">
        <line x1={margins.left} y1="0" x2={margins.left} y2={height-margins.bottom} stroke="black"/>
		{#each yTicks as tick}
			<g class = "tick" transform='translate(0, {yScale(tick)})'>
				<line x1={margins.left - tickSize} x2={margins.left + tickSize} stroke="black"/>
				<text x={margins.left - 23} alignment-baseline="middle" text-anchor="middle">{tick}<text />
			</g>
		{/each}
	</g>
	
	<g class="dots">
		{#each parsed_data as ptm}
			<!-- svelte-ignore a11y-mouse-events-have-key-events -->
			<a href="./{ptm.name}">
                <circle cx={xScale(ptm.length)}
                    cy={yScale(ptm.nr_modifications)}
                    r='10'
                    fill={colorScale(ptm.species)}
					fill-opacity=0
                    on:mouseover={function(event) { selected_datapoint = ptm; setMousePosition(event); select(event.target).raise() }}
				    on:mouseout={function() { selected_datapoint = null }}
                    class:selected="{selected_datapoint && ptm.name == selected_datapoint.name}"></circle>
                    <!-- TODO onclick with svelte location -->
            </a>
		{/each}
	</g>

	{#each parsed_data as ptm}                                
        <g transform="translate({xScale(ptm.length)}, {yScale(ptm.nr_modifications)})">  
            <RadialBarchart datapoints={data.ebi_ptm.filter((d) => { return d.name == ptm.name})[0]} width=60 height=60/> 
        </g>
    {/each}




</svg>

{#if selected_datapoint}
<div id="tooltip" style="left:{mouse_x + 15}px; top:{mouse_y-10}px">
Protein: {selected_datapoint.name} <br />
Species: {selected_datapoint.species} 
</div>
{/if}