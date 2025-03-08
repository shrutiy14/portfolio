let data = [];
let commits = []; // Declare commits as a global variable


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
  /*
  const svg = d3
  .select('#chart')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('overflow', 'visible');*/

  const svg = d3
  .select('#chart')
  .append('svg')
  .attr('width', width) // Ensure explicit width
  .attr('height', height) // Ensure explicit height
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('overflow', 'visible');


  const xScale = d3
  .scaleTime()
  .domain(d3.extent(commits, (d) => d.datetime))
  .range([0, width])
  .nice();

  const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  const dots = svg.append('g').attr('class', 'dots');

  dots
  .selectAll('circle')
  .data(commits)
  .join('circle')
  .attr('cx', (d) => xScale(d.datetime))
  .attr('cy', (d) => yScale(d.hourFrac))
  .attr('r', 5)
  .attr('fill', 'steelblue');

}



// Trigger the data loading and processing when the document is ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
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
