let data = [];
let commits = []; // Declare commits as a global variable
let xScale = [];
let yScale = [];
let selectedCommits = [];  // Replace brushSelection
let commitProgress = 100;  // Default to show all commits

let timeScale;  // Will be initialized later
let commitMaxTime;
let rScale;




function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit) // Group data by commit ID
    .map(([commit, lines]) => {
      let first = lines[0]; // Get first line in commit to access shared properties
      let { author, date, time, timezone, datetime } = first;

      // Ensure datetime is a valid Date object
      let commitDate = new Date(datetime);

      let ret = {
        id: commit, // Commit ID
        url: `https://github.com/YOUR_REPO/commit/${commit}`, // GitHub commit URL
        author, // Commit author
        date, // Commit date
        time, // Commit time
        timezone, // Timezone
        datetime: commitDate, // Store as Date object
        hourFrac: commitDate.getHours() + commitDate.getMinutes() / 60, // Fractional hour of the commit
        totalLines: lines.length, // Total number of lines modified
      };

      // Hide the `lines` array from console output while keeping access
      Object.defineProperty(ret, 'lines', {
        value: lines,
        writable: false, // Prevent modification
        configurable: false, // Prevent deletion
        enumerable: false, // Hide from console.log()
      });

      return ret;
    });

    timeScale = d3.scaleTime()
    .domain([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)])
    .range([0, 100]);

   commitMaxTime = timeScale.invert(commitProgress);
}


