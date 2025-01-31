import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `Projects Count: ${projects.length}`;

/*import { fetchJSON, renderProjects } from '../global.js';

async function loadProjects() {
    try {
        // Fetch the project data from the JSON file
        const projects = await fetchJSON('../lib/projects.json');

        // Select the container element where the projects will be displayed
        const projectsContainer = document.querySelector('.projects');

        // Render the fetched projects
        renderProjects(projects, projectsContainer, 'h2');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Call the loadProjects function to fetch and render the projects
loadProjects();
*/