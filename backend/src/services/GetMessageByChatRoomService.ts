import { injectable } from "tsyringe";

import { prismaClient } from "../database/prismaClient";

@injectable()
class GetMessageByChatRoomService {
  async execute(chatRoomId: string) {
    const messages = await prismaClient.messages.findMany({
      where: {
        chatRoomId,
      },
    });

    return messages;
  }
}

export { GetMessageByChatRoomService };
