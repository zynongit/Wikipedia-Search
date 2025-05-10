// Elementos DOM
const searchButton = document.getElementById('searchButton');
const backButton = document.getElementById('backButton');
const searchInput = document.getElementById('searchInput');
const languageSelect = document.getElementById('languageSelect');
const searchResults = document.getElementById('searchResults');
const articleContent = document.getElementById('articleContent');
const articleTitle = document.getElementById('articleTitle');
const articleText = document.getElementById('articleText');

// Configuração inicial
let currentLanguage = languageSelect.value;
updatePlaceholder();

// Event Listeners
searchButton.addEventListener('click', searchWikipedia);
backButton.addEventListener('click', showResults);
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchWikipedia();
});
languageSelect.addEventListener('change', function() {
    currentLanguage = this.value;
    updatePlaceholder();
});

function updatePlaceholder() {
    const languageName = languageSelect.options[languageSelect.selectedIndex].text;
    searchInput.placeholder = `Pesquisar na Wikipedia ${languageName}...`;
}

function searchWikipedia() {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        searchResults.innerHTML = '<p>Por favor, digite um termo para pesquisar</p>';
        return;
    }
    
    searchResults.innerHTML = '<p>Pesquisando...</p>';
    
    const searchUrl = `https://${currentLanguage}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*&srlimit=10`;
    
    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error.info);
            }
            displayResults(data.query.search);
        })
        .catch(error => {
            searchResults.innerHTML = `<p>Erro: ${error.message}</p>`;
            console.error('Search error:', error);
        });
}

function displayResults(results) {
    if (!results || results.length === 0) {
        searchResults.innerHTML = '<p>Nenhum resultado encontrado</p>';
        return;
    }
    
    let html = '<h2>Resultados da Pesquisa</h2>';
    results.forEach(result => {
        let snippet = result.snippet;
        
        // Corrige snippets que aparecem em inglês
        if (currentLanguage !== 'en' && (snippet.includes('may refer to:') || snippet.match(/<span class="searchmatch">[a-zA-Z]+<\/span>/))) {
            snippet = '(Clique para ver o artigo completo)';
        }
        
        // Remove tags HTML do snippet
        snippet = snippet.replace(/<[^>]*>/g, '');
        
        html += `
            <div class="result-item" data-title="${result.title}">
                <h3 class="result-title">${result.title}</h3>
                <p class="result-snippet">${snippet}</p>
                <button class="view-article">Ver Artigo</button>
            </div>
        `;
    });
    
    searchResults.innerHTML = html;
    
    // Adicionar event listeners aos botões
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
    articleText.innerHTML = '<p>Carregando artigo...</p>';
    
    const articleUrl = `https://${currentLanguage}.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&format=json&origin=*&uselang=${currentLanguage}`;
    
    fetch(articleUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                if (data.error.code === 'missingtitle') {
                    return loadDisambiguationPage(title);
                }
                throw new Error(data.error.info);
            }
            
            articleText.innerHTML = data.parse.text['*'];
            cleanArticleContent();
            setupInternalLinks();
        })
        .catch(error => {
            articleText.innerHTML = `<p>Erro ao carregar artigo: ${error.message}</p>`;
            console.error('Article load error:', error);
        });
}

function loadDisambiguationPage(title) {
    const disambigUrl = `https://${currentLanguage}.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=links&pllimit=500&format=json&origin=*`;
    
    fetch(disambigUrl)
        .then(response => response.json())
        .then(data => {
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pages[pageId].links && pages[pageId].links.length > 0) {
                let html = '<h3>Pode se referir a:</h3><ul>';
                pages[pageId].links.forEach(link => {
                    html += `<li><a href="#" class="disambig-link" data-title="${link.title}">${link.title}</a></li>`;
                });
                html += '</ul>';
                articleText.innerHTML = html;
                
                document.querySelectorAll('.disambig-link').forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        loadArticle(this.getAttribute('data-title'));
                    });
                });
            } else {
                throw new Error('Artigo não encontrado no idioma selecionado');
            }
        })
        .catch(error => {
            articleText.innerHTML = `<p>Erro: ${error.message}</p>`;
        });
}

function cleanArticleContent() {
    // Remove elementos indesejados
    const unwantedSelectors = [
        '.infobox', '.navbox', '.metadata', '.hatnote', 
        '.mw-editsection', '.reference', '.mw-empty-elt',
        '.mw-redirect', '.nomobile'
    ];
    
    unwantedSelectors.forEach(selector => {
        const elements = articleText.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });
}

function setupInternalLinks() {
    const links = articleText.querySelectorAll('a');
    
    links.forEach(link => {
        if (link.href.includes(`https://${currentLanguage}.wikipedia.org/wiki/`)) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const articlePath = this.href.split(`https://${currentLanguage}.wikipedia.org/wiki/`)[1];
                loadArticle(decodeURIComponent(articlePath));
            });
        } else {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
    });
}

function showResults() {
    searchResults.style.display = 'block';
    articleContent.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
