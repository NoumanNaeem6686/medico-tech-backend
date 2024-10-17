const { PrismaClient } = require("../../prisma/generated/client");
const prisma = new PrismaClient();
const getNextUniqueNumber = async (modelName, numberField) => {
  const maxRecord = await prisma[modelName].findMany({
    orderBy: {
      [numberField]: "desc",
    },
    take: 1,
  });

  return maxRecord.length > 0 ? maxRecord[0][numberField] + 1 : 1000;
};
module.exports = { getNextUniqueNumber };
