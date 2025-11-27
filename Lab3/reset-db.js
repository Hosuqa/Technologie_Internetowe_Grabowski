const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const dbPath = path.join(__dirname, 'prisma', 'blog.db');

async function resetDatabase() {
  console.log('Resetowanie bazy danych.');

  try {
    await prisma.$disconnect();

    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Usunięto starą bazę danych');
    }

    console.log('Tworzenie nowej bazy danych.');
    
    const { execSync } = require('child_process');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });

    console.log('Uruchamianie seed.');
    execSync('npm run seed', { stdio: 'inherit' });

    console.log('\nReset bazy danych zakończony pomyślnie.');
  } catch (error) {
    console.error('Błąd podczas resetowania bazy:', error);
    process.exit(1);
  }
}

resetDatabase();
