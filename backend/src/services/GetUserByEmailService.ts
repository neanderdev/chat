import { injectable } from "tsyringe";

import { prismaClient } from "../database/prismaClient";

@injectable()
class GetUserByEmailService {
  async execute(email: string) {
    const user = prismaClient.users.findUnique({
      where: {
        email,
      },
    });

    return user;
  }
}

export { GetUserByEmailService };
