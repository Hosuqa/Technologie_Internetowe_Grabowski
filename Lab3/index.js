const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { comments: { where: { approved: 1 } } }
        }
      }
    });
    res.json(posts);
  } catch (error) {
    console.error('Błąd przy pobieraniu postów:', error);
    res.status(500).json({ error: 'Nie udało się pobrać postów' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Tytuł i treść są wymagane' });
    }

    const newPost = await prisma.post.create({
      data: { title, body }
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Błąd przy tworzeniu posta:', error);
    res.status(500).json({ error: 'Nie udało się utworzyć posta' });
  }
});

app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID posta' });
    }

    const comments = await prisma.comment.findMany({
      where: {
        post_id: postId,
        approved: 1
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(comments);
  } catch (error) {
    console.error('Błąd przy pobieraniu komentarzy:', error);
    res.status(500).json({ error: 'Nie udało się pobrać komentarzy' });
  }
});

app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { author, body } = req.body;

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID posta' });
    }

    if (!author || !body) {
      return res.status(400).json({ error: 'Autor i treść są wymagane' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post nie istnieje' });
    }

    const newComment = await prisma.comment.create({
      data: {
        post_id: postId,
        author,
        body,
        approved: 0
      }
    });

    res.status(201).json({ ...newComment, approved: 0 });
  } catch (error) {
    console.error('Błąd przy dodawaniu komentarza:', error);
    res.status(500).json({ error: 'Nie udało się dodać komentarza' });
  }
});

app.get('/api/comments/pending', async (req, res) => {
  try {
    const pendingComments = await prisma.comment.findMany({
      where: { approved: 0 },
      orderBy: { created_at: 'desc' },
      include: {
        post: {
          select: { id: true, title: true }
        }
      }
    });

    res.json(pendingComments);
  } catch (error) {
    console.error('Błąd przy pobieraniu oczekujących komentarzy:', error);
    res.status(500).json({ error: 'Nie udało się pobrać komentarzy' });
  }
});

app.post('/api/comments/:id/approve', async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);

    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID komentarza' });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Komentarz nie istnieje' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { approved: 1 }
    });

    res.status(200).json(updatedComment);
  } catch (error) {
    console.error('Błąd przy zatwierdzaniu komentarza:', error);
    res.status(500).json({ error: 'Nie udało się zatwierdzić komentarza' });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID posta' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post nie istnieje' });
    }

    res.json(post);
  } catch (error) {
    console.error('Błąd przy pobieraniu posta:', error);
    res.status(500).json({ error: 'Nie udało się pobrać posta' });
  }
});

app.listen(PORT, () => {
  console.log(`Serwer uruchomiony na http://localhost:${PORT}`);
});
