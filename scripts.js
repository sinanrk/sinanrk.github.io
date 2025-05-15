function showSection(sectionId, updateHistory = true) {
    // Create and show transition bar
    const bar = document.createElement('div');
    bar.className = 'transition-bar';
    document.body.appendChild(bar);

    // Animate bar with random segments
    let width = 0;
    const segments = Math.floor(Math.random() * 3) + 3; // 3-5 segments
    const segmentWidth = 100 / segments;
    
    const animateBar = () => {
        if (width < 100) {
            width += segmentWidth;
            bar.style.width = width + '%';
            setTimeout(animateBar, Math.random() * 200 + 100); // Random delay between 100-300ms
        } else {
            bar.remove();
        }
    };
    
    animateBar();

    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav links
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        link.blur(); // Remove focus to fix mobile hover issue
    });

    // Show the selected section
    document.getElementById(sectionId).classList.add('active');

    // Add active class to the clicked nav link
    document.querySelector(`nav a[onclick="showSection('${sectionId}')"]`)?.classList.add('active');

    // If showing the thoughts section, reset to the thoughts list
    if (sectionId === 'thoughts') {
        document.getElementById('thoughts-list').classList.remove('hidden');
        document.getElementById('thought-content').classList.remove('active');
        document.querySelector('.thoughts-title').classList.remove('hidden');
    }

    // Update browser history
    if (updateHistory) {
        history.pushState({ sectionId }, '', `#${sectionId}`);
    }
}

// Handle browser back/forward button
window.addEventListener('popstate', (event) => {
    const sectionId = event.state?.sectionId || 'about'; // Default to "about" section
    showSection(sectionId, false); // Do not update history again
});

// Initialize the correct section on page load
document.addEventListener('DOMContentLoaded', () => {
    const initialSectionId = location.hash.replace('#', '') || 'about'; // Default to "about" section
    showSection(initialSectionId, false); // Do not update history on initial load
});


// edited above **********

function showThought(thoughtId) {
    // Push the thoughts section to the history stack before navigating to the thought
    history.pushState({ sectionId: 'thoughts' }, '', '#thoughts');

    // Hide thoughts list and title
    document.getElementById('thoughts-list').classList.add('hidden');
    document.querySelector('.thoughts-title').classList.add('hidden');
    
    // Load and show thought content
    fetch(`assets/blogs/${thoughtId}`)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const content = doc.querySelector('.thought-content');
            const date = doc.querySelector('.thought-date').textContent;
            
            // Update the date in the list view
            const thoughtTitle = document.querySelector(`.thought-title[onclick="showThought('${thoughtId}')"]`);
            const dateSpan = thoughtTitle.querySelector('.thought-date');
            dateSpan.textContent = date;
            
            document.getElementById('thought-content').innerHTML = content.innerHTML;
            document.getElementById('thought-content').classList.add('active');
        });
}

// Load thoughts when the page loads
window.addEventListener('load', () => {
    fetch('assets/blogs/manifest.json')
        .then(response => response.json())
        .then(links => {
            const thoughtsList = document.getElementById('thoughts-list');
            
            // Create an array to hold all thought elements
            const thoughtElements = [];
            let loadedCount = 0;
            
            links.forEach(thoughtId => {
                fetch(`assets/blogs/${thoughtId}`)
                    .then(response => response.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const title = doc.querySelector('h1')?.textContent || 'No title';
                        const date = doc.querySelector('.thought-date')?.textContent || 'No date';
                        
                        const thoughtDiv = document.createElement('div');
                        thoughtDiv.className = 'thought';
                        thoughtDiv.innerHTML = `
                            <div class="thought-title" onclick="showThought('${thoughtId}')">
                                <span class="thought-title-content">${title}</span>
                                <span class="thought-date">${date}</span>
                            </div>
                        `;
                        
                        // Store the element with its index
                        thoughtElements.push({
                            index: links.indexOf(thoughtId),
                            element: thoughtDiv
                        });
                        
                        loadedCount++;
                        
                        // When all thoughts are loaded, sort and append them
                        if (loadedCount === links.length) {
                            thoughtElements.sort((a, b) => a.index - b.index);
                            thoughtElements.forEach(item => thoughtsList.appendChild(item.element));
                        }
                    })
                    .catch(error => console.error(`Error fetching thought: ${thoughtId}`, error));
            });
        })
        .catch(error => console.error('Error loading manifest:', error));
});


// Load tutorials when the page loads
window.addEventListener('load', () => {
    fetch('assets/notebooks/manifest.json')
        .then(response => response.json())
        .then(links => {
            const tutorialsList = document.getElementById('tutorials-list');
            
            // Create an array to hold all tutorial elements
            const tutorialElements = [];
            let loadedCount = 0;
            
            links.forEach(link => {
                const tutorialUrl = `assets/notebooks/${link}`;
                fetch(tutorialUrl)
                    .then(response => response.text())
                    .then(tutorialHtml => {
                        const parser = new DOMParser();
                        const tutorialDoc = parser.parseFromString(tutorialHtml, 'text/html');
                        const title = tutorialDoc.querySelector('title')?.textContent || link.replace('.html', '');

                        const tutorialDiv = document.createElement('div');
                        tutorialDiv.className = 'tutorial';
                        tutorialDiv.innerHTML = `
                            <a href="${tutorialUrl}" class="tutorial-title" target="_blank">${title}</a>
                        `;
                        
                        // Store the element with its index
                        tutorialElements.push({
                            index: links.indexOf(link),
                            element: tutorialDiv
                        });
                        
                        loadedCount++;
                        
                        // When all tutorials are loaded, sort and append them
                        if (loadedCount === links.length) {
                            tutorialElements.sort((a, b) => a.index - b.index);
                            tutorialElements.forEach(item => tutorialsList.appendChild(item.element));
                        }
                    })
                    .catch(error => console.error(`Error loading tutorial: ${tutorialUrl}`, error));
            });
        })
        .catch(error => console.error('Error loading manifest:', error));
});
