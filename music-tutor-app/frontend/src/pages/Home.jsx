import React, {useContext, useState} from 'react'
import { UserContext } from '../context/UserContext'

const Home = () => {
  // grab user context
  // user has /user_id, role, firstname. lastname, and email
  const {user, setUser} = useContext(UserContext);
  console.log(user);
  
 
  return (
    <>
    <div>Home</div>
    { user ? (<p>Hello, {user.role } {user.firstName}</p>):(<p>Not logged in</p>)}
    </>
  )
}

export default Home