import React, { useState } from 'react';
import { User, Eye, Bell, Lock, CheckCircle, Save, Moon, Sun, Type, Volume2, Mic, Keyboard } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export default function SettingsScreen() {
  const { navigateTo, userRole } = useNavigation();
  const [activeTab, setActiveTab] = useState('Profile');

  // Profile Form State
  const [profile, setProfile] = useState({
    name: 'Pranali Nikam',
    email: 'pranali.nikam@vsit.edu.in',
    rollNo: 'VSIT2025001',
    dept: 'Data Science',
    year: 'Third Year'
  });

  const handleSaveProfile = () => {
    // Mock save
    alert('Profile updated successfully!');
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <h1 className="text-2xl font-bold text-[#212529] mb-6">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-[260px] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden h-fit">
          {[
            { id: 'Profile', icon: User, label: 'Profile' },
            { id: 'Accessibility', icon: Eye, label: 'Accessibility' },
            { id: 'Notifications', icon: Bell, label: 'Notifications' },
            { id: 'Privacy', icon: Lock, label: 'Privacy' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-6 py-4 flex items-center gap-3 font-medium transition-colors border-l-4 ${
                activeTab === item.id 
                  ? 'border-[#2B5797] bg-[#E8F0FE] text-[#2B5797]' 
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white p-8 rounded-lg shadow-sm border border-gray-100 min-h-[500px]">
          
          {activeTab === 'Profile' && (
            <div className="max-w-xl space-y-6">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-[#E8F0FE] text-[#2B5797] text-3xl font-bold flex items-center justify-center border-4 border-white shadow-sm">
                  PN
                </div>
                <div>
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 text-gray-700">
                    Change Picture
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
                  <input 
                    type="text" 
                    value={profile.rollNo}
                    disabled
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select 
                    value={profile.dept}
                    onChange={(e) => setProfile({...profile, dept: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] outline-none bg-white"
                  >
                    <option>Data Science</option>
                    <option>Machine Learning</option>
                    <option>IT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select 
                    value={profile.year}
                    onChange={(e) => setProfile({...profile, year: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B5797] outline-none bg-white"
                  >
                    <option>Third Year</option>
                    <option>Second Year</option>
                    <option>First Year</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  className="px-8 py-3 bg-[#2B5797] text-white rounded-full font-bold hover:bg-[#1a3a6e] transition-colors flex items-center gap-2"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Accessibility' && (
            <div className="max-w-2xl space-y-8">
              
              {/* Display */}
              <div>
                <h3 className="font-bold text-[#212529] mb-4 flex items-center gap-2">
                  <Eye size={20} className="text-[#2B5797]" /> Display Settings
                </h3>
                <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-3">Font Size</label>
                    <div className="flex gap-2">
                      {['Small', 'Medium', 'Large', 'Extra Large'].map((size, i) => (
                        <button key={size} className={`flex-1 py-2 px-3 border rounded-lg text-sm font-medium transition-colors ${i === 1 ? 'border-[#2B5797] bg-[#E8F0FE] text-[#2B5797]' : 'border-gray-300 bg-white hover:bg-gray-100'}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <span className="text-sm text-gray-700 font-medium">High Contrast Mode</span>
                    <button className="w-12 h-6 bg-gray-300 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B5797] focus:ring-offset-2">
                      <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <span className="text-sm text-gray-700 font-medium">Reduce Motion</span>
                    <button className="w-12 h-6 bg-[#2B5797] rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B5797] focus:ring-offset-2">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" />
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-3">Color Blind Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['None', 'Protanopia', 'Deuteranopia', 'Tritanopia'].map((mode, i) => (
                        <div key={mode} className="flex items-center gap-2">
                          <input type="radio" name="colorblind" defaultChecked={i===0} className="text-[#2B5797] focus:ring-[#2B5797]" />
                          <span className="text-sm text-gray-600">{mode}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio */}
              <div>
                <h3 className="font-bold text-[#212529] mb-4 flex items-center gap-2">
                  <Volume2 size={20} className="text-[#2B5797]" /> Audio Settings
                </h3>
                <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-3">Text-to-Speech Speed</label>
                    <div className="flex gap-2">
                      {['Slow', 'Normal', 'Fast'].map((speed, i) => (
                        <button key={speed} className={`flex-1 py-2 px-3 border rounded-lg text-sm font-medium transition-colors ${i === 1 ? 'border-[#2B5797] bg-[#E8F0FE] text-[#2B5797]' : 'border-gray-300 bg-white hover:bg-gray-100'}`}>
                          {speed}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <span className="text-sm text-gray-700 font-medium">Voice Feedback</span>
                    <button className="w-12 h-6 bg-[#2B5797] rounded-full relative transition-colors">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <span className="text-sm text-gray-700 font-medium">Closed Captions</span>
                    <button className="w-12 h-6 bg-[#2B5797] rounded-full relative transition-colors">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button className="px-8 py-3 bg-[#2B5797] text-white rounded-full font-bold hover:bg-[#1a3a6e] transition-colors flex items-center gap-2">
                  <CheckCircle size={18} /> Apply Accessibility Settings
                </button>
              </div>

            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="max-w-xl space-y-6">
              <h3 className="font-bold text-[#212529] mb-4">Notification Preferences</h3>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                {[
                  { label: 'Email Notifications', checked: true },
                  { label: 'In-App Notifications', checked: true },
                  { label: 'Assignment Reminders', checked: true },
                  { label: 'Quiz Reminders', checked: true },
                  { label: 'Promotional Emails', checked: false },
                  { label: 'Newsletter', checked: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                    <div className={`w-6 h-6 rounded border flex items-center justify-center cursor-pointer ${item.checked ? 'bg-[#2B5797] border-[#2B5797]' : 'bg-white border-gray-300'}`}>
                      {item.checked && <CheckCircle size={14} className="text-white" />}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 flex justify-end">
                <button className="px-8 py-3 bg-[#2B5797] text-white rounded-full font-bold hover:bg-[#1a3a6e] transition-colors">
                  Save Preferences
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'Privacy' && (
             <div className="max-w-xl space-y-6">
               <h3 className="font-bold text-[#212529] mb-4">Privacy & Data</h3>
               
               <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                 <h4 className="font-bold text-[#2B5797] text-sm mb-2">Data Sharing</h4>
                 <p className="text-xs text-gray-600 leading-relaxed">
                   Your academic data is shared only with authorized faculty members. We do not sell your personal information to third parties.
                 </p>
               </div>

               <div className="space-y-4">
                 <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex justify-between items-center group">
                   <span className="font-medium text-gray-700">Download my data</span>
                   <Download size={18} className="text-gray-400 group-hover:text-[#2B5797]" />
                 </button>
                 <button className="w-full text-left p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 flex justify-between items-center group">
                   <span className="font-medium text-[#D13438]">Delete account</span>
                   <AlertTriangle size={18} className="text-[#D13438]" />
                 </button>
               </div>
             </div>
          )}

        </div>

      </div>

    </div>
  );
}

// Helper icon
import { Download } from 'lucide-react';
