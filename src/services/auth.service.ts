import bcrypt from 'bcrypt';
import { generateToken } from '../utils/auth';
import { UserService } from './user.service';
import prisma from '../prisma';
import { randomUUID } from 'crypto';
import { addHours } from 'date-fns';
import { isDisposableEmail } from '../utils/emailValidator';
import { sendVerification } from '../utils/mailer';
const userService = new UserService();

export class AuthService {
  async register(firstName: string, lastName: string, email: string, password: string) {
    // 1) Vérifie l'unicité de l'email (insensible à la casse)
    const existingUser = await userService.findByEmail(email.toLowerCase());
    if (existingUser) throw new Error('Email déjà utilisé');
  
    // 2) Bloque les emails jetables pour limiter la fraude
    const isTemp = isDisposableEmail(email);
    // console.log('isTemp', isTemp);
    if (isTemp) throw new Error(
      "L'utilisation d'adresses email temporaires ou jetables n'est pas autorisée. Veuillez fournir une adresse email valide pour continuer."
    );  
    // 3) Hash du mot de passe utilisateur
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // 4) Création de l'utilisateur non vérifié avec rôle USER par défaut
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        roles: ['USER'],
        isVerified: false,
      },
    });
  
    // 5) Génère un token de vérification avec expiration à 24h
    const token = randomUUID();
    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: addHours(new Date(), 24),  
      },
    });
  
    // 6) Envoie l'email de vérification contenant le lien/token
    const sendemail = await sendVerification(email, token);
    // console.log('sendemail', sendemail);
  
    // 7) Ne jamais renvoyer le hash du mot de passe au client
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, message: 'Compte créé, vérifiez votre email pour activer le compte' };
  }
  async verifyEmail(token: string) {
    // 1) Récupère le token et vérifie qu'il existe
    const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
    if (!record) throw new Error('Token invalide');
    // 2) Vérifie l'expiration
    if (record.expiresAt < new Date()) throw new Error('Token expiré');

    // 3) Active le compte utilisateur
    await prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
    });

    // 4) Supprime le token pour empêcher toute réutilisation
    await prisma.emailVerificationToken.delete({ where: { id: record.id } });

    return { message: 'Email vérifié avec succès' };
  }

  async login(email: string, password: string) {
    // 1) Recherche de l'utilisateur par email
    const user = await userService.findByEmail(email.toLowerCase());
    if (!user) throw new Error('Utilisateur introuvable');
    // 2) Empêche la connexion tant que l'email n'est pas vérifié
    if (!user.isVerified) throw new Error('Email non vérifié');
    // console.log('user', user);

    // 3) Vérifie le mot de passe
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Mot de passe incorrect');

    // 4) Génère le JWT avec les informations minimales nécessaires (id, prénom, email, rôles)
    const token = generateToken({ id: user.id,firstName: user.firstName, email: user.email, roles: user.roles });
    return { token };
  }
}
