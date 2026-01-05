import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import paceconLogo from '../assets/pacecon_logo.png';
import Sugee_Logo from '../assets/Sugee_Logo.png';
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  PackageMinus,
  ShoppingCart,
  FileText,
  Users,
  BarChart3,
  MapPin,
  LogOut,
  Barcode,
  Folder,
  PlusSquare,
} from 'lucide-react';

const menuItems = {
  admin: [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/inward', icon: PackagePlus, label: 'Inward Items' },
    { path: '/outward', icon: PackageMinus, label: 'Outward Items' },
    { path: '/purchase-orders', icon: ShoppingCart, label: 'Purchase Items' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/users', icon: Users, label: 'User Management' },
  ],

  outward_executive_inward_executive: [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Item List' },
    { path: '/inward', icon: FileText, label: 'Inward Items' },
    { path: '/assign-items', icon: MapPin, label: 'Assign Items' },
    { path: '/assigned-items', icon: FileText, label: 'Assigned Items' },
    { path: '/categories', icon: Folder, label: 'Categories' },
    { path: '/barcode', icon: Barcode, label: 'Barcode' },
    { path: '/quantity-form', icon: PlusSquare, label: 'Add Quantity' },
    { path: '/send-items', icon: PackageMinus, label: 'Send Items' },
    { path: '/outward', icon: FileText, label: 'Outward List' },
    { path: '/productreport', icon: FileText, label: 'Products Report' },
  ],

  site_manager: [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/request-products', icon: ShoppingCart, label: 'Request Products' },
    { path: '/my-requests', icon: FileText, label: 'My Requests' },
    { path: '/dispatched-items', icon: FileText, label: 'Dispatched Items' },
    { path: '/received-items', icon: Package, label: 'Received Items' },
  ],

  owner: [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/reports', icon: BarChart3, label: 'Monthly Reports' },
    { path: '/site-activities', icon: MapPin, label: 'Site Activities' },
  ],

  it_admin: [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'User Management' },
    { path: '/site-managers', icon: MapPin, label: 'Site Managers' },
  ],

  purchase_manager: [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/create-purchase-order', icon: ShoppingCart, label: 'Create Purchase Items' },
    { path: '/purchase-orders', icon: FileText, label: 'Purchase Items' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // 🧠 Normalize role to handle combined sidebar
  let role = user?.role;
  if (role === 'inward_executive' || role === 'outward_executive') {
    role = 'outward_executive_inward_executive';
  }

  const userMenuItems = menuItems[role] || [];

  return (
    <div className="flex flex-col w-64 min-h-screen bg-white border-r border-gray-200 shadow-md">
      {/* Header with Logos */}
      <div className="flex flex-col items-center p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4 mb-4">
          <img src={paceconLogo} alt="Pacecon Logo" className="h-8 w-auto object-contain" />
          <div className="w-px h-8 bg-gray-300" />
          <img src={Sugee_Logo} alt="Sugee Logo" className="h-14 w-auto object-contain" />
        </div>

        <h2 className="text-2xl font-extrabold text-gray-900 text-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 shadow-sm tracking-tight">
          Sugee Store Management
        </h2>

        <div className="mt-2 text-center">
          <p className="text-sm font-medium text-gray-700">{user?.name}</p>
          <p className="text-xs text-gray-400 capitalize">{role?.replaceAll('_', ' ')}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {userMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 
                    ${isActive
                      ? 'bg-blue-100 text-blue-800 font-semibold shadow-sm'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-black'}`} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;