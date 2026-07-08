// AllUsers.js

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser } from '../../redux/actions/userAction';
import { MdDelete } from 'react-icons/md';

const AllUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const { users, loading, error } = useSelector((state) => state.users);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 items-center justify-center text-center">
            <thead>
              <tr>
                <th className="px-4 py-4 border-b-2 border-gray-200 bg-gray-100">ID</th>
                <th className="px-4 py-4 border-b-2 border-gray-200 bg-gray-100">Name</th>
                <th className="px-4 py-4 border-b-2 border-gray-200 bg-gray-100">Email</th>
                <th className="px-4 py-4 border-b-2 border-gray-200 bg-gray-100">Delete</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-4 py-3 border-b border-gray-200">{user._id}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{user.name}</td>
                  <td className="px-4 py-3 border-b border-gray-200">{user.email}</td>
                  <td className="px-4 py-3 border-b border-gray-200">
                    <button onClick={() => handleDelete(user._id)}>
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
