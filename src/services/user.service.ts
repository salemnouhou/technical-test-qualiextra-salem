
import prisma from "../prisma";
import bcrypt from "bcrypt";
import { isDisposableEmail } from "../utils/emailValidator";

export interface UpdateUserInput {
  firstName?: string;
  email?: string;
  lastName?: string;
  password?: string;
  roles?: string[];
  isVerified?: boolean;
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}


export class UserService {

  // Trouver un user par son email (utilisé pour l’authentification)
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  
  // Récupérer son propre profil
  async getMe(userId: string) {
    // On ne renvoie pas le mot de passe ni les tokens
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) throw new Error("Utilisateur introuvable");
    return user;
  }

  // ADMIN: lister tous les users
  async getAll() {
    // Sélectionne uniquement les champs non sensibles
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // ADMIN: voir détail d’un user
  async getUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Utilisateur introuvable");
    return user;
  }

  // Mettre à jour un utilisateur
  async updateUser(
    currentUser: { id: string; roles: string[] },
    userId: string,
    body: UpdateUserInput
  ) {
    // Règles d'autorisation :
    // - Propriétaire peut mettre à jour prénom/nom/email (si vérifié)
    // - ADMIN peut mettre à jour tous les champs, y compris rôles, vérification, et mot de passe
    const isAdmin = currentUser.roles?.includes("ADMIN");
    const isOwner = currentUser.id === userId;
  
    if (!isAdmin && !isOwner) {
      throw new Error("Forbidden");
    }
  
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Utilisateur introuvable");
  
    const data: any = {};
  
    // Cas Utilisateur (non admin) : champs limités
    if (isOwner && !isAdmin) {
      if (body.firstName !== undefined) data.firstName = body.firstName;
      if (body.lastName !== undefined) data.lastName = body.lastName;
  
      if (body.email !== undefined) {
        // Empêche le changement d'email si le compte n'est pas vérifié
        if (!user.isVerified) {
          throw new Error("Vous devez vérifier votre email avant de pouvoir le modifier");
        }
  
        // Empêche l'utilisation d'emails jetables
        if (isDisposableEmail(body.email)) {
          throw new Error("Veuillez utiliser une adresse email valide");
        }
  
        // Vérifie l'unicité de l'email
        const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
        if (existingUser && existingUser.id !== userId) {
          throw new Error("Cet email est déjà utilisé par un autre compte");
        }
  
        data.email = body.email;
      }
  
    }
  
    // Cas ADMIN : champs étendus
    if (isAdmin) {
      if (body.firstName !== undefined) data.firstName = body.firstName;
      if (body.lastName !== undefined) data.lastName = body.lastName;
  
      if (body.email !== undefined) {
        if (isDisposableEmail(body.email)) {
          throw new Error("Veuillez utiliser une adresse email valide");
        }
        const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
        if (existingUser && existingUser.id !== userId) {
          throw new Error("Cet email est déjà utilisé par un autre compte");
        }
        data.email = body.email;
      }
  
      if (body.password !== undefined) data.password = await bcrypt.hash(body.password, 10);
      if (body.roles !== undefined) data.roles = body.roles;
      if (body.isVerified !== undefined) data.isVerified = body.isVerified;
    }
  
    if (Object.keys(data).length === 0) {
      throw new Error("Aucun champ valide à mettre à jour");
    }
  
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  

  // ADMIN: supprimer un utilisateur
  async deleteUser(userId: string) {
    // Supprime l'utilisateur et renvoie un sous-ensemble de champs non sensibles
    return prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
