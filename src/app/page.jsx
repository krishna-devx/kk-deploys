"use client";

import Link from 'next/link';
import { useAuth } from '../context/user';
import Image from "next/image";

export default function Home() {
  const { session, status, signIn, signOut } = useAuth();
  
  console.log("session>>", session);

  if (status === 'loading') {
    return <div className="w-full h-screen flex justify-center items-center">
      <p className="text-2xl">Loading...</p>
    </div>;
  }

  if (session) {
    return (
      <div className="w-full h-screen flex flex-col mt-20 items-center">
        <div className="w-44 h-44 relative mb-4">
          <Image
            src={session.user?.image}
            fill
            alt=""
            className="object-cover rounded-full"
          />
        </div>
        <p className="text-2xl mb-2">Welcome <span className="font-bold">{session.user?.name}</span>. Signed In As</p>
        <p className="font-bold mb-4">{session.user?.email}</p>
        <Link href='deploy' className="bg-green-600 py-2 px-6  mb-4 rounded-md" >Deploy Your Next JS Repo</Link>
        <button className="bg-red-600 py-2 px-6 rounded-md" onClick={signOut}>Sign out</button>
      </div> 
    );
  }

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <p className="text-2xl mb-2">Not Signed In</p>
      <button className="bg-none border-gray-300 border py-2 px-6 rounded-md mb-2" onClick={() => signIn('github')}>Sign in with github</button>
    </div>
  );
}