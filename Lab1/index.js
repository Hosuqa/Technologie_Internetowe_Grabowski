// Plik: index.js

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Witaj w API Wypożyczalni Książek!');
});

app.get('/api/members', async (req, res) => {
  const members = await prisma.member.findMany();
  res.json(members);
});

app.post('/api/members', async (req, res) => {
  const { name, email } = req.body;

  try {
    const newMember = await prisma.member.create({
      data: {
        name: name,
        email: email,
      },
    });
    res.status(201).json(newMember);

  } catch (error) {

    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ error: 'Ten email jest już zajęty.' });
    }

    res.status(500).json({ error: 'Nie udało się dodać członka.' });

  }
});

app.post('/api/books', async (req, res) => {
  const { title, author, copies } = req.body;

  try {
    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        copies: copies ? parseInt(copies) : 1,
      },
    });
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się dodać książki.' });
  }
});

app.get('/api/books', async (req, res) => {
  try {
    const books = await prisma.$queryRaw`
      SELECT
        b.id,
        b.title,
        b.author,
        b.copies,
        (b.copies - COALESCE(
          (SELECT COUNT(*) FROM "Loan" l
           WHERE l.book_id = b.id AND l.return_date IS NULL)
        , 0)) AS available
      FROM "Book" b
    `;
    
    const result = books.map(book => ({
      ...book,
      available: Number(book.available)
    }));
    
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Błąd podczas pobierania książek.' });
  }
});

app.post('/api/loans/borrow', async (req, res) => {
  const { member_id, book_id, days } = req.body;

  if (!member_id || !book_id) {
    return res.status(400).json({ error: 'Missing member_id or book_id' });
  }

  try {
    const newLoan = await prisma.$transaction(async (tx) => {

      const book = await tx.book.findUnique({
        where: { id: parseInt(book_id) },
        select: { copies: true }, 
      });

      if (!book) {
        throw new Error('Książka nie znaleziona'); 
      }

      const activeLoanCount = await tx.loan.count({
        where: {
          book_id: parseInt(book_id),
          return_date: null, 
        },
      });

      if (activeLoanCount >= book.copies) {
        throw new Error('Brak wolnych egzemplarzy'); 
      }

      const loan_date = new Date();
      const due_date = new Date();

      due_date.setDate(loan_date.getDate() + (days ? parseInt(days) : 14));

      const loan = await tx.loan.create({
        data: {
          member_id: parseInt(member_id),
          book_id: parseInt(book_id),
          loan_date,
          due_date,
        },
      });

      return loan;
    });

    res.status(201).json(newLoan);

  } catch (error) {
    if (error.message === 'Brak wolnych egzemplarzy') {
      return res.status(409).json({ error: error.message });
    }
    if (error.message === 'Książka nie znaleziona') {
      return res.status(404).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Wystąpił błąd podczas wypożyczania.' });
  }
});

app.post('/api/loans/return', async (req, res) => {
  const { loan_id } = req.body;

  if (!loan_id) {
    return res.status(400).json({ error: 'Missing loan_id' });
  }
  
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: parseInt(loan_id) },
    });

    if (!loan) {
      return res.status(404).json({ error: 'Nie znaleziono wypożyczenia.' });
    }

    if (loan.return_date !== null) {
      return res.status(409).json({ error: 'Książka została już zwrócona.' });
    }

    const updatedLoan = await prisma.loan.update({
      where: { id: parseInt(loan_id) },
      data: { return_date: new Date() },
    });

    res.status(200).json(updatedLoan);

  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas zwracania książki.' });
  }
});

app.get('/api/loans', async (req, res) => {
  try {
    const loans = await prisma.loan.findMany({
      include: {
        member: {
          select: { name: true, email: true }, 
        },
        book: {
          select: { title: true },
        },
      },
      orderBy: {
        loan_date: 'desc',
      }
    });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: 'Błąd podczas pobierania wypożyczeń.' });
  }
});

app.listen(PORT, () => {
  console.log(`Uruchomiony http://localhost:${PORT}`);
});