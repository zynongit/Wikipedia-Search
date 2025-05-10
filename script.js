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

