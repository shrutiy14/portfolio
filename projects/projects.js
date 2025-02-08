import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
console.log(d3); // This should print the d3 object in the console
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `Projects Count: ${projects.length}`;

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let arc = arcGenerator({
        startAngle: 0,
        endAngle: 2 * Math.PI
});
/*let data = [1, 2, 3, 4, 5, 5];*/
let data = [
    { value: 1, label: 'apples' },
    { value: 2, label: 'oranges' },
    { value: 3, label: 'mangos' },
    { value: 4, label: 'pears' },
    { value: 5, label: 'limes' },
    { value: 5, label: 'cherries' },
  ];
let sliceGenerator = d3.pie().value((d) => d.value);
/*let sliceGenerator = d3.pie();*/
let arcData = sliceGenerator(data);  // This generates the start and end angles

let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);

arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));  // Fill each slice with a color
})

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .attr('class', 'legend-item')
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
})
/*d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');*/

