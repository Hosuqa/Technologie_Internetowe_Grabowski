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

app.get('/api/movies', async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

    const whereClause = year ? { year } : {};

    const movies = await prisma.movie.findMany({
      where: whereClause,
      include: {
        ratings: {
          select: { score: true }
        }
      }
    });

    const moviesWithStats = movies.map(movie => {
      const votes = movie.ratings.length;
      const avg_score = votes > 0
        ? (movie.ratings.reduce((sum, r) => sum + r.score, 0) / votes).toFixed(2)
        : '0.00';

      return {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        avg_score: parseFloat(avg_score),
        votes
      };
    });

    moviesWithStats.sort((a, b) => b.avg_score - a.avg_score);

    const result = limit ? moviesWithStats.slice(0, limit) : moviesWithStats;

    res.json(result);
  } catch (error) {
    console.error('Błąd przy pobieraniu filmów:', error);
    res.status(500).json({ error: 'Nie udało się pobrać filmów' });
  }
});

app.get('/api/movies/top', async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    req.query.limit = limit.toString();
    if (year) req.query.year = year.toString();

    return app._router.handle(
      { ...req, url: '/api/movies', path: '/api/movies', method: 'GET' },
      res,
      () => {}
    );
  } catch (error) {
    console.error('Błąd:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

app.post('/api/movies', async (req, res) => {
  try {
    const { title, year } = req.body;

    if (!title || !year) {
      return res.status(400).json({ error: 'Tytuł i rok są wymagane' });
    }

    const yearInt = parseInt(year);
    if (isNaN(yearInt) || yearInt < 1888 || yearInt > 2100) {
      return res.status(400).json({ error: 'Nieprawidłowy rok' });
    }

    const newMovie = await prisma.movie.create({
      data: {
        title: title.trim(),
        year: yearInt
      }
    });

    res.status(201).json(newMovie);
  } catch (error) {
    console.error('Błąd przy dodawaniu filmu:', error);
    res.status(500).json({ error: 'Nie udało się dodać filmu' });
  }
});

app.post('/api/ratings', async (req, res) => {
  try {
    const { movie_id, score } = req.body;

    if (!movie_id || score === undefined) {
      return res.status(400).json({ error: 'movie_id i score są wymagane' });
    }

    const scoreInt = parseInt(score);
    if (isNaN(scoreInt) || scoreInt < 1 || scoreInt > 5) {
      return res.status(400).json({ error: 'Ocena musi być liczbą od 1 do 5' });
    }

    const movieIdInt = parseInt(movie_id);

    const movie = await prisma.movie.findUnique({
      where: { id: movieIdInt }
    });

    if (!movie) {
      return res.status(404).json({ error: 'Film nie istnieje' });
    }

    const newRating = await prisma.rating.create({
      data: {
        movie_id: movieIdInt,
        score: scoreInt
      }
    });

    res.status(201).json(newRating);
  } catch (error) {
    console.error('Błąd przy dodawaniu oceny:', error);
    res.status(500).json({ error: 'Nie udało się dodać oceny' });
  }
});

app.get('/api/movies/years', async (req, res) => {
  try {
    const years = await prisma.movie.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' }
    });

    res.json(years.map(y => y.year));
  } catch (error) {
    console.error('Błąd przy pobieraniu lat:', error);
    res.status(500).json({ error: 'Nie udało się pobrać lat' });
  }
});

app.listen(PORT, () => {
  console.log(`Serwer uruchomiony na http://localhost:${PORT}`);
});
