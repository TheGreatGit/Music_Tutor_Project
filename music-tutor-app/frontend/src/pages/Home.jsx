import React, {useContext} from 'react'
import { UserContext } from '../context/UserContext'

const Home = () => {
  // grab user context
  const {user, setUser} = useContext(UserContext)
  return (
    <>
    <div>Home</div>
    { user ? (<p>Hello, {user.name}</p>):(<p>Not logged in</p>)}
    
    </>
  )
}

export default Home