const API_BASE_URL = 'http://localhost:3000/api';

let selectedMovieRatings = {};

document.addEventListener('DOMContentLoaded', () => {
    loadMovies();
    loadYears();
    setupFormHandlers();
});

function setupFormHandlers() {
    const movieForm = document.getElementById('add-movie-form');
    const yearFilter = document.getElementById('year-filter');

    movieForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addMovie();
    });

    yearFilter.addEventListener('change', () => {
        loadMovies();
    });
}

async function loadYears() {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/years`);
        if (!response.ok) throw new Error('Błąd przy pobieraniu lat');

        const years = await response.json();
        const yearFilter = document.getElementById('year-filter');

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Błąd:', error);
    }
}

async function loadMovies() {
    const moviesList = document.getElementById('movies-list');
    const yearFilter = document.getElementById('year-filter');
    const year = yearFilter.value;

    try {
        moviesList.innerHTML = '<div class="loading">Ładowanie filmów...</div>';

        const url = year 
            ? `${API_BASE_URL}/movies?year=${year}`
            : `${API_BASE_URL}/movies`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Błąd przy pobieraniu filmów');

        const movies = await response.json();
        displayMovies(movies);
    } catch (error) {
        console.error('Błąd:', error);
        moviesList.innerHTML = '<div class="error">Nie udało się załadować filmów</div>';
    }
}

function displayMovies(movies) {
    const moviesList = document.getElementById('movies-list');

    if (movies.length === 0) {
        moviesList.innerHTML = '<div class="empty-message">Brak filmów. Dodaj pierwszy!</div>';
        return;
    }

    moviesList.innerHTML = movies.map(movie => {
        const avgScore = movie.avg_score > 0 ? movie.avg_score.toFixed(2) : 'Brak';
        const votesText = movie.votes === 1 ? 'głos' : movie.votes < 5 ? 'głosy' : 'głosów';

        return `
            <div class="movie-card">
                <div class="movie-header">
                    <div class="movie-info">
                        <h3>${escapeHtml(movie.title)}</h3>
                        <p class="movie-year">Rok: ${movie.year}</p>
                    </div>
                    <div class="movie-stats">
                        <div class="avg-score">${avgScore}</div>
                        <div class="votes-count">${movie.votes} ${votesText}</div>
                    </div>
                </div>
                <div class="rating-section">
                    <h4>Oceń ten film:</h4>
                    <div class="rating-form">
                        <div class="rating-stars" data-movie-id="${movie.id}">
                            ${[1, 2, 3, 4, 5].map(score => `
                                <button class="star-btn" data-score="${score}" onclick="selectRating(${movie.id}, ${score})">
                                    ★
                                </button>
                            `).join('')}
                        </div>
                        <button class="submit-rating" onclick="submitRating(${movie.id})" disabled>
                            Wyślij ocenę
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function selectRating(movieId, score) {
    selectedMovieRatings[movieId] = score;

    const starsContainer = document.querySelector(`.rating-stars[data-movie-id="${movieId}"]`);
    const stars = starsContainer.querySelectorAll('.star-btn');
    const submitBtn = starsContainer.parentElement.querySelector('.submit-rating');

    stars.forEach((star, index) => {
        if (index < score) {
            star.classList.add('selected');
        } else {
            star.classList.remove('selected');
        }
    });

    submitBtn.disabled = false;
}

async function submitRating(movieId) {
    const score = selectedMovieRatings[movieId];

    if (!score) {
        alert('Wybierz ocenę');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/ratings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ movie_id: movieId, score })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Błąd przy dodawaniu oceny');
        }

        delete selectedMovieRatings[movieId];

        await loadMovies();

        showTemporaryMessage('Ocena została dodana!', 'success');
    } catch (error) {
        console.error('Błąd:', error);
        alert(error.message);
    }
}

async function addMovie() {
    const title = document.getElementById('movie-title').value.trim();
    const year = parseInt(document.getElementById('movie-year').value);

    if (!title || !year) {
        showMessage('movie-msg', 'Wypełnij wszystkie pola', 'error');
        return;
    }

    if (year < 1888 || year > 2100) {
        showMessage('movie-msg', 'Podaj prawidłowy rok (1888-2100)', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/movies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, year })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Błąd przy dodawaniu filmu');
        }

        showMessage('movie-msg', 'Film dodany pomyślnie!', 'success');
        document.getElementById('add-movie-form').reset();

        await loadMovies();
        await loadYears();
    } catch (error) {
        console.error('Błąd:', error);
        showMessage('movie-msg', error.message, 'error');
    }
}

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;

    setTimeout(() => {
        element.textContent = '';
        element.className = 'message';
    }, 3000);
}

function showTemporaryMessage(message, type) {
    const container = document.querySelector('.container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '100px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.zIndex = '1000';
    messageDiv.style.minWidth = '300px';

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
