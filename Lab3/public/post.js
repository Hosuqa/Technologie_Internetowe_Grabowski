const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        window.location.href = '/';
        return;
    }

    loadPost(postId);
    loadComments(postId);
    setupCommentForm(postId);
});

async function loadPost(postId) {
    const postDetail = document.getElementById('post-detail');

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`);

        if (!response.ok) {
            throw new Error('Post nie został znaleziony');
        }

        const post = await response.json();
        displayPost(post);
    } catch (error) {
        console.error('Błąd:', error);
        postDetail.innerHTML = '<div class="error">Nie udało się załadować posta</div>';
    }
}

function displayPost(post) {
    const postDetail = document.getElementById('post-detail');
    const date = new Date(post.created_at).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    postDetail.innerHTML = `
        <article class="post-full">
            <h2 class="post-title">${escapeHtml(post.title)}</h2>
            <p class="post-meta">${date}</p>
            <div class="post-content">${escapeHtml(post.body).replace(/\n/g, '<br>')}</div>
        </article>
    `;
}

async function loadComments(postId) {
    const commentsList = document.getElementById('comments-list');

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);

        if (!response.ok) {
            throw new Error('Błąd przy pobieraniu komentarzy');
        }

        const comments = await response.json();
        displayComments(comments);
    } catch (error) {
        console.error('Błąd:', error);
        commentsList.innerHTML = '<div class="error">Nie udało się załadować komentarzy</div>';
    }
}

function displayComments(comments) {
    const commentsList = document.getElementById('comments-list');

    if (comments.length === 0) {
        commentsList.innerHTML = '<div class="empty-message">Brak zatwierdzonych komentarzy. Bądź pierwszy</div>';
        return;
    }

    commentsList.innerHTML = comments.map(comment => {
        const date = new Date(comment.created_at).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="comment">
                <div class="comment-header">
                    <strong class="comment-author">${escapeHtml(comment.author)}</strong>
                    <span class="comment-date">${date}</span>
                </div>
                <p class="comment-body">${escapeHtml(comment.body)}</p>
            </div>
        `;
    }).join('');
}

function setupCommentForm(postId) {
    const commentForm = document.getElementById('comment-form');

    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addComment(postId);
    });
}

async function addComment(postId) {
    const author = document.getElementById('comment-author').value.trim();
    const body = document.getElementById('comment-body').value.trim();

    if (!author || !body) {
        showMessage('comment-msg', 'Wypełnij wszystkie pola', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ author, body })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Błąd przy dodawaniu komentarza');
        }

        showMessage('comment-msg', 'Komentarz wysłany. Pojawi się po zatwierdzeniu przez moderatora', 'success');
        document.getElementById('comment-form').reset();

        setTimeout(() => {
            clearMessage('comment-msg');
        }, 5000);
    } catch (error) {
        console.error('Błąd:', error);
        showMessage('comment-msg', error.message, 'error');
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
