import { container } from "tsyringe";

import { io } from "../http";

import { CreateUserService } from "../services/CreateUserService";
import { GetUserByEmailService } from "../services/GetUserByEmailService";
import { UpdateUserSockerIdByEmail } from "../services/UpdateUserSockerIdByEmail";
import { GetAllUserService } from "../services/GetAllUserService";
import { CreateChatRoomService } from "../services/CreateChatRoomService";
import { GetUserBySocketIdService } from "../services/GetUserBySocketIdService";
import { GetChatRoomByUsersService } from "../services/GetChatRoomByUsersService";
import { GetMessageByChatRoomService } from "../services/GetMessageByChatRoomService";
import { CreateMessageService } from "../services/CreateMessageService";
import { GetChatRoomByIdService } from "../services/GetChatRoomByIdService";
import { GetUserByIdService } from "../services/GetUserByIdService";

io.on("connect", (socket) => {
  socket.on("start", async (data) => {
    const { email, name, avatar } = data;

    const createUserService = container.resolve(CreateUserService);

    const user = await createUserService.execute({
      email,
      socket_id: socket.id,
      name,
      avatar,
    });

    socket.broadcast.emit("new_users", user);
  });

  socket.on("update_socker_id_user_by_email", async (data) => {
    const getUserByEmailService = container.resolve(GetUserByEmailService);
    const updateUserSockerIdByEmail = container.resolve(
      UpdateUserSockerIdByEmail
    );

    const userLogged = await getUserByEmailService.execute(data.email);

    const user = await updateUserSockerIdByEmail.execute(
      userLogged?.id ?? "",
      data.socket_id
    );

    socket.broadcast.emit("update_user", user);
  });

  socket.on("get_users", async (callback) => {
    const getAllUserService = container.resolve(GetAllUserService);

    const users = await getAllUserService.execute();

    callback(users);
  });

  socket.on("start_chat", async (data, callback) => {
    const createChatRoomService = container.resolve(CreateChatRoomService);
    const getUserBySocketIdService = container.resolve(
      GetUserBySocketIdService
    );
    const getChatRoomByUsersService = container.resolve(
      GetChatRoomByUsersService
    );
    const getMessageByChatRoomService = container.resolve(
      GetMessageByChatRoomService
    );

    const userLogged = await getUserBySocketIdService.execute(socket.id);

    let room = await getChatRoomByUsersService.execute({
      ofUserId: userLogged?.id ?? "",
      toUserId: data.idUser,
    });

    if (!room) {
      room = await createChatRoomService.execute({
        ofUserId: userLogged?.id ?? "",
        toUserId: data.idUser,
      });
    }

    socket.join(room.id);

    const messages = await getMessageByChatRoomService.execute(room.id);

    callback({ room, messages });
  });

  socket.on("message", async (data) => {
    const getUserBySocketIdService = container.resolve(
      GetUserBySocketIdService
    );
    const createMessageService = container.resolve(CreateMessageService);
    const getChatRoomByIdService = container.resolve(GetChatRoomByIdService);
    const getUserByIdService = container.resolve(GetUserByIdService);

    const user = await getUserBySocketIdService.execute(socket.id);

    const message = await createMessageService.execute({
      to: user?.id ?? "",
      text: data.message,
      chatRoomId: data.chatRoomId,
    });

    io.to(data.chatRoomId).emit("message", {
      message,
      user,
    });

    const room = await getChatRoomByIdService.execute(data.chatRoomId);

    const id = user?.id === room?.ofUserId ? room?.toUserId : room?.ofUserId;

    const userFrom = await getUserByIdService.execute(id ?? "");

    io.to(userFrom?.socket_id ?? "").emit("notification", {
      newMessage: true,
      roomId: data.chatRoomId,
      from: user,
    });
  });
});
