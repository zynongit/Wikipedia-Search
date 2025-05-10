document.getElementById('searchButton').addEventListener('click', searchWikipedia);
document.getElementById('backButton').addEventListener('click', showResults);

// Permitir busca com Enter
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchWikipedia();
    }
});

function searchWikipedia() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const resultsDiv = document.getElementById('searchResults');
    
    if (!searchTerm) {
        resultsDiv.innerHTML = '<p>Please enter a search term</p>';
        return;
    }
    
    resultsDiv.innerHTML = '<p>Searching...</p>';
    
    // Wikipedia API para busca
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*`;
    
    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            displayResults(data.query.search);
        })
        .catch(error => {
            resultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        });
}

function displayResults(results) {
    const resultsDiv = document.getElementById('searchResults');
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found</p>';
        return;
    }
    
    let html = '<h2>Search Results</h2>';
    results.forEach(result => {
        html += `
            <div class="result-item" data-title="${result.title}">
                <h3 class="result-title">${result.title}</h3>
                <p class="result-snippet">${result.snippet}</p>
                <button class="view-article">View Article</button>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
    
    // Adicionar event listeners aos botões
    document.querySelectorAll('.view-article').forEach(button => {
        button.addEventListener('click', function() {
            const title = this.parentElement.getAttribute('data-title');
            loadArticle(title);
        });
    });
}

function loadArticle(title) {
    const articleContentDiv = document.getElementById('articleContent');
    const articleTitle = document.getElementById('articleTitle');
    const articleText = document.getElementById('articleText');
    const resultsDiv = document.getElementById('searchResults');
    
    resultsDiv.style.display = 'none';
    articleContentDiv.style.display = 'block';
    articleTitle.textContent = title;
    articleText.innerHTML = '<p>Loading article...</p>';
    
    // Wikipedia API para conteúdo do artigo
    const articleUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&origin=*`;
    
    fetch(articleUrl)
        .then(response => response.json())
        .then(data => {
            articleText.innerHTML = data.parse.text['*'];
            
            // Remover elementos indesejados (como tabelas de navegação)
            const unwantedElements = articleText.querySelectorAll('.infobox, .navbox, .metadata, .hatnote');
            unwantedElements.forEach(el => el.remove());
            
            // Corrigir links para abrir na mesma página
            const links = articleText.querySelectorAll('a');
            links.forEach(link => {
                if (link.href.includes('/wiki/')) {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        const articleTitle = this.href.split('/wiki/')[1];
                        loadArticle(decodeURIComponent(articleTitle));
                    });
                } else {
                    link.target = '_blank';
                }
            });
        })
        .catch(error => {
            articleText.innerHTML = `<p>Error loading article: ${error.message}</p>`;
        });
}

function showResults() {
    document.getElementById('searchResults').style.display = 'block';
    document.getElementById('articleContent').style.display = 'none';
}
