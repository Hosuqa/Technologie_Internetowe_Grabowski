# Wymagania Wstępne

Pobierz i zainstaluj Node.js (wersja LTS)

# Jak Uruchomić Projekt (Krok po Kroku)

- Sklonuj repozytorium / pobierz je tak aby było dostępne lokalnie na Twoim urządzeniu.
- Odpal terminal
- Przejdź do głównego folderu projektu Lab4
- Wykonaj komendę *npm install* instalującą wszystkie potrzebne biblioteki.
- Stwórz w folderze projektu plik *.env* i dodaj zmienną DATABASE_URL np. *DATABASE_URL="file:./movies.db"* (lub użyj istniejącego pliku .env)
- Wygeneruj bazę danych komendą *npx prisma migrate dev*.
- Wypełnij bazę przykładowymi danymi komendą *npm run seed*
- Uruchom serwer NodeJS komendą *npm run dev*
- Otwórz przeglądarkę i przejdź pod adres *http://localhost:3000*
