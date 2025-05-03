function showSection(sectionId) {
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
    });
    
    // Show the selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to the clicked nav link
    document.querySelector(`nav a[onclick="showSection('${sectionId}')"]`).classList.add('active');

    // If showing thoughts section, reset to thoughts list
    if (sectionId === 'thoughts') {
        document.getElementById('thoughts-list').classList.remove('hidden');
        document.getElementById('thought-content').classList.remove('active');
        document.querySelector('.thoughts-title').classList.remove('hidden');
    }
}


function showThought(thoughtId) {
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
    // First, load all thought files
    fetch('assets/blogs/manifest.json')
        .then(response => response.json())
        .then(links => {
            console.log('Manifest loaded:', links); // Log the manifest data
            // Create thought elements
            const thoughtsList = document.getElementById('thoughts-list');
            links.forEach(thoughtId => {
                fetch(`assets/blogs/${thoughtId}`)
                    .then(response => response.text())
                    .then(html => {
                        console.log(`Loaded ${thoughtId}`); // Log each HTML file
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const title = doc.querySelector('h1')?.textContent || 'No title'; // Use optional chaining to avoid errors
                        const date = doc.querySelector('.thought-date')?.textContent || 'No date'; // Handle missing date gracefully
                        
                        const thoughtDiv = document.createElement('div');
                        thoughtDiv.className = 'thought';
                        thoughtDiv.innerHTML = `
                            <div class="thought-title" onclick="showThought('${thoughtId}')">
                                <span class="thought-title-content">${title}</span>
                                <span class="thought-date">${date}</span>
                            </div>
                        `;
                        
                        // Log the thoughtDiv content before appending
                        console.log('Appending thought div:', thoughtDiv);
                        
                        thoughtsList.appendChild(thoughtDiv);
                    })
                    .catch(error => {
                        console.error(`Error fetching thought: ${thoughtId}`, error);
                    });
            });
        })
        .catch(error => {
            console.error('Error loading manifest:', error);
        });
});


// Load tutorials when the page loads
window.addEventListener('load', () => {
    // First, load all tutorial files
    fetch('assets/notebooks/manifest.json')
        .then(response => response.json())  // Parse as JSON directly
        .then(data => {
            // The manifest is already parsed as a JSON object
            const links = data; // Assuming 'data' is an array of file names

            // Create tutorial elements
            const tutorialsList = document.getElementById('tutorials-list');
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
                        tutorialsList.appendChild(tutorialDiv);
                    })
                    .catch(error => {
                        console.error(`Error loading tutorial: ${tutorialUrl}`, error);
                    });
            });
        })
        .catch(error => {
            console.error('Error loading manifest:', error);
        });
});
