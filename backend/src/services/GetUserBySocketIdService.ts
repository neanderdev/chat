import { injectable } from "tsyringe";

import { prismaClient } from "../database/prismaClient";

@injectable()
class GetUserBySocketIdService {
  async execute(socket_id: string) {
    const user = prismaClient.users.findUnique({
      where: {
        socket_id,
      },
    });

    return user;
  }
}

export { GetUserBySocketIdService };
