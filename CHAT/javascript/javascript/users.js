const searchBar = document.querySelector(".users .search input"),
searchBtn = document.querySelector(".users .search button"),
themeToggle = document.getElementById('themeToggle');

searchBtn.onclick = ()=>{
    searchBar.classList.toggle("active");
    searchBar.focus();
    searchBtn.classList.toggle("active");
}

// Theme Management
let currentTheme = localStorage.getItem('chatTheme') || 'light';
applyTheme(currentTheme);

themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('chatTheme', currentTheme);
});

function applyTheme(theme) {
    document.body.className = theme + '-theme';
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}