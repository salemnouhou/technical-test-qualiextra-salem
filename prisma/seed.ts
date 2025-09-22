import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@admin.com"; // Email de l'admin par défaut
  const password = "Admin123!";      // Mot de passe par défaut (à changer en prod)
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("Admin déjà existant");
    return;
  }

  const admin = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "Default",
      email,
      password: hashedPassword,
      roles: ["ADMIN"],
      isVerified: true,
    },
  });

  console.log("Admin créé :", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
