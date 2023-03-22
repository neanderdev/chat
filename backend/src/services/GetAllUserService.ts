import { injectable } from "tsyringe";

import { prismaClient } from "../database/prismaClient";

@injectable()
class GetAllUserService {
  async execute() {
    const users = await prismaClient.users.findMany();

    return users;
  }
}

export { GetAllUserService };
