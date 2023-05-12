<script>

	import { scaleBand, scaleRadial } from "d3-scale";
    import {arc} from "d3-shape";
    

    export let datapoints = [];
    let parsed_data = datapoints
    let xMax = parsed_data.length;
	
	// define plot size and margins
	export let width = 700;
	export let height = 500;
	const margins = {top:20, right:20, bottom:20, left: 20};
    let outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border
	let innerRadius = outerRadius / 3;

    // Get modification array then flatten it
    let mod_array = parsed_data.residues.map(element => element.modifications);

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

    // make scales for histogram
    let xScaleBand = scaleBand().range([0, 2 * Math.PI]).domain(parsed_data.residues.map(d => d.pos));         
    let yScaleRadial = scaleRadial().range([innerRadius, outerRadius]).domain([0, 100]);
    let yScaleRadialInner = scaleRadial().range([innerRadius, 0]).domain([0, 100]);

</script>

	
<g class="bars">
    {#each parsed_data.residues as residue, i}
        <path d={arc()({
            innerRadius: innerRadius,
            outerRadius: yScaleRadial(mod_artefacts_counts[i].other),
            startAngle: xScaleBand(residue.pos),
            endAngle: xScaleBand(residue.pos) + xScaleBand.bandwidth(),
            padRadius: innerRadius,
            padAngle: 0.01
        })} stroke="crimson" fill="crimson"/>

        <path d={arc()({
            innerRadius: yScaleRadialInner(0),
            outerRadius: yScaleRadialInner(mod_artefacts_counts[i].artefact),
            startAngle: xScaleBand(residue.pos),
            endAngle: xScaleBand(residue.pos) + xScaleBand.bandwidth(),
            padRadius: innerRadius,
            padAngle: 0.01
        })} stroke="gray" fill="gray"/>
    
    {/each}
</g>
