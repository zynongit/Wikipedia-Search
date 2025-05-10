// Elementos DOM
const searchButton = document.getElementById('searchButton');
const backButton = document.getElementById('backButton');
const searchInput = document.getElementById('searchInput');
const languageSelect = document.getElementById('languageSelect');
const searchResults = document.getElementById('searchResults');
const articleContent = document.getElementById('articleContent');
const articleTitle = document.getElementById('articleTitle');
const articleText = document.getElementById('articleText');

// Event Listeners
searchButton.addEventListener('click', searchWikipedia);
backButton.addEventListener('click', showResults);
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchWikipedia();
});

// Variável para armazenar o idioma atual
let currentLanguage = languageSelect.value;

// Observar mudanças no seletor de idioma
languageSelect.addEventListener('change', function() {
    currentLanguage = this.value;
    // Atualiza o placeholder conforme o idioma selecionado
    searchInput.placeholder = `Search ${this.options[this.selectedIndex].text} Wikipedia...`;
});

function searchWikipedia() {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        searchResults.innerHTML = '<p>Please enter a search term</p>';
        return;
    }
    
    searchResults.innerHTML = '<p>Searching...</p>';
    
    const searchUrl = `https://${currentLanguage}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*`;
    
    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error.info);
            }
            displayResults(data.query.search);
        })
        .catch(error => {
            searchResults.innerHTML = `<p>Error: ${error.message}</p>`;
        });
}

function displayResults(results) {
    if (results.length === 0) {
        searchResults.innerHTML = '<p>No results found</p>';
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
    
    searchResults.innerHTML = html;
    
    document.querySelectorAll('.view-article').forEach(button => {
        button.addEventListener('click', function() {
            const title = this.parentElement.getAttribute('data-title');
            loadArticle(title);
        });
    });
}

function loadArticle(title) {
    searchResults.style.display = 'none';
    articleContent.style.display = 'block';
    articleTitle.textContent = title;
    articleText.innerHTML = '<p>Loading article...</p>';
    
    const articleUrl = `https://${currentLanguage}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&origin=*`;
    
    fetch(articleUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error.info);
            }
            
            articleText.innerHTML = data.parse.text['*'];
            cleanArticleContent();
            setupInternalLinks();
        })
        .catch(error => {
            articleText.innerHTML = `<p>Error loading article: ${error.message}</p>`;
        });
}

function cleanArticleContent() {
    // Remove elementos indesejados
    const unwantedSelectors = [
        '.infobox', '.navbox', '.metadata', '.hatnote', 
        '.mw-editsection', '.reference', '.mw-empty-elt'
    ];
    
    unwantedSelectors.forEach(selector => {
        articleText.querySelectorAll(selector).forEach(el => el.remove());
    });
}

function setupInternalLinks() {
    const links = articleText.querySelectorAll('a');
    
    links.forEach(link => {
        // Verifica se é um link interno da Wikipedia
        if (link.href.includes(`https://${currentLanguage}.wikipedia.org/wiki/`)) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const articlePath = this.href.split(`https://${currentLanguage}.wikipedia.org/wiki/`)[1];
                loadArticle(decodeURIComponent(articlePath));
            });
        } else {
            // Links externos abrem em nova aba
            link.target = '_blank';
        }
    });
}

function showResults() {
    searchResults.style.display = 'block';
    articleContent.style.display = 'none';
    // Rolagem suave para o topo dos resultados
    window.scrollTo({ top: 0, behavior: 'smooth' });
}Results').style.display = 'block';
    document.getElementById('articleContent').style.display = 'none';
}
