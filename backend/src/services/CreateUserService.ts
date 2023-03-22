import { injectable } from "tsyringe";

import { prismaClient } from "../database/prismaClient";

interface ICreateUserDTO {
  email: string;
  socket_id: string;
  name: string;
  avatar: string;
}

@injectable()
class CreateUserService {
  async execute({ email, socket_id, name, avatar }: ICreateUserDTO) {
    const userAlreadyExists = await prismaClient.users.findUnique({
      where: {
        email,
      },
    });

    if (userAlreadyExists) {
      const user = await prismaClient.users.update({
        data: {
          socket_id,
          avatar,
          name,
        },
        where: {
          id: userAlreadyExists.id,
        },
      });

      return user;
    } else {
      const user = await prismaClient.users.create({
        data: {
          email,
          socket_id,
          name,
          avatar,
        },
      });

      return user;
    }
  }
}

export { CreateUserService };
