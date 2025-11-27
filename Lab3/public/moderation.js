const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadPendingComments();
    setupRefreshButton();
});

function setupRefreshButton() {
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.addEventListener('click', () => {
        loadPendingComments();
    });
}

async function loadPendingComments() {
    const container = document.getElementById('pending-comments');

    try {
        const response = await fetch(`${API_BASE_URL}/comments/pending`);

        if (!response.ok) {
            throw new Error('Błąd przy pobieraniu komentarzy');
        }

        const comments = await response.json();
        displayPendingComments(comments);
    } catch (error) {
        console.error('Błąd:', error);
        container.innerHTML = '<div class="error">Nie udało się załadować komentarzy</div>';
    }
}

function displayPendingComments(comments) {
    const container = document.getElementById('pending-comments');

    if (comments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="empty-message">Brak komentarzy oczekujących na moderację</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <p class="pending-count">Komentarzy do zatwierdzenia: <strong>${comments.length}</strong></p>
        <div class="comments-grid">
            ${comments.map(comment => {
                const date = new Date(comment.created_at).toLocaleDateString('pl-PL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                return `
                    <div class="moderation-card" id="comment-${comment.id}">
                        <div class="card-header">
                            <div>
                                <strong class="comment-author">${escapeHtml(comment.author)}</strong>
                                <p class="comment-date">${date}</p>
                            </div>
                            <span class="status-badge">Oczekuje</span>
                        </div>
                        <div class="card-body">
                            <p class="post-info">Post: <a href="/post.html?id=${comment.post.id}" target="_blank">${escapeHtml(comment.post.title)}</a></p>
                            <p class="comment-text">${escapeHtml(comment.body)}</p>
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-approve" onclick="approveComment(${comment.id})">
                                Zatwierdź
                            </button>
                            <button class="btn btn-reject" onclick="rejectComment(${comment.id})" disabled>
                                Odrzuć (niedostępne)
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

async function approveComment(commentId) {
    const card = document.getElementById(`comment-${commentId}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Błąd przy zatwierdzaniu komentarza');
        }

        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';

        setTimeout(() => {
            loadPendingComments();
        }, 300);

        showNotification('Komentarz zatwierdzony', 'success');
    } catch (error) {
        console.error('Błąd:', error);
        showNotification(error.message, 'error');
    }
}

function rejectComment(commentId) {
    showNotification('Funkcja odrzucania nie jest jeszcze zaimplementowana', 'info');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
