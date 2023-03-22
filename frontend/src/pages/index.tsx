import { useRouter } from 'next/router'
import Image from 'next/image'
import { Fragment, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon, ChatBubbleLeftRightIcon, EllipsisVerticalIcon } from '@heroicons/react/20/solid'

import { socket } from '../services/io'

interface User {
  id?: string;
  email: string;
  name: string;
  avatar: string;
}

interface Message {
  id: String;
  to: String;
  text: String;
  created_at: Date;
  chatRoomId: String;
}

const sortOptions = [
  { name: 'Novas Conversas', href: '#', current: true },
  { name: 'Maior Conversa', href: '#', current: false },
  { name: 'Menor Conversa', href: '#', current: false },
]

export default function Home() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User>({} as User);
  const [users, setUsers] = useState<User[]>([]);
  const [chatRoomId, setChatRoomId] = useState("");
  const [ofUserId, setOfUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState<String[]>([]);

  const messageInput = useRef<any | null>(null);

  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      const userParsed = JSON.parse(user);

      socket.emit("get_users", (users: User[]) => {
        const userLogged = users.find(user => user.email === userParsed.email);

        if (userLogged === undefined) {
          router.push("/cadastrar-usuario")
        }

        localStorage.setItem("user", JSON.stringify(userLogged));

        users.map((user) => {
          if (user.email !== userParsed.email) {
            setUsers((prevUsers) => {
              const prevUsersAlreadyExists = prevUsers.find((prevUser => prevUser.id === user.id));

              if (!prevUsersAlreadyExists) {
                return [...prevUsers, user];
              }

              return prevUsers;
            });
          }
        });
      });

      const data = {
        socket_id: socket.id,
        email: userParsed.email,
      };

      socket.emit("update_socker_id_user_by_email", data);

      setUser(userParsed);

      setIsLoading(false);
    } else {
      router.push("/cadastrar-usuario");
    }
  }, [router]);

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = (key: KeyboardEvent["key"]) => {
      if (!chatRoomId || key !== 'Escape') return;

      setChatRoomId("");
      setOfUserId("");
      setToUserId("");
      setMessages([]);
      setMessage("");
    };

    document.addEventListener('keydown', (event) => {
      keyHandler(event.key);
    });

    return () => document.removeEventListener('keydown', (event) => {
      keyHandler(event.key);
    });
  });

  useEffect(() => {
    chatRoomId && messageInput.current?.focus();
  }, [chatRoomId]);

  if (typeof window !== "undefined") {
    socket.on("new_users", (user: User) => {
      setIsLoading(true);

      const usersAlreadyExists = users.find((userFind) => userFind.id === user.id);

      const userLocalStorage = localStorage.getItem("user");
      const userParsed = JSON.parse(userLocalStorage ?? "{}");

      if (!usersAlreadyExists && user.email !== userParsed.email) {
        setUsers((prevUsers) => {
          const prevUsersAlreadyExists = prevUsers.find((prevUser => prevUser.id === user.id));

          if (!prevUsersAlreadyExists) {
            return [...prevUsers, user];
          }

          return prevUsers;
        });
      }

      setIsLoading(false);
    });

    socket.on("update_user", (user: User) => {
      const userLocalStorage = localStorage.getItem("user");
      const userParsed = JSON.parse(userLocalStorage ?? "{}");

      if (userParsed.email === user.email) {
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);
      }
    });

    socket.on("message", (data: any) => {
      if (data.message.chatRoomId === chatRoomId) {
        setMessages((prevMessages) => {
          const prevMessagesAlreadyExists = prevMessages.find((prevMessage => prevMessage.id === data.message.id));

          if (!prevMessagesAlreadyExists) {
            return [...prevMessages, data.message];
          }

          return prevMessages;
        });
      }
    });

    socket.on("notification", (data: any) => {
      if (data.roomId !== chatRoomId) {
        setNotifications((prevNotifications) => {
          const prevNotificationsAlreadyExists = prevNotifications.find((prevNotification => prevNotification === data.from.id));

          if (!prevNotificationsAlreadyExists) {
            return [...prevNotifications, data.from.id];
          }

          return prevNotifications;
        });
      }
    });
  }

  function handleStartChat(idUser: string | undefined) {
    setNotifications(notifications.filter((notification) => notification !== (idUser ?? "")));

    socket.emit("start_chat", { idUser: idUser ?? "" }, (response: any) => {
      setChatRoomId(response.room.id);
      setOfUserId(response.room.ofUserId);
      setToUserId(response.room.toUserId);

      setMessages(response.messages);
    });
  }

  function handleSendMessage() {
    if (message === "") {
      alert("Digite a mensagem!");

      return;
    }

    if (chatRoomId === "") {
      alert("Para enviar uma mensagem você precisa estar em uma conversa!");

      return;
    }

    const data = {
      message,
      chatRoomId,
    };

    socket.emit("message", data);

    setMessage("");
  }

  return (
    isLoading ? (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold text-green-500">Carregando...</h1>
      </div>
    ) : (
      <div className="bg-white">
        <div>
          {/* Screen Mobile */}
          <Transition.Root show={mobileFiltersOpen} as={Fragment}>
            <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
              <Transition.Child
                as={Fragment}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-25" />
              </Transition.Child>

              <div className="fixed inset-0 z-40 flex">
                <Transition.Child
                  as={Fragment}
                  enter="transition ease-in-out duration-300 transform"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transition ease-in-out duration-300 transform"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                    <div className="flex items-center justify-between px-4">
                      <h2 className="text-lg font-medium text-gray-900">
                        Conversas
                      </h2>

                      <button
                        type="button"
                        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                        onClick={() => setMobileFiltersOpen(false)}
                      >
                        <span className="sr-only">Close menu</span>

                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Conversas */}
                    <form className="mt-4 border-t border-gray-200">
                      <h3 className="sr-only">
                        Conversas
                      </h3>

                      <ul role="list" className="space-y-4 px-2 py-3 font-medium text-gray-900">
                        {
                          users.length === 0
                            ? (
                              <span className="font-semibold text-sm text-center">
                                Nenhum chat disponível ainda
                              </span>
                            )
                            : (
                              users.map((user) => (
                                <li key={user.id} className="relative flex items-center gap-4 cursor-pointer" onClick={() => handleStartChat(user?.id)}>
                                  <div className="relative">
                                    {
                                      notifications.includes(user.id ?? "")
                                        ? (
                                          <span className="absolute -right-2 -bottom-1 text-green-500">
                                            <svg width="20" height="20">
                                              <circle cx="8" cy="8" r="8" fill="currentColor"></circle>
                                            </svg>
                                          </span>

                                        )
                                        : null
                                    }

                                    <Image
                                      className="inline-block h-12 w-12 rounded-full ring-2 ring-white"
                                      src={user.avatar}
                                      width={48}
                                      height={48}
                                      alt={user.name}
                                    />
                                  </div>

                                  <span className="font-semibold text-sm">
                                    {user.name}
                                  </span>
                                </li>
                              ))
                            )
                        }
                      </ul>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition.Root>

          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between border-b border-gray-200 pt-6 pb-6">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                Chats: {user.name}
              </h1>

              <div className="flex items-center">
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                      Filtrar

                      <ChevronDownIcon
                        className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                    </Menu.Button>
                  </div>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {sortOptions.map((option) => (
                          <Menu.Item key={option.name}>
                            {({ active }) => (
                              <a
                                href={option.href}
                                className={
                                  'block px-4 py-2 text-sm ' + (
                                    option.current ? 'font-medium text-gray-900' : 'text-gray-500'
                                  ) + (
                                    active ? 'bg-gray-100' : ''
                                  )
                                }
                              >
                                {option.name}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>

                <button
                  type="button"
                  className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <span className="sr-only">
                    Chats
                  </span>

                  <ChatBubbleLeftRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <section aria-labelledby="conversation-heading" className="pt-6 pb-24">
              <h2 id="conversation-heading" className="sr-only">
                Conversa
              </h2>

              <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                {/* Conversas */}
                <form className="hidden lg:block">
                  <h3 className="sr-only">
                    Chats
                  </h3>

                  <ul role="list" className="h-full space-y-4 border-r border-gray-200 pb-6 text-sm font-medium text-gray-900">
                    {
                      users.length === 0
                        ? (
                          <span className="font-semibold text-sm text-center">
                            Nenhum chat disponível ainda
                          </span>
                        )
                        : (
                          users.map((user) => (
                            <li key={user.id} className="relative flex items-center gap-4 cursor-pointer" onClick={() => handleStartChat(user?.id)}>
                              <div className="relative">
                                {
                                  notifications.includes(user.id ?? "")
                                    ? (
                                      <span className="absolute -right-2 -bottom-1 text-green-500">
                                        <svg width="20" height="20">
                                          <circle cx="8" cy="8" r="8" fill="currentColor"></circle>
                                        </svg>
                                      </span>

                                    )
                                    : null
                                }

                                <Image
                                  className="inline-block h-12 w-12 rounded-full ring-2 ring-white"
                                  src={user.avatar}
                                  width={48}
                                  height={48}
                                  alt={user.name}
                                />
                              </div>

                              <span className="font-semibold text-sm">
                                {user.name}
                              </span>
                            </li>
                          ))
                        )
                    }
                  </ul>
                </form>


                {/* Chat */}
                <div className="lg:col-span-3 h-full">
                  <div className="flex min-h-full max-h-screen flex-1 flex-col justify-between">
                    {
                      chatRoomId === ""
                        ? (
                          <div className="flex justify-center items-center">
                            <span className="text-xl font-bold">
                              Sem Chat
                            </span>
                          </div>
                        )
                        : (
                          <>
                            {/* Header */}
                            <div className="flex justify-between border-b-2 border-gray-200 pb-2 sm:items-center">
                              <div className="relative flex items-center space-x-4">
                                <div className="relative">
                                  <span className="absolute -right-2 -bottom-1 text-green-500">
                                    <svg width="20" height="20">
                                      <circle cx="8" cy="8" r="8" fill="currentColor"></circle>
                                    </svg>
                                  </span>

                                  <Image
                                    className="h-12 w-12 rounded-full"
                                    src={users.find(userFind => (userFind.id !== user.id) && (userFind.id === ofUserId || userFind.id === toUserId))?.avatar ?? ""}
                                    width={48}
                                    height={48}
                                    alt={users.find(userFind => (userFind.id !== user.id) && (userFind.id === ofUserId || userFind.id === toUserId))?.name ?? ""}
                                  />
                                </div>

                                <div className="flex flex-col leading-tight">
                                  <div className="mt-1 flex items-center text-xl">
                                    <span className="mr-3 text-gray-700">
                                      {users.find(userFind => (userFind.id !== user.id) && (userFind.id === ofUserId || userFind.id === toUserId))?.name ?? ""}
                                    </span>
                                  </div>

                                  <span className="text-base text-gray-600">
                                    online
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <EllipsisVerticalIcon
                                  className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition duration-500 ease-in-out hover:bg-gray-200 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* Messages */}
                            <div className="flex flex-col space-y-4 overflow-y-auto p-3">
                              {
                                messages.map((message) => (
                                  <div key={String(message.id)} className="chat-message">
                                    <div className={`flex items-end ${user.id === message.to && "justify-end"}`}>
                                      <div className="order-2 mx-2 flex max-w-xs flex-col items-start space-y-2 text-xs">
                                        <div>
                                          <span className="inline-block rounded-lg rounded-bl-none bg-gray-300 px-4 py-2 text-gray-600">
                                            {message.text}
                                          </span>
                                        </div>
                                      </div>

                                      <Image
                                        className={`h-6 w-6 rounded-full ${user.id === message.to && "order-2"}`}
                                        src={user.id === message.to ? (user.avatar ?? "") : (users.find(user => user.id === message.to)?.avatar ?? "")}
                                        width={24}
                                        height={24}
                                        alt={user.id === message.to ? (user.name ?? "") : (users.find(user => user.id === message.to)?.name ?? "")}
                                      />
                                    </div>
                                  </div>
                                ))
                              }
                            </div>

                            {/* Input/Botões Message */}
                            <div className="mb-2 border-t-2 border-gray-200 px-4 pt-4 sm:mb-0">
                              <div className="relative flex">
                                <span className="absolute inset-y-0 flex items-center">
                                  <button type="button" className="inline-flex h-12 w-12 items-center justify-center rounded-full text-gray-500 transition duration-500 ease-in-out hover:bg-gray-300 focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-gray-600">
                                      <path strokeLinecap='round' strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                                    </svg>
                                  </button>
                                </span>

                                <input
                                  ref={messageInput}
                                  type="text"
                                  placeholder="Digite a sua mensagem..."
                                  className="w-full rounded-md bg-gray-200 py-3 pl-12 text-gray-600 placeholder-gray-600 focus:placeholder-gray-400 focus:outline-none"
                                  value={message}
                                  onChange={(event) => setMessage(event.target.value)}
                                />

                                <div className="absolute inset-y-0 right-0 flex items-center">
                                  <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition duration-500 ease-in-out hover:bg-gray-300 focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-gray-600">
                                      <path strokeLinecap='round' strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                    </svg>
                                  </button>

                                  <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition duration-500 ease-in-out hover:bg-gray-300 focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-gray-600">
                                      <path strokeLinecap='round' strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                      <path strokeLinecap='round' strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                  </button>

                                  <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition duration-500 ease-in-out hover:bg-gray-300 focus:outline-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-gray-600">
                                      <path strokeLinecap='round' strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                  </button>

                                  <button type="button" className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-3 py-3 text-white transition duration-500 ease-in-out hover:bg-blue-600 focus:outline-none" onClick={() => handleSendMessage()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 rotate-90 transform">
                                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )
                    }
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    )
  )
}
