import { logger } from '../logger'
import { Logger } from 'winston'

export abstract class BaseService {
  protected logger: Logger

  constructor() {
    this.logger = logger
  }
}