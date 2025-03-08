console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}


let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' },
    { url: 'meta/', title: 'Meta' },
    { url: 'https://github.com/shrutiy14', title: 'GitHub' },
  ];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
  
    // Adjust URL if not on the home page and URL is relative
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  
    // Create the link and add it to <nav>
    // nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
    );

    if (a.host !== location.host) {
    a.target = '_blank';
    }

    nav.append(a);

  }

let navLinks = Array.from(nav.querySelectorAll("a"));
let currentLink = navLinks.find(
  (a) => a.host === location.host && a.pathname === location.pathname
);

currentLink?.classList.add("current");

document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select>
        <option value="light dark">Automatic</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  `);




const select = document.querySelector('.color-scheme select');
function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  localStorage.colorScheme = colorScheme;
  select.value = colorScheme;
}


select.addEventListener('input', function (event) {
  console.log('color scheme changed', event.target.value);
  setColorScheme(event.target.value); 
});

if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
} else {
  setColorScheme("light dark");
}

export async function fetchJSON(url) {
  try {
      const response = await fetch(url);

      if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel ='h2') {
  // Clear the existing content of the container element
  containerElement.innerHTML = '';

  // Loop through each project to create an article element for each
  for (let project of projects) {
      // Create a new <article> element to hold the project's details
      const article = document.createElement('article');

      // Create the heading element dynamically
      const heading = document.createElement(headingLevel);
      heading.textContent = project.title;

      // Create a span for the project year
      const yearSpan = document.createElement('span');
      yearSpan.textContent = ` (${project.year})`;
      yearSpan.style.fontWeight = 'bold';
      yearSpan.style.marginLeft = '8px';
      yearSpan.style.color = '#555';

      // Wrap heading and year together in a div
      const headingContainer = document.createElement('div');
      headingContainer.appendChild(heading);
      headingContainer.appendChild(yearSpan);

      // Create an image element
      const img = document.createElement('img');
      img.src = project.image;
      img.alt = project.title;

      // Create a paragraph for the description
      const description = document.createElement('p');
      description.textContent = project.description;

      // Append all elements to the article
      article.appendChild(headingContainer);
      article.appendChild(img);
      article.appendChild(description);

      // Append the article to the container element
      containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}






