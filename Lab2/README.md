# Wymagania Wstępne

Pobierz i zainstaluj Node.js (wersja LTS) 

# Jak Uruchomić Projekt (Krok po Kroku) 

- Sklonuj repozytorium / pobierz je tak aby było dostępne lokalnie na Twoim urządzeniu.
- Odpal terminal
- Przejdź do głównego folderu projektu Lab1
- Wykonaj komendę *npm install* instalującą wszystkie potrzebne biblioteki.
- Stwórz w folderze projektu plik *.env* i dodaj zmienną DATABASE_URL np. *DATABASE_URL="file:./dev.db"*
- Wygeneruj bazę danych komendą *npx prisma migrate dev*.
- Uruchom serwer NodeJS komendą *npm run dev* i odpal localhosta za pomocą linku wyświetlonego w terminalu.
