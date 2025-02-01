import { fetchJSON, renderProjects, fetchGitHubData} from './global.js';
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');
renderProjects(latestProjects, projectsContainer, 'h2');
//const githubData = await fetchGitHubData('shrutiy14');
//console.log('GitHub Data:', githubData);

const profileStats = document.querySelector('#profile-stats');
const githubData = await fetchGitHubData('shrutiy14');
console.log('GitHub Data:', githubData); // Debugging log
if (profileStats) {
    profileStats.innerHTML = `
          <dl class="profile-grid">
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers:</dt><dd>${githubData.followers}</dd>
            <dt>Following:</dt><dd>${githubData.following}</dd>
          </dl>
      `;
  }
  console.log('Profile Stats:', profileStats);

/*
// Fetch GitHub data and ensure it's displayed only after data is retrieved
async function loadGitHubData() {
    const profileStats = document.querySelector('#profile-stats');
    //console.log('Profile Stats:', profileStats);
    const githubData = await fetchGitHubData('shrutiy14');

    console.log('GitHub Data:', githubData); // Debugging log


    if (profileStats) {
        profileStats.innerHTML = `
              <dl>
                <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
                <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
                <dt>Followers:</dt><dd>${githubData.followers}</dd>
                <dt>Following:</dt><dd>${githubData.following}</dd>
              </dl>
          `;
      }
      console.log('Profile Stats:', profileStats);
}

loadGitHubData();*/

