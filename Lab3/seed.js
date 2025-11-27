const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('Rozpoczynam seedowanie bazy danych.');

  try {
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});

    const post1 = await prisma.post.create({
      data: {
        title: 'Pad Thai - klasyka tajskiej kuchni',
        body: 'Pad Thai to jedno z najpopularniejszych dań kuchni tajskiej. Makaron ryżowy smażony z jajkiem, kiełkami fasoli mung, krewetkami lub kurczakiem, doprawiony sosem tamaryndowym i orzeszkami. Sekret tego dania tkwi w balansie słodkiego, słonego, kwaśnego i pikantnego smaku. Składniki: makaron ryżowy (200g), krewetki lub kurczak (300g), jajka (2 szt), kiełki fasoli mung (100g), czosnek (3 ząbki), papryczka chili, sos rybny (3 łyżki), pasta tamaryndowa (2 łyżki), cukier palmowy (2 łyżki), orzeszki ziemne, limonka, szczypiorek chiński. Makaron moczymy w ciepłej wodzie przez 30 minut. Na mocnym ogniu smażymy czosnek i chili, dodajemy białko i krewetki. Po przesmażeniu dodajemy namoczony makaron, sosy i cukier. Podgrzewamy aż makaron będzie miękki. Na koniec dodajemy kiełki i posypujemy orzeszkami.'
      }
    });

    const post2 = await prisma.post.create({
      data: {
        title: 'Ramen - japoński rosół pełen smaku',
        body: 'Ramen to japońska zupa z makaronem, która podbiła serca miłośników kuchni azjatyckiej na całym świecie. Podstawą jest intensywny bulion, który gotuje się przez wiele godzin. Najpopularniejsze rodzaje to shoyu (sojowy), miso (z pasty miso), shio (solny) i tonkotsu (na bazie kości wieprzowych). Składniki na bulion tonkotsu: kości wieprzowe (2kg), czosnek (cała główka), imbir (kawałek 5cm), por (2 łodygi), woda (4 litry. Kości blanszujemy, płuczemy i gotujemy minimum 12 godzin na wolnym ogniu. Rosół powinien być gęsty i mlecznobiały. Do podania: makaron ramen, jajko marynowane, plasterki wieprzowiny chashu, por, nori, kiełki bambusa. Gotowy bulion zalewamy na ugotowany makaron, układamy dodatki i od razu podajemy gorące.'
      }
    });

    console.log('Utworzono posty');

    await prisma.comment.createMany({
      data: [
        {
          post_id: post1.id,
          author: 'Kasia Nowak',
          body: 'Czy mogę zastąpić pastę tamaryndową czymś innym? Nie mogę jej znaleźć w sklepie.',
          approved: 1
        },
        {
          post_id: post1.id,
          author: 'Michał Kowalczyk',
          body: 'Ile dokładnie wody użyć do moczenia makaronu? Czy woda powinna być gorąca czy letnia?',
          approved: 1
        },
        {
          post_id: post1.id,
          author: 'Anna Zielińska',
          body: 'Próbowałam wczoraj - wyszło pysznie! Czy można dodać więcej warzyw?',
          approved: 0
        },
        {
          post_id: post1.id,
          author: 'Tomasz Wiśniewski',
          body: 'Jaki makaron ryżowy polecasz? Gruby czy cienki?',
          approved: 0
        }
      ]
    });

    await prisma.comment.createMany({
      data: [
        {
          post_id: post2.id,
          author: 'Julia Lewandowska',
          body: 'Czy bulion musi gotować się aż 12 godzin? Mogę skrócić ten czas?',
          approved: 1
        },
        {
          post_id: post2.id,
          author: 'Paweł Dąbrowski',
          body: 'Jak zrobić jajko marynowane? Czy jest jakiś przepis?',
          approved: 0
        },
        {
          post_id: post2.id,
          author: 'Ola Kamińska',
          body: 'Gdzie kupić makaron ramen? W zwykłym supermarkecie czy tylko w sklepach azjatyckich?',
          approved: 0
        }
      ]
    });

    console.log('Utworzono komentarze');

    const stats = await prisma.comment.groupBy({
      by: ['approved'],
      _count: true
    });

    console.log('\nStatystyki:');
    console.log('   Posty: 2');
    stats.forEach(stat => {
      const status = stat.approved === 1 ? 'Zatwierdzone' : 'Oczekujące';
      console.log(`   Komentarze ${status}: ${stat._count}`);
    });

    console.log('\nSeedowanie zakończone pomyślnie.');
  } catch (error) {
    console.error('Błąd podczas seedowania:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
