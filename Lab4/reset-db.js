const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reset() {
  console.log('🔄 Resetowanie bazy danych...');

  try {
    await prisma.rating.deleteMany();
    await prisma.movie.deleteMany();

    console.log('✅ Baza danych została zresetowana!');
  } catch (error) {
    console.error('❌ Błąd podczas resetowania:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

reset();
