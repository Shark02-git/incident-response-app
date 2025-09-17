
import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../../lib/mockData.ts';
import { useTranslation } from '../../lib/i18n.tsx';
import ConfirmationModal from '../ConfirmationModal.tsx';

interface ManageUsersProps {
    users: User[];
    onAddUser: (newUser: Omit<User, 'id' | 'status'>) => void;
    onUpdateUserStatus: (userId: string, status: UserStatus) => void;
    onDeleteUser: (userId: string) => void;
}

const CURRENT_ADMIN_EMAIL = 'demo@example.com'; // In a real app, this would come from auth context

const ManageUsers: React.FC<ManageUsersProps> = ({ users, onAddUser, onUpdateUserStatus, onDeleteUser }) => {
    const { t } = useTranslation();
    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Operator' as UserRole });
    const [modalState, setModalState] = useState<{ isOpen: boolean; userId: string | null }>({ isOpen: false, userId: null });

    const handleAddClick = () => {
        if (newUser.name && newUser.email) {
            onAddUser(newUser);
            setIsAdding(false);
            setNewUser({ name: '', email: '', role: 'Operator' });
        }
    };
    
    const handleDeleteClick = (userId: string) => {
        setModalState({ isOpen: true, userId });
    };

    const handleConfirmDelete = () => {
        if (modalState.userId) {
            onDeleteUser(modalState.userId);
        }
        setModalState({ isOpen: false, userId: null });
    };
    
    return (
        <div>
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, userId: null })}
                onConfirm={handleConfirmDelete}
                title={t('settings.users.deleteConfirmTitle')}
                message={t('settings.users.deleteConfirmMessage')}
                confirmText={t('common.delete')}
            />
            <h3 className="text-2xl font-bold text-slate-800 mb-4">{t('settings.users.title')}</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">{t('settings.users.colName')}</th>
                            <th scope="col" className="px-6 py-3">{t('settings.users.colEmail')}</th>
                            <th scope="col" className="px-6 py-3">{t('settings.users.colRole')}</th>
                            <th scope="col" className="px-6 py-3">{t('settings.users.colStatus')}</th>
                            <th scope="col" className="px-6 py-3">{t('settings.users.colActions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-white border-b border-slate-200 hover:bg-slate-50">
                                <td className="px-6 py-4 text-slate-900">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{t(`userRole.${user.role.toLowerCase()}`)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t(`userStatus.${user.status.toLowerCase()}`)}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => onUpdateUserStatus(user.id, user.status === 'Active' ? 'Blocked' : 'Active')}
                                            disabled={user.email === CURRENT_ADMIN_EMAIL}
                                            className="font-medium text-yellow-600 hover:text-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-yellow-600"
                                        >
                                            {user.status === 'Active' ? t('settings.users.block') : t('settings.users.unblock')}
                                        </button>
                                        <span className="text-slate-300">|</span>
                                        <button
                                            onClick={() => handleDeleteClick(user.id)}
                                            disabled={user.email === CURRENT_ADMIN_EMAIL}
                                            className="font-medium text-red-600 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-red-600"
                                        >
                                            {t('common.delete')}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {isAdding && (
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <td className="px-6 py-4"><input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="bg-slate-100 p-2 rounded w-full border border-slate-300" placeholder={t('settings.users.placeholderName')} /></td>
                                <td className="px-6 py-4"><input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="bg-slate-100 p-2 rounded w-full border border-slate-300" placeholder={t('settings.users.placeholderEmail')} /></td>
                                <td className="px-6 py-4">
                                    <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="bg-slate-100 p-2 rounded w-full border border-slate-300">
                                        <option value="Operator">{t('userRole.operator')}</option>
                                        <option value="Admin">{t('userRole.admin')}</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4"></td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleAddClick} className="font-medium text-green-600 hover:text-green-500">{t('common.save')}</button>
                                        <span className="text-slate-300">|</span>
                                        <button onClick={() => setIsAdding(false)} className="font-medium text-slate-500 hover:text-slate-400">{t('common.cancel')}</button>
                                    </div>
                                </td>
                            </tr>
                         )}
                    </tbody>
                </table>
            </div>
            {!isAdding && (
                 <div className="mt-6">
                    <button onClick={() => setIsAdding(true)} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors text-white font-medium">
                        {t('settings.users.addNew')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;