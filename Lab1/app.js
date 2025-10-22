const API_URL = 'http://localhost:3000/api';

const memberForm = document.getElementById('form-add-member');
const bookForm = document.getElementById('form-add-book');

const memberMsg = document.getElementById('member-msg');
const bookMsg = document.getElementById('book-msg');

const memberSelect = document.getElementById('member-select-dropdown');
const booksListBody = document.querySelector('#books-list tbody');
const loansListBody = document.querySelector('#loans-list tbody');

document.addEventListener('DOMContentLoaded', () => {
    fetchAllData();

    memberForm.addEventListener('submit', handleAddMember);
    bookForm.addEventListener('submit', handleAddBook);

    booksListBody.addEventListener('click', handleBookListClick);
    loansListBody.addEventListener('click', handleLoanListClick);
});

function fetchAllData() {
    loadMembers();
    loadBooks();
    loadLoans();
}

async function loadMembers() {
    try {
        const response = await fetch(`${API_URL}/members`);
        const members = await response.json();
        
        memberSelect.innerHTML = '<option value="">-- Wybierz czytelnika --</option>'; 
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = `${member.name} (${member.email})`;
            memberSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Błąd ładowania czytelników:', error);
    }
}

async function loadBooks() {
    try {
        const response = await fetch(`${API_URL}/books`);
        const books = await response.json();
        
        booksListBody.innerHTML = '';
        books.forEach(book => {
            const tr = document.createElement('tr');
            
            const isAvailable = book.available > 0;
            
            tr.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.available} / ${book.copies}</td>
                <td>
                    <button class="btn-borrow" data-book-id="${book.id}" ${!isAvailable ? 'disabled class="btn-disabled"' : ''}>
                        ${isAvailable ? 'Wypożycz' : 'Brak'}
                    </button>
                </td>
            `;
            booksListBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Błąd ładowania książek:', error);
    }
}

async function loadLoans() {
    try {
        const response = await fetch(`${API_URL}/loans`);
        const loans = await response.json();
        
        loansListBody.innerHTML = ''; 
        
        const activeLoans = loans.filter(loan => loan.return_date === null);
        
        activeLoans.forEach(loan => {
            const tr = document.createElement('tr');
            
            const dueDate = new Date(loan.due_date).toISOString().split('T')[0];
            
            tr.innerHTML = `
                <td>${loan.book.title}</td>
                <td>${loan.member.name}</td>
                <td>${dueDate}</td>
                <td>
                    <button class="btn-return" data-loan-id="${loan.id}">Zwróć</button>
                </td>
            `;
            loansListBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Błąd ładowania wypożyczeń:', error);
    }
}

async function handleAddMember(event) {
    event.preventDefault(); 
    
    const name = document.getElementById('member-name').value;
    const email = document.getElementById('member-email').value;
    
    try {
        const response = await fetch(`${API_URL}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email }),
        });
        
        if (response.ok) {
            showMessage(memberMsg, 'Dodano czytelnika!', 'success');
            memberForm.reset();
            loadMembers(); 
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Wystąpił błąd');
        }
    } catch (error) {
        showMessage(memberMsg, error.message, 'error');
    }
}

async function handleAddBook(event) {
    event.preventDefault();
    
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const copies = document.getElementById('book-copies').value;
    
    try {
        const response = await fetch(`${API_URL}/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author, copies: parseInt(copies) }),
        });
        
        if (response.ok) {
            showMessage(bookMsg, 'Dodano książkę!', 'success');
            bookForm.reset();
            loadBooks(); 
        } else {
            throw new Error('Błąd podczas dodawania książki');
        }
    } catch (error) {
        showMessage(bookMsg, error.message, 'error');
    }
}

async function handleBookListClick(event) {
    if (event.target.classList.contains('btn-borrow')) {
        const bookId = event.target.dataset.bookId;
        const memberId = memberSelect.value;
        
        if (!memberId) {
            alert('Proszę wybrać czytelnika z listy rozwijanej!');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/loans/borrow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    member_id: parseInt(memberId), 
                    book_id: parseInt(bookId) 
                }),
            });
            
            if (response.ok) {
                alert('Wypożyczono książkę!');
                loadBooks();
                loadLoans();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Nie można wypożyczyć');
            }
        } catch (error) {
            alert(`Błąd: ${error.message}`);
        }
    }
}

async function handleLoanListClick(event) {
    if (event.target.classList.contains('btn-return')) {
        const loanId = event.target.dataset.loanId;
        
        if (!confirm('Czy na pewno chcesz zwrócić tę książkę?')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/loans/return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loan_id: parseInt(loanId) }),
            });
            
            if (response.ok) {
                alert('Zwrócono książkę!');
                loadBooks();
                loadLoans();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Nie można zwrócić');
            }
        } catch (error) {
            alert(`Błąd: ${error.message}`);
        }
    }
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    setTimeout(() => {
        element.textContent = '';
        element.className = 'message';
    }, 3000); 
}