import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const {
    getUsers,
    getGroups,
    users,
    groups,
    selectedUser,
    selectedGroup,
    setSelectedUser,
    setSelectedGroup,
    unseenMessages,
    unseenGroupMessages,
    setUnseenMessages,
    setUnseenGroupMessages,
    createGroup,
    setMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [memberIds, setMemberIds] = useState([]);
  const navigate = useNavigate();

  const filteredUsers = input ? users.filter((user) => user.fullName.toLowerCase().includes(input.toLowerCase())) : users;
  const filteredGroups = input ? groups.filter((group) => group.name.toLowerCase().includes(input.toLowerCase())) : groups;

  useEffect(() => {
    getUsers();
    getGroups();
  }, [onlineUsers, getUsers, getGroups]);

  const handleSelectUser = (user) => {
    setSelectedGroup(null);
    setSelectedUser(user);
    setMessages([]);
    setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
  };

  const handleSelectGroup = (group) => {
    setSelectedUser(null);
    setSelectedGroup(group);
    setMessages([]);
    setUnseenGroupMessages((prev) => ({ ...prev, [group._id]: 0 }));
  };

  const toggleMember = (id) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((memberId) => memberId !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (memberIds.length === 0) {
      toast.error("Select at least one member");
      return;
    }
    await createGroup({ name: groupName.trim(), memberIds });
    setGroupName("");
    setMemberIds([]);
    setShowGroupForm(false);
  };



  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${(selectedUser || selectedGroup) ? "max-md:hidden" : ''}`}>

      <div className='pb-5'>
        <div className='flex justify-between items-center'>
          <img src={assets.logo} alt='logo' className='max-w-40' />
          <div className='relative py-2 group'>
            <img src={assets.menu_icon} alt='logo' className='max-h-5 cursor-pointer' />
            <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border-gray-600 text-gray-100 hidden group-hover:block'>
              <p onClick={() => navigate('/profile')} className='cursor-pointer text-sm'>Edit Profile</p>
              <hr className='my-2 border-t border-gray-500' />
              <p onClick={() => logout()} className='cursor-pointer text-sm'>Logout</p>
            </div>
          </div>
        </div>
        <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
          <img src={assets.search_icon} alt="search" className='w-3' />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-x5 placeholder-[#c8c8c8] flex-1"
            placeholder='Search users or groups...'
          />
        </div>
      </div>

      <div className='space-y-4'>
        <div className='bg-[#282142] rounded-xl p-4'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-sm text-gray-300'>Groups</p>
              <p className='text-white font-semibold'>Chat with multiple people</p>
            </div>
            <button
              onClick={() => setShowGroupForm((prev) => !prev)}
              className='text-sm bg-violet-600 px-3 py-1 rounded-full'
            >
              {showGroupForm ? 'Cancel' : 'Create'}
            </button>
          </div>

          {showGroupForm && (
            <div className='mt-4 space-y-3'>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                type='text'
                placeholder='Group name'
                className='w-full bg-[#18182f] rounded-xl p-3 text-white outline-none'
              />
              <div className='max-h-40 overflow-y-auto rounded-xl border border-[#3f3f5b] p-3'>
                <p className='text-xs text-gray-400 mb-2'>Select members</p>
                {users.map((user) => (
                  <label key={user._id} className='flex items-center gap-2 text-sm text-white mb-2'>
                    <input
                      type='checkbox'
                      checked={memberIds.includes(user._id)}
                      onChange={() => toggleMember(user._id)}
                    />
                    {user.fullName}
                  </label>
                ))}
              </div>
              <button
                onClick={handleCreateGroup}
                className='w-full bg-indigo-600 py-2 rounded-full text-white text-sm'
              >
                Create Group
              </button>
            </div>
          )}
        </div>

        <div className='space-y-2'>
          {filteredGroups.map((group, index) => (
            <div
              key={index}
              onClick={() => handleSelectGroup(group)}
              className={`relative p-3 rounded-xl cursor-pointer bg-[#282142] ${selectedGroup?._id === group._id ? 'border border-violet-500' : ''}`}
            >
              <p className='font-semibold'>{group.name}</p>
              <p className='text-gray-400 text-xs'>{group.members.length} members</p>
              {unseenGroupMessages[group._id] > 0 && (
                <span className='absolute top-3 right-3 text-x5 h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50'>
                  {unseenGroupMessages[group._id]}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className='text-gray-400 text-xs uppercase tracking-[0.2em]'>Direct chats</div>
        <div className='flex flex-col'>
          {filteredUsers.map((user, index) => (
            <div
              onClick={() => handleSelectUser(user)}
              key={index}
              className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id ? 'bg-[#28142]/50' : ''}`}
            >
              <img src={user?.profilePic || assets.avatar_icon} alt='' className='w-[35px] aspect-[1/1] rounded-full' />
              <div className='flex flex-col leading-5'>
                <p>{user.fullName}</p>
                {onlineUsers.includes(user._id)
                  ? <span className='text-green-400 text-x5'>Online</span>
                  : <span className='text-neutral-400 text-x5'>Offline</span>
                }
              </div>
              {unseenMessages[user._id] > 0 && (
                <p className='absolute top-4 right-4 text-x5 h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50'>
                  {unseenMessages[user._id]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Sidebar