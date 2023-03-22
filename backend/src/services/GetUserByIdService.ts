import { injectable } from "tsyringe";

import { prismaClient } from "../database/prismaClient";

@injectable()
class GetUserByIdService {
  async execute(id: string) {
    const user = prismaClient.users.findUnique({
      where: {
        id,
      },
    });

    return user;
  }
}

export { GetUserByIdService };
