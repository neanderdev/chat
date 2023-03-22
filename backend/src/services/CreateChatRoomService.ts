import { injectable } from "tsyringe";

import { prismaClient } from "../database/prismaClient";

interface ICreateChatRoomDTO {
  ofUserId: string;
  toUserId: string;
}

@injectable()
class CreateChatRoomService {
  async execute({ ofUserId, toUserId }: ICreateChatRoomDTO) {
    const room = await prismaClient.chatRoons.create({
      data: {
        ofUserId,
        toUserId,
      },
    });

    return room;
  }
}

export { CreateChatRoomService };
