const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    setupFormHandlers();
});

function setupFormHandlers() {
    const toggleBtn = document.getElementById('toggle-form-btn');
    const formContainer = document.getElementById('add-post-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const postForm = document.getElementById('post-form');

    toggleBtn.addEventListener('click', () => {
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
    });

    cancelBtn.addEventListener('click', () => {
        formContainer.style.display = 'none';
        postForm.reset();
        clearMessage('post-msg');
    });

    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addPost();
    });
}

async function loadPosts() {
    const postsList = document.getElementById('posts-list');
    
    try {
        console.log('Pobieranie postów z API...');
        const response = await fetch(`${API_BASE_URL}/posts`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Błąd przy pobieraniu postów');
        }

        const posts = await response.json();
        console.log('Pobrane posty:', posts);
        displayPosts(posts);
    } catch (error) {
        console.error('Błąd:', error);
        postsList.innerHTML = '<div class="error">Nie udało się załadować postów</div>';
    }
}

function displayPosts(posts) {
    const postsList = document.getElementById('posts-list');

    if (posts.length === 0) {
        postsList.innerHTML = '<div class="empty-message">Brak przepisów. Dodaj pierwszy</div>';
        return;
    }

    postsList.innerHTML = posts.map(post => {
        const date = new Date(post.created_at).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const commentCount = post._count?.comments || 0;

        return `
            <article class="post-card">
                <h3 class="post-title">
                    <a href="/post.html?id=${post.id}">${escapeHtml(post.title)}</a>
                </h3>
                <p class="post-meta">
                    <span>${date}</span>
                    <span>${commentCount} ${commentCount === 1 ? 'komentarz' : 'komentarzy'}</span>
                </p>
                <p class="post-excerpt">${escapeHtml(truncate(post.body, 200))}</p>
                <a href="/post.html?id=${post.id}" class="read-more">Czytaj więcej</a>
            </article>
        `;
    }).join('');
}

async function addPost() {
    const title = document.getElementById('post-title').value.trim();
    const body = document.getElementById('post-body').value.trim();

    if (!title || !body) {
        showMessage('post-msg', 'Wypełnij wszystkie pola', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, body })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Błąd przy dodawaniu posta');
        }

        showMessage('post-msg', 'Produkt dodany pomyślnie', 'success');
        document.getElementById('post-form').reset();
        
        setTimeout(() => {
            document.getElementById('add-post-form').style.display = 'none';
            loadPosts();
        }, 1500);
    } catch (error) {
        console.error('Błąd:', error);
        showMessage('post-msg', error.message, 'error');
    }
}

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
}

function clearMessage(elementId) {
    const element = document.getElementById(elementId);
    element.textContent = '';
    element.className = 'message';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
