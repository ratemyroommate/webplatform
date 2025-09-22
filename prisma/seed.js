 import { PrismaClient } from "@prisma/client";

 const prisma = new PrismaClient();

const main = async () => {
  const compatibilityQuestionOption = [
    {
      id: 1,
      order: 1,
      text: "Do you clean your room frequently?",
      answers: [
        { id: 1, text: "Yes" },
        { id: 2, text: "Maybe" },
        { id: 3, text: "No" },
      ]
    },
    {
      id: 2,
      order: 2,
      text: "Do you party a lot?",
      answers: [
        { id: 4, text: "Yes" },
        { id: 5, text: "Only on weekends" },
        { id: 6, text: "No" },
      ],
    },
    {
      id: 3,
      order: 3,
      text: "Do you smoke cigarettes?",
      answers: [
        { id: 7, text: "Yes" },
        { id: 8, text: "Only rarely" },
        { id: 9, text: "No" },
      ],
    },
  ];

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
