import { PrismaClient } from '@prisma/client'
import { prisma } from '../prisma'

export abstract class BaseRepository {
  protected prisma: PrismaClient

  constructor() {
    this.prisma = prisma
  }
}
