let data = [];
let commits = []; // Declare commits as a global variable

// Function to process commit data
function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit) // Group data by commit ID
    .map(([commit, lines]) => {
      let first = lines[0]; // Get the first line in the commit to access shared properties
      let { author, date, time, timezone, datetime } = first;

      // Create an object to store the commit data
      let ret = {
        id: commit, // Commit ID
        url: 'https://github.com/YOUR_REPO/commit/' + commit, // URL for the commit on GitHub
        author, // Commit author
        date, // Commit date
        time, // Commit time
        timezone, // Timezone of the commit
        datetime, // Full datetime of the commit
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60, // Fractional hour of the commit
        totalLines: lines.length, // Total number of lines modified by this commit
      };

      // Define the original lines as a hidden property
      Object.defineProperty(ret, 'lines', {
        value: lines, // The lines modified in this commit
        writable: false, // Make it read-only
        enumerable: false, // Don't display in console or object iteration
        configurable: false, // Don't allow changes to this property
      });

      return ret; // Return the processed commit object
    });
}

function displayStats() {
    // Process commits first
    processCommits();
  
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Add total LOC (lines of code)
    const totalLOC = d3.sum(data, (d) => d.length); // Summing the line lengths across all data
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(totalLOC);
  
    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    // ADD AGGREGATES OVER THE WHOLE DATASET

    // Average line length
    const avgLineLength = d3.mean(data, (d) => d.length);
    dl.append('dt').text('Average line length');
    dl.append('dd').text(avgLineLength.toFixed(2));

    // Longest line length
    const longestLine = d3.max(data, (d) => d.length);
    dl.append('dt').text('Longest line length');
    dl.append('dd').text(longestLine);

    // Maximum depth
    const maxDepth = d3.max(data, (d) => d.depth);
    dl.append('dt').text('Maximum depth');
    dl.append('dd').text(maxDepth);

    // Average depth
    const avgDepth = d3.mean(data, (d) => d.depth);
    dl.append('dt').text('Average depth');
    dl.append('dd').text(avgDepth.toFixed(2));

    // ADD NUMBER OF DISTINCT VALUES
    dl.append('dt').text('Number of files');
    dl.append('dd').text(d3.group(data, (d) => d.file).size);

    // Add the Longest file (max lines)
    const maxFileLength = d3.max(data, (d) => d.line);
    dl.append('dt').text('Longest file (max lines)');
    dl.append('dd').text(maxFileLength);

    // Average file length (in lines)
    const fileLengths = d3.rollups(
        data,
        (v) => d3.max(v, (d) => d.line),
        (d) => d.file
    );
    const avgFileLength = d3.mean(fileLengths, (d) => d[1]);
    dl.append('dt').text('Average file length (in lines)');
    dl.append('dd').text(Math.round(avgFileLength));

    dl.append('dt').text('Most active time of day');
    dl.append('dd').text(d3.greatest(d3.rollups(data, v => v.length, d => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })), d => d[1])?.[0]);
}

  

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

  // After loading and processing data, run processCommits to compute commit data
  //processCommits();
  displayStats();  // Call displayStats to show the stats
  
  // For testing, print out the commits array to the console
  //console.log(commits);
}

// Trigger the data loading and processing when the document is ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});