function displayStats() {
  // Process commits first
  processCommits();

  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add more stats as needed...

  // Calculate number of files in the codebase
  const numFiles = d3.groups(data, (d) => d.file).length;
  dl.append('dt').text('Number of files');
  dl.append('dd').text(numFiles);

  // Calculate maximum file length (in lines)
  const maxFileLength = d3.max(d3.rollups(data, (v) => v.length, (d) => d.file), (d) => d[1]);
  dl.append('dt').text('Maximum file length (lines)');
  dl.append('dd').text(maxFileLength);

  // Calculate average file length (in lines)
  const avgFileLength = d3.mean(d3.rollups(data, (v) => v.length, (d) => d.file), (d) => d[1]);
  dl.append('dt').text('Average file length (lines)');
  dl.append('dd').text(avgFileLength.toFixed(2));

  // Calculate time of day when most work is done
  const workByPeriod = d3.rollups(
    data,
    (v) => v.length,
    (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
  );
  const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

  dl.append('dt').text('Most work done during');
  dl.append('dd').text(maxPeriod);
}


function createScatterplot() {
  const width = 1000;
  const height = 600;
  const margin = { top: 20, right: 30, bottom: 50, left: 60 }; // Increased bottom margin


  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };


  const svg = d3
  .select('#chart')
  .append('svg')
  .attr('width', width) // Ensure explicit width
  .attr('height', height) // Ensure explicit height
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('overflow', 'visible');


   xScale = d3
  .scaleTime()
  .domain(d3.extent(commits, (d) => d.datetime))
  .range([0, width])
  .nice();

 // const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

   yScale = d3
  .scaleLinear()
  .domain([0, 24])
  .range([usableArea.height, 0]);  // Ensure it matches the height exactly


  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  brushSelector();

  // Add gridlines BEFORE the axes
  const gridlines = svg
  .append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${usableArea.left}, 0)`);

  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));


  const dots = svg.append('g').attr('class', 'dots');

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

  rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([6, 30]); // adjust these values based on your experimentation

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  dots
  .selectAll('circle')
  .data(commits)
  .join('circle')
  .attr('cx', (d) => xScale(d.datetime))
  .attr('cy', (d) => yScale(d.hourFrac))
  .attr('r', (d) => rScale(d.totalLines))
  .style('fill-opacity', 0.5) // Add transparency for overlapping dots
  .attr('fill', 'steelblue')
  .on('mouseenter', (event, commit) => {
    d3.select(event.currentTarget)
      .classed('selected', true)  // Ensure consistency with brushing
      .style('fill-opacity', 1);

    updateTooltipContent(commit);
    updateTooltipPosition(event);
  })
  .on('mouseleave', (event, commit) => {
    d3.select(event.currentTarget)
      .classed('selected', isCommitSelected(commit))  // Restore selection state
      .style('fill-opacity', isCommitSelected(commit) ? 1 : 0.7);

    updateTooltipContent({});
  });


  const xAxis = d3.axisBottom(xScale)
  .tickFormat(d3.timeFormat('%b %d'));

  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('transform', 'rotate(-30)');

  const yAxis = d3.axisLeft(yScale)
  .tickFormat((d) => {
      if (d === 0) return "12 AM";  // Midnight
      if (d === 12) return "12 PM"; // Noon
      if (d === 24) return "12 AM"; // Midnight of next day
      return d < 12 ? `${d} AM` : `${d - 12} PM`; // Convert 13-23 to PM
  });

  // Add Y-axis to the visualization
  svg.append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);


  

}

function updateTooltipContent(commit) {
  const tooltip = document.getElementById('commit-tooltip');
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) {
    tooltip.style.visibility = 'hidden';
    return;
  }

  tooltip.style.visibility = 'visible';

  // Update content
  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
  time.textContent = commit.datetime?.toLocaleString('en', { timeStyle: 'short' });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;

  
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

let brushSelection = null;

function brushSelector() {
  const svg = document.querySelector('svg');
  //d3.select(svg).call(d3.brush());
  d3.select(svg).call(d3.brush().on('start brush end', brushed));
  d3.select(svg).selectAll('.dots, .overlay ~ *').raise();

}


function brushed(evt) {
  let brushSelection = evt.selection;
  selectedCommits = !brushSelection
    ? []
    : commits.filter((commit) => {
        let min = { x: brushSelection[0][0], y: brushSelection[0][1] };
        let max = { x: brushSelection[1][0], y: brushSelection[1][1] };
        let x = xScale(commit.datetime);
        let y = yScale(commit.hourFrac);

        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
      });

  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}





function isCommitSelected(commit) {
  return selectedCommits.includes(commit);
}

function updateSelection() {
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}



function updateSelectionCount() {
  const countElement = document.getElementById('selection-count');

  if (!countElement) return; // Ensure the element exists

  countElement.textContent = selectedCommits.length
    ? `${selectedCommits.length} commits selected`
    : 'No commits selected';
}



function updateLanguageBreakdown() {
  const container = document.getElementById('language-breakdown');
  if (!container) return; // Ensure the container exists

  // Use selected commits, or all commits if none are selected
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  if (lines.length === 0) {
    container.innerHTML = '<p>No commit details available</p>';
    return;
  }

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  container.innerHTML = '';
  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }
}

function updateCommitFilter() {
  commitMaxTime = timeScale.invert(commitProgress);
  document.getElementById("selectedTime").textContent = commitMaxTime.toLocaleString('en', { dateStyle: "long", timeStyle: "short" });

  // Filter commits based on commitMaxTime
  let filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);

  // Update scatter plot visualization
  updateScatterplot(filteredCommits);
}
/*
function updateScatterplot(filteredCommits) {
  const dots = d3.select('.dots');

  // Bind data
  let circles = dots.selectAll("circle").data(filteredCommits, d => d.id);

  // Enter new elements
  circles.enter()
      .append("circle")
      .attr("cx", d => xScale(d.datetime))
      .attr("cy", d => yScale(d.hourFrac))
      .attr("r", d => rScale(d.totalLines))
      .style("fill-opacity", 0.5)
      .attr("fill", "steelblue")
      .merge(circles) // Merge enter & update
      .transition().duration(300)
      .attr("cx", d => xScale(d.datetime))
      .attr("cy", d => yScale(d.hourFrac));

  // Remove old elements
  circles.exit().remove();
}*/

function updateScatterplot(filteredCommits) {
  const dots = d3.select('.dots');

  // ✅ Update rScale dynamically based on filtered commits
  const [minLines, maxLines] = d3.extent(filteredCommits, d => d.totalLines);
  
  if (minLines === undefined || maxLines === undefined) {
    rScale = d3.scaleSqrt().domain([1, 10]).range([6, 30]); // Default scale if no commits
  } else {
    rScale = d3.scaleSqrt()
        .domain([minLines, maxLines])
        .range([6, 30]);
  }

  console.log("Updated rScale Domain:", rScale.domain()); // Debugging log

  // Bind data
  let circles = dots.selectAll("circle")
      .data(filteredCommits, d => d.id);

  // ✅ Enter new elements with transition
  circles.enter()
      .append("circle")
      .attr("cx", d => xScale(d.datetime))
      .attr("cy", d => yScale(d.hourFrac))
      .attr("r", 0)  // ✅ Start at radius 0
      .style("fill-opacity", 0)
      .attr("fill", "steelblue")
      .call(enter => enter.transition().duration(300)  // ✅ Transition to full size
          .attr("r", d => rScale(d.totalLines))
          .style("fill-opacity", 0.5)
      )
      .merge(circles) // Merge enter & update
      .transition().duration(300)
      .attr("cx", d => xScale(d.datetime))
      .attr("cy", d => yScale(d.hourFrac))
      .attr("r", d => rScale(d.totalLines));  // ✅ Ensure radius updates dynamically

  // ✅ Remove old elements with transition
  circles.exit().transition().duration(200)
      .attr("r", 0)
      .style("fill-opacity", 0)
      .remove();
}



// Trigger the data loading and processing when the document is ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  document.getElementById("commit-slider").addEventListener("input", (event) => {
    commitProgress = +event.target.value;
    updateCommitFilter();
});

});

// Function to load and process data
async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  console.log(commits);
  displayStats();  // Display the stats
  createScatterplot(); // Create the scatterplot
}

