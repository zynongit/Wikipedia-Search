document.getElementById('searchButton').addEventListener('click', searchWikipedia);

function searchWikipedia() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const resultsDiv = document.getElementById('results');
    
    if (!searchTerm) {
        resultsDiv.innerHTML = '<p>Please enter a search term</p>';
        return;
    }
    
    resultsDiv.innerHTML = '<p>Searching...</p>';
    
    // Wikipedia API endpoint
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayResults(data.query.search);
        })
        .catch(error => {
            resultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        });
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found</p>';
        return;
    }
    
    let html = '';
    results.forEach(result => {
        html += `
            <div class="result-item">
                <h3 class="result-title">${result.title}</h3>
                <p class="result-snippet">${result.snippet}</p>
                <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}" 
                   target="_blank" 
                   class="result-link">Read more on Wikipedia</a>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

// Allow search on Enter key press
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchWikipedia();
    }
});
