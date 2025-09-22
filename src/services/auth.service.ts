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
    const existingUser = await userService.findByEmail(email.toLowerCase());
    if (existingUser) throw new Error('Email déjà utilisé');
  
    const isTemp = isDisposableEmail(email);
    // console.log('isTemp', isTemp);
    if (isTemp) throw new Error(
      "L'utilisation d'adresses email temporaires ou jetables n'est pas autorisée. Veuillez fournir une adresse email valide pour continuer."
    );  
    const hashedPassword = await bcrypt.hash(password, 10);
  
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
  
    const token = randomUUID();
    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: addHours(new Date(), 24),  
      },
    });
  
    // TODO: envoyer l’email avec le lien de vérification
    
    const sendemail = await sendVerification(email, token);
    // console.log('sendemail', sendemail);
  
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, message: 'Compte créé, vérifiez votre email pour activer le compte' };
  }
  async verifyEmail(token: string) {
    const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
    if (!record) throw new Error('Token invalide');
    if (record.expiresAt < new Date()) throw new Error('Token expiré');

    await prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
    });

    await prisma.emailVerificationToken.delete({ where: { id: record.id } });

    return { message: 'Email vérifié avec succès' };
  }

  async login(email: string, password: string) {
    const user = await userService.findByEmail(email.toLowerCase());
    if (!user) throw new Error('Utilisateur introuvable');
    if (!user.isVerified) throw new Error('Email non vérifié');
    // console.log('user', user);

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Mot de passe incorrect');

    const token = generateToken({ id: user.id,firstName: user.firstName, email: user.email, roles: user.roles });
    return { token };
  }
}
