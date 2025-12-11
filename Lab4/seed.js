const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Rozpoczynam seedowanie bazy danych...');

  try {
    await prisma.rating.deleteMany();
    await prisma.movie.deleteMany();

    console.log('🗑️  Usunięto stare dane');

    const movies = [
      { title: 'Skazani na Shawshank', year: 1994 },
      { title: 'Ojciec chrzestny', year: 1972 },
      { title: 'Mroczny Rycerz', year: 2008 },
      { title: 'Dwunastu gniewnych ludzi', year: 1957 },
      { title: 'Lista Schindlera', year: 1993 },
      { title: 'Władca Pierścieni: Powrót króla', year: 2003 },
      { title: 'Pulp Fiction', year: 1994 },
      { title: 'Forrest Gump', year: 1994 },
      { title: 'Incepcja', year: 2010 },
      { title: 'Matrix', year: 1999 },
      { title: 'Lot nad kukułczym gniazdem', year: 1975 },
      { title: 'Szeregowiec Ryan', year: 1998 },
      { title: 'Siedem', year: 1995 },
      { title: 'Milczenie owiec', year: 1991 },
      { title: 'Życie jest piękne', year: 1997 }
    ];

    console.log('🎬 Dodaję filmy...');
    
    for (const movie of movies) {
      await prisma.movie.create({
        data: movie
      });
    }

    const addedMovies = await prisma.movie.findMany();

    console.log('⭐ Dodaję przykładowe oceny...');

    const ratings = [
      { movie_id: addedMovies[0].id, score: 5 },
      { movie_id: addedMovies[0].id, score: 5 },
      { movie_id: addedMovies[0].id, score: 5 },
      { movie_id: addedMovies[0].id, score: 4 },
      { movie_id: addedMovies[0].id, score: 5 },
      { movie_id: addedMovies[0].id, score: 5 },
      { movie_id: addedMovies[0].id, score: 4 },

      { movie_id: addedMovies[1].id, score: 5 },
      { movie_id: addedMovies[1].id, score: 5 },
      { movie_id: addedMovies[1].id, score: 4 },
      { movie_id: addedMovies[1].id, score: 5 },
      { movie_id: addedMovies[1].id, score: 5 },

      { movie_id: addedMovies[2].id, score: 5 },
      { movie_id: addedMovies[2].id, score: 4 },
      { movie_id: addedMovies[2].id, score: 5 },
      { movie_id: addedMovies[2].id, score: 4 },
      { movie_id: addedMovies[2].id, score: 5 },
      { movie_id: addedMovies[2].id, score: 5 },

      { movie_id: addedMovies[3].id, score: 5 },
      { movie_id: addedMovies[3].id, score: 4 },
      { movie_id: addedMovies[3].id, score: 5 },

      { movie_id: addedMovies[4].id, score: 5 },
      { movie_id: addedMovies[4].id, score: 5 },
      { movie_id: addedMovies[4].id, score: 4 },
      { movie_id: addedMovies[4].id, score: 5 },

      { movie_id: addedMovies[5].id, score: 5 },
      { movie_id: addedMovies[5].id, score: 5 },
      { movie_id: addedMovies[5].id, score: 4 },
      { movie_id: addedMovies[5].id, score: 5 },
      { movie_id: addedMovies[5].id, score: 5 },

      { movie_id: addedMovies[6].id, score: 4 },
      { movie_id: addedMovies[6].id, score: 5 },
      { movie_id: addedMovies[6].id, score: 4 },
      { movie_id: addedMovies[6].id, score: 5 },

      { movie_id: addedMovies[7].id, score: 5 },
      { movie_id: addedMovies[7].id, score: 4 },
      { movie_id: addedMovies[7].id, score: 5 },

      { movie_id: addedMovies[8].id, score: 5 },
      { movie_id: addedMovies[8].id, score: 5 },
      { movie_id: addedMovies[8].id, score: 4 },
      { movie_id: addedMovies[8].id, score: 4 },

      { movie_id: addedMovies[9].id, score: 5 },
      { movie_id: addedMovies[9].id, score: 4 },
      { movie_id: addedMovies[9].id, score: 5 },

      { movie_id: addedMovies[10].id, score: 5 },
      { movie_id: addedMovies[10].id, score: 4 },

      { movie_id: addedMovies[11].id, score: 4 },
      { movie_id: addedMovies[11].id, score: 5 },

      { movie_id: addedMovies[12].id, score: 4 },
      { movie_id: addedMovies[12].id, score: 4 },

      { movie_id: addedMovies[13].id, score: 5 },

      { movie_id: addedMovies[14].id, score: 5 }
    ];

    for (const rating of ratings) {
      await prisma.rating.create({
        data: rating
      });
    }

    console.log('✅ Seedowanie zakończone pomyślnie!');
    console.log(`📊 Dodano ${movies.length} filmów i ${ratings.length} ocen`);

  } catch (error) {
    console.error('❌ Błąd podczas seedowania:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
