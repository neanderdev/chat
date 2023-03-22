import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react'

import { socket } from '../services/io'

export default function CadastrarUsuario() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState("");

    const router = useRouter();

    async function handleCreateUser(event: FormEvent) {
        event.preventDefault();

        const data = {
            email,
            name,
            avatar,
        };

        socket.emit("start", data);

        localStorage.setItem("user", JSON.stringify(data));

        router.push("/");
    }

    return (
        <div className="isolate bg-white py-16 px-6 sm:py-20 lg:px-8">
            <div className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]">
                <svg
                    className="relative left-1/2 -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-40rem)] sm:h-[42.375rem]"
                    viewBox="0 0 1155 678"
                >
                    <path
                        fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
                        fillOpacity=".3"
                        d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
                    />
                    <defs>
                        <linearGradient
                            id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                            x1="1155.49"
                            x2="-78.208"
                            y1=".177"
                            y2="474.645"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#9089FC" />
                            <stop offset={1} stopColor="#FF80B5" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Seja bem-vindo ao nosso CHAT
                </h2>

                <p className="mt-2 text-lg leading-8 text-gray-600">
                    Faça o cadastro para acessar o nosso CHAT, caso já tenha basta preencher com o mesmo dados
                </p>
            </div>

            <form className="mx-auto mt-16 max-w-xl sm:mt-20" onSubmit={handleCreateUser}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold leading-6 text-gray-900"
                        >
                            E-mail
                        </label>

                        <div className="mt-2.5">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus:outline-none sm:text-sm sm:leading-6"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-900">
                            Name
                        </label>

                        <div className="mt-2.5">
                            <input
                                type="text"
                                name="name"
                                id="name"
                                className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus:outline-none sm:text-sm sm:leading-6"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="avatar" className="block text-sm font-semibold leading-6 text-gray-900">
                            Avatar
                        </label>

                        <div className="mt-2.5">
                            <input
                                type="text"
                                name="avatar"
                                id="avatar"
                                className="block w-full rounded-md border-0 py-2 px-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus:outline-none sm:text-sm sm:leading-6"
                                value={avatar}
                                onChange={(event) => setAvatar(event.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <button
                        type="submit"
                        className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Acessar
                    </button>
                </div>
            </form>
        </div>
    )
}