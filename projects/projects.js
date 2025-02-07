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
let data = [1, 2, 3, 4, 5, 5];
/*let total = 0;

for (let d of data) {
  total += d;
}
let angle = 0;
let arcData = [];

for (let d of data) {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
}*/
// Use d3.pie() to generate the start and end angles for each slice
let sliceGenerator = d3.pie();
let arcData = sliceGenerator(data);  // This generates the start and end angles

let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);

arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx));  // Fill each slice with a color
})
/*d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');*/

