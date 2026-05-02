import React, { useContext } from 'react'
import Sidebar from '../Components/Sidebar'
import Rightslidebar from '../Components/Rightslidebar'
import Chatcontainer from '../Components/Chatcontainer'
import { ChatContext } from '../../context/ChatContext'

const Homepage = () => {

   const { selectedUser, selectedGroup } = useContext(ChatContext)

  return (
    <div className='border w-full h-screen sm:px-[15%] sm:py-[5%]'>
        <h1> Home Page</h1>
        <div className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-[100%] grid grid-cols-1 relative ${(selectedUser || selectedGroup) ?
        'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'} `}>
            <Sidebar/>
            <Chatcontainer/>
            <Rightslidebar />

        </div>
    </div>
  )
}

export default Homepage