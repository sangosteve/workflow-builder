import React from 'react'
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
const DashboardPage = async() => {
     const { userId } = await auth();
  const user = await currentUser();
  console.log(user)
    return (
        <div>
      <h1>Dashboard</h1>
      <p>User ID: {userId}</p>
      <p>Hello, {user?.firstName}!</p>
    </div>
    )
}

export default DashboardPage