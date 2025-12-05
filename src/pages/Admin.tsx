import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Store, MessageSquare, TrendingUp, Check, X } from 'lucide-react';

const data = [
  { name: 'Mon', users: 400 },
  { name: 'Tue', users: 300 },
  { name: 'Wed', users: 550 },
  { name: 'Thu', users: 450 },
  { name: 'Fri', users: 800 },
  { name: 'Sat', users: 1200 },
  { name: 'Sun', users: 950 },
];

export const Admin = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white hidden lg:flex flex-col p-4">
         <div className="mb-10 px-2">
           <h2 className="text-xl font-bold tracking-tight text-[#FF6B35]">Admin Panel</h2>
         </div>
         <nav className="space-y-2">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-lg text-white font-medium">
               <TrendingUp className="w-5 h-5" /> Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg font-medium transition-colors">
               <Store className="w-5 h-5" /> Restaurants
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg font-medium transition-colors">
               <Users className="w-5 h-5" /> Users
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg font-medium transition-colors">
               <MessageSquare className="w-5 h-5" /> Reviews
            </a>
         </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
         <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
            <p className="text-slate-500">Welcome back, Admin.</p>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Users className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-slate-800">12,345</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Store className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-sm text-gray-500">Active Restaurants</p>
                  <p className="text-2xl font-bold text-slate-800">842</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <MessageSquare className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-sm text-gray-500">New Reviews Today</p>
                  <p className="text-2xl font-bold text-slate-800">156</p>
               </div>
            </div>
         </div>

         {/* Chart */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 className="font-bold text-slate-800 mb-6">New User Registrations</h3>
            <div style={{ width: '100%', height: 320, minHeight: 320 }}>
               <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={data}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                     <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                     <Line type="monotone" dataKey="users" stroke="#FF6B35" strokeWidth={3} dot={{fill: '#FF6B35', strokeWidth: 2, stroke: '#fff', r: 4}} activeDot={{r: 6}} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Table */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
               <h3 className="font-bold text-slate-800">Pending Restaurant Approvals</h3>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                     <tr>
                        <th className="px-6 py-4 font-medium">Restaurant Name</th>
                        <th className="px-6 py-4 font-medium">Submitter</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {[1,2,3].map((i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                           <td className="px-6 py-4 font-medium text-slate-800">Mom's Kitchen {i}</td>
                           <td className="px-6 py-4 text-gray-500">john_doe{i}</td>
                           <td className="px-6 py-4 text-gray-500">Oct 2{i}, 2023</td>
                           <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">Pending</span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="p-1 rounded hover:bg-green-50 text-green-600 mr-2"><Check className="w-4 h-4" /></button>
                              <button className="p-1 rounded hover:bg-red-50 text-red-600"><X className="w-4 h-4" /></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};