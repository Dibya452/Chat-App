import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../Liberary/uilt'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Chatcontainer = () => {
  const { messages, selectedUser, selectedGroup, setSelectedUser, setSelectedGroup, sendMessage, getMessages, setMessages } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const scrollend = useRef();

      const [input, setInput] = useState('');
//handle sending message
      const handlesendMessage = async (e) => {
        e?.preventDefault();
        if (!input.trim()) return null;
        await sendMessage({ text: input.trim() });
        setInput("");
      };
//handle sending an image
const handleSendImage = async (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith("image/")) {
    toast.error("select an image file");
    return;
  }
  const reader = new FileReader();

  reader.onloadend = async () => {
    await sendMessage({ image: reader.result });
    e.target.value = '';
  };
  reader.readAsDataURL(file);
};

useEffect(() => {
  if (selectedUser) {
    getMessages(selectedUser._id);
  } else if (selectedGroup) {
    getMessages(selectedGroup._id, "group");
  }
}, [selectedUser, selectedGroup]);

    useEffect(()=>{
      if(scrollend.current && messages){
        scrollend.current.scrollIntoView({behavior :'smooth'})
      }
    },[messages])

  return selectedUser || selectedGroup ? (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
      {/*-----Header-------- */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
        <img src={(selectedGroup ? selectedGroup.members?.[0]?.profilePic : selectedUser?.profilePic) || assets.avatar_icon} alt='' className='w-8 rounded-full'/>
        <div className='flex-1'>
          <p className='text-lg text-white flex items-center gap-2'>
            {selectedGroup ? selectedGroup.name : selectedUser.fullName}
            {selectedUser && onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
          </p>
          {selectedGroup ? (
            <p className='text-xs text-gray-400'>{selectedGroup.members.length} members</p>
          ) : null}
        </div>
        <img onClick={() => {
            setSelectedUser(null);
            setSelectedGroup(null);
            setMessages([]);
          }}
          src={assets.arrow_icon}
          alt=''
          className='md:hidden max-w-7'
        />
        <img src={assets.help_icon_icon} alt='' className='md:hidden max-w-5' />
      </div>
      {/*---------Chat Area---------*/}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messages.map((msg, index) => {
          const sender = msg.senderId || {};
          const senderId = sender._id || sender;
          const isMe = String(senderId) === String(authUser._id);
          return (
            <div key={index} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {/* other user's avatar on the left */}
              {!isMe && (
                <div className='flex flex-col items-center text-center text-x5'>
                  <img src={(selectedGroup ? sender.profilePic : selectedUser?.profilePic) || assets.avatar_icon} className='w-7 rounded-full' alt='' />
                  {selectedGroup && <p className='text-xs text-white'>{sender.fullName}</p>}
                  <p className='text-gray-500 text-xs'>{formatMessageTime(msg.createdAt)}</p>
                </div>
              )}

              {/* message bubble or image */}
              {msg.image ? (
                <img
                  src={msg.image}
                  alt=''
                  className={`max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8 ${isMe ? 'order-2' : ''}`}
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all text-white ${
                    isMe
                      ? 'bg-indigo-600/90 rounded-bl-none text-white'
                      : 'bg-zinc-700/60 rounded-br-none text-white'
                  }`}
                >
                  {msg.text}
                </p>
              )}

              {/* my avatar on the right */}
              {isMe && (
                <div className='flex flex-col items-center text-center text-x5'>
                  <img src={authUser?.profilePic || assets.avatar_icon} className='w-7 rounded-full' alt='' />
                  <p className='text-gray-500 text-xs'>{formatMessageTime(msg.createdAt)}</p>
                </div>
              )}
            </div>
          );
        })}
<div ref={scrollend}></div>
      </div>
{/*------bottom area-------- */}

      <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 '>
      <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
        <input onChange={(e)=>setInput(e.target.value)} value={input} onKeyDown={(e)=>e.key === "Enter" ? handlesendMessage(e) : null} type='text' placeholder='Send a message' className='flex-1 text-sm p-3 border-none roounded-lg outline-none text-white placeholder-gray-400' />
        <input onChange={handleSendImage} type='file' id='image' accept='image/png, image/jpeg' hidden />
        <label htmlFor='image' >
          <img src={assets.gallery_icon} alt="" className='w-5 mr-2 cursor-pointer' />
        </label>
      </div>
        <img onClick={handlesendMessage} src={assets.send_button} alt='' className='w-7 cursor-pointer' />

      </div>

    </div>


      ) : (
        <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
          <img src={assets.logo_icon} className=' max-w-16' />
          <p className='text-lg font-medium text-white' >Chat anytime, anywhere</p>
        </div>
  )
}

export default Chatcontainer