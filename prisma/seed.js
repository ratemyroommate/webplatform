 import { PrismaClient } from "@prisma/client";

 const prisma = new PrismaClient();

const main = async () => {
  const compatibilityQuestionOption = [
    {
      id: 1,
      order: 1,
      text: "Mennyire vagy rendtartó a közös helyiségekben (pl. konyha, fürdőszoba)?",
      answers: [
        { id: 1, text: "Nagyon - Rendszeresen takarítok, szeretem a rendet.", value: 0 },
        { id: 2, text: "Közepesen - Akkor takarítok, ha szükséges, de nem veszem túl komolyan.", value: 1 },
        { id: 3, text: "Nem igazán - Nem zavar a rendetlenség, ritkán takarítok.", value: 2 },
      ]
    },
    {
      id: 2,
      order: 2,
      text: "Szeretsz időt tölteni a szobatársaddal (pl. együtt enni, beszélgetni)?",
      answers: [
        { id: 4, text: "Igen, nagyon - Jó lenne barátkozni és rendszeresen együtt lógni.", value: 0 },
        { id: 5, text: "Néha - Némi közös idő oké, de fontos a saját tér is.", value: 1 },
        { id: 6, text: "Nem igazán - Inkább külön élem az életem otthon.", value: 2 },
      ]
    },
    {
      id: 3,
      order: 3,
      text: "Mennyire zavar a zaj vagy a nyüzsgés otthon (pl. zene, vendégek, TV)?",
      answers: [
        { id: 7, text: "Szeretem, ha élettel teli a lakás - Nem zavar a háttérzaj vagy a gyakori vendégek.", value: 0 },
        { id: 8, text: "Néha zavar, néha nem - Nem gond, ha nem túl gyakori vagy hangos.", value: 1 },
        { id: 9, text: "Jobban szeretem a csendet - Kevés zajt és ritka vendégeket preferálok.", value: 2 },
      ]
    },
    {
      id: 4,
      order: 4,
      text: "Mennyire van szükséged saját térre, egyedüllétre otthon?",
      answers: [
        { id: 10, text: "Nagyon - Rendszeresen szükségem van egyedüllétre és nyugalomra.", value: 0 },
        { id: 11, text: "Közepesen - Szeretem az egyensúlyt a társaság és a magány között.", value: 1 },
        { id: 12, text: "Nem igazán - Szeretek emberek között lenni, nem igénylem az egyedüllétet.", value: 2 },
      ]
    },
    {
      id: 5,
      order: 5,
      text: "Milyen a napi ritmusod?",
      answers: [
        { id: 13, text: "Éjjeli bagoly vagyok - Későn fekszem le, este vagyok aktív.", value: 0 },
        { id: 14, text: "Rugalmas vagyok - Bármelyikhez tudok alkalmazkodni.", value: 1 },
        { id: 15, text: "Korán kelő vagyok - Szeretem a reggeleket, korán fekszem.", value: 2 },
      ]
    },
    {
      id: 6,
      order: 6,
      text: "Számodra rendben van, ha megosztjuk a konyhai dolgokat (pl. edények, fűszerek, eszközök)?",
      answers: [
        { id: 16, text: "Igen - Nyitott vagyok a közös használatra.", value: 0 },
        { id: 17, text: "Attól függ - Megbeszélés után néhány dolgot szívesen megosztok.", value: 1 },
        { id: 18, text: "Nem - Szeretem, ha minden külön van.", value: 2 },
      ]
    }
  ]
  

  await Promise.all(
    compatibilityQuestionOption.map(({id, answers, ...rest}) => 
      prisma.compatibilityQuestionOption.upsert({
        where: { id },
        update: { ...rest },
        create: {
          id,
          ...rest,
          answers: {
            create: answers,
          },
        },
      })
    )
  );
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
