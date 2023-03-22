import { injectable } from "tsyringe";

import { prismaClient } from "../database/prismaClient";

@injectable()
class GetChatRoomByIdService {
  async execute(id: string) {
    const room = await prismaClient.chatRoons.findUnique({
      where: {
        id,
      },
    });

    return room;
  }
}

export { GetChatRoomByIdService };
