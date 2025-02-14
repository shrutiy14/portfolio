/*let data = [];

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  processCommits();
  console.log(commits);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

let commits = d3.groups(data, (d) => d.commit);*/
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
  processCommits();
  
  // For testing, print out the commits array to the console
  console.log(commits);
}

// Trigger the data loading and processing when the document is ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});
