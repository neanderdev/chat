import { injectable } from "tsyringe";

import { prismaClient } from "../database/prismaClient";

@injectable()
class UpdateUserSockerIdByEmail {
  async execute(id: string, socket_id: string) {
    const userIsExists = await prismaClient.users.findUnique({
      where: {
        id,
      },
    });

    if (!userIsExists) {
      console.log("Users does not exists!");

      return;
    }

    const user = prismaClient.users.update({
      data: {
        socket_id,
      },
      where: {
        id,
      },
    });

    return user;
  }
}

export { UpdateUserSockerIdByEmail };
