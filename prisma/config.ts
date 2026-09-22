// Prisma config for Prisma CLI
const config = {
  schema: './prisma/schema.prisma',
  out: './prisma/generated',
  // For SQLite with relative path
  db: {
    shadowDatabaseName: 'shadow',
  },
};

export default config;