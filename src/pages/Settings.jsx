import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Save, UserPlus, Shield, Users, Trash2, Mail, Sparkles } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const ROLES = ['admin', 'accountant', 'viewer'];

const unwrap = (res, fallback) => {
    if (res && typeof res === 'object' && 'data' in res) {
        return res.data;
    }
    return res ?? fallback;
};

const RoleBadge = ({ role }) => {
    const color = role === 'admin'
        ? 'bg-blue-50 text-blue-600'
        : role === 'accountant'
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-slate-100 text-slate-600';

    return (
        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${color}`}>
            {role}
        </span>
    );
};

export default function Settings() {
    const toast = useToast();
    const { user } = useAuth();
    const currentUser = user?.user ?? user;
    const currentRole = currentUser?.role || 'viewer';
    const isAdmin = currentRole === 'admin';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [organization, setOrganization] = useState({ name: 'NanoBooks Company', plan: 'free' });

    const [settings, setSettings] = useState({
        taxes: [{ name: 'Standard VAT', rate: 7.5, status: 'Active' }],
        currencies: [{ code: 'USD', isDefault: true, rate: '1.0000' }],
        multiCurrencyEnabled: true,
        displayFormat: { symbol: 'Before', separator: 'Dot' }
    });

    const [members, setMembers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: '', role: 'viewer' });

    const defaultTax = useMemo(() => {
        const active = settings.taxes.find((t) => (t.status || '').toLowerCase() === 'active') || settings.taxes[0];
        return Number(active?.rate || 0);
    }, [settings.taxes]);

    const pendingInvites = useMemo(
        () => invitations.filter((invite) => (invite.status || '').toLowerCase() === 'pending').length,
        [invitations]
    );

    const totalSeatsUsed = members.length + pendingInvites;
    const seatLimit = organization.plan === 'enterprise' ? Infinity : organization.plan === 'pro' ? 5 : 1;
    const seatsRemaining = seatLimit === Infinity ? 'Unlimited' : Math.max(seatLimit - totalSeatsUsed, 0);

    const loadPage = useCallback(async () => {
        setLoading(true);
        try {
            const [orgRes, settingsRes, membersRes, invitesRes] = await Promise.all([
                api.organization.get(),
                api.settings.get(),
                api.organization.team.getMembers(),
                isAdmin ? api.organization.invitations.getAll().catch(() => []) : Promise.resolve([])
            ]);

            const org = unwrap(orgRes, {});
            const st = unwrap(settingsRes, {});
            const team = unwrap(membersRes, []);
            const inv = unwrap(invitesRes, []);

            setOrganization({
                id: org?.id,
                name: org?.name || currentUser?.companyName || currentUser?.company_name || 'NanoBooks Company',
                plan: org?.plan || 'free'
            });

            setSettings((prev) => ({
                ...prev,
                ...st,
                taxes: st?.taxes?.length ? st.taxes : prev.taxes,
                currencies: st?.currencies?.length ? st.currencies : prev.currencies,
                displayFormat: st?.displayFormat || prev.displayFormat
            }));

            setMembers(Array.isArray(team) ? team : []);
            setInvitations(Array.isArray(inv) ? inv : []);
        } catch (error) {
            toast(error.message || 'Failed to load organization settings', 'error');
        } finally {
            setLoading(false);
        }
    }, [isAdmin, currentUser?.companyName, currentUser?.company_name, toast]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await api.settings.update(settings);
            toast('Settings saved successfully', 'success');
        } catch (error) {
            toast(error.message || 'Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!isAdmin) {
            toast('Only admins can invite staff', 'warning');
            return;
        }

        if (seatLimit !== Infinity && totalSeatsUsed >= seatLimit) {
            toast('Seat limit reached for your current plan. Upgrade to add more staff.', 'warning');
            return;
        }

        setInviteLoading(true);
        try {
            const res = await api.organization.invitations.create(inviteForm);
            const created = unwrap(res, null);
            setInviteForm({ email: '', role: 'viewer' });
            if (created) {
                setInvitations((prev) => [created, ...prev]);
            }
            toast('Invitation sent successfully', 'success');
        } catch (error) {
            toast(error.message || 'Failed to send invitation', 'error');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRoleChange = async (memberId, role) => {
        if (!isAdmin) return;

        try {
            const res = await api.organization.team.updateRole(memberId, role);
            const updated = unwrap(res, null);
            setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, ...(updated || { role }) } : m)));
            toast('Member role updated', 'success');
        } catch (error) {
            toast(error.message || 'Failed to update role', 'error');
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!isAdmin) return;
        if (!window.confirm('Remove this member from the organization?')) return;

        try {
            await api.organization.team.remove(memberId);
            setMembers((prev) => prev.filter((m) => m.id !== memberId));
            toast('Member removed successfully', 'success');
        } catch (error) {
            toast(error.message || 'Failed to remove member', 'error');
        }
    };

    const handleRevokeInvite = async (id) => {
        if (!isAdmin) return;

        try {
            await api.organization.invitations.revoke(id);
            setInvitations((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: 'revoked' } : inv)));
            toast('Invitation revoked', 'success');
        } catch (error) {
            toast(error.message || 'Failed to revoke invitation', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Organization Settings</h1>
                    <p className="text-sm text-slate-500">Manage staff access for your company workspace.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {isAdmin && (
                        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold">
                            <Sparkles className="w-4 h-4" /> Team Access Controls
                        </span>
                    )}
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium disabled:opacity-70"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-slate-800 dark:text-white">Company Access</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                    <div>
                        <p className="text-slate-500">Company Name</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{organization.name}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Plan Tier</p>
                        <p className="font-semibold uppercase text-slate-800 dark:text-slate-200">{organization.plan}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Seats Used</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {totalSeatsUsed}
                            {seatLimit !== Infinity ? ` / ${seatLimit}` : ' / Unlimited'}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-500">Seats Remaining</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{seatsRemaining}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Default Tax</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{defaultTax}%</p>
                    </div>
                </div>
                <p className="mt-4 text-xs text-slate-500">
                    Add staff below to give access to this app. Team size depends on your paid user seats.
                </p>
            </div>

            {isAdmin && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Mail className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-slate-800 dark:text-white">Add Staff Access</h3>
                    </div>
                    <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                            type="email"
                            required
                            placeholder="staff@yourcompany.com"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                            className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                        <select
                            value={inviteForm.role}
                            onChange={(e) => setInviteForm((prev) => ({ ...prev, role: e.target.value }))}
                            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                            {ROLES.map((role) => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            disabled={inviteLoading || (seatLimit !== Infinity && totalSeatsUsed >= seatLimit)}
                            className="px-3 py-2 rounded-lg bg-primary text-white font-medium disabled:opacity-70"
                        >
                            {inviteLoading ? 'Sending...' : 'Send Invite'}
                        </button>
                    </form>
                    {seatLimit !== Infinity && totalSeatsUsed >= seatLimit && (
                        <p className="mt-3 text-xs text-amber-600">
                            Seat limit reached for your current plan. Upgrade your plan to add more staff.
                        </p>
                    )}
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-slate-800 dark:text-white">Team Members</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="py-3 pr-4">Name</th>
                                <th className="py-3 pr-4">Email</th>
                                <th className="py-3 pr-4">Role</th>
                                <th className="py-3 pr-4">Status</th>
                                {isAdmin && <th className="py-3 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.id} className="border-b border-slate-100 dark:border-slate-800">
                                    <td className="py-3 pr-4 font-medium text-slate-800 dark:text-slate-200">{member.name || 'Unnamed User'}</td>
                                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">{member.email}</td>
                                    <td className="py-3 pr-4">
                                        {isAdmin && member.id !== currentUser?.id ? (
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-transparent"
                                            >
                                                {ROLES.map((role) => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <RoleBadge role={member.role} />
                                        )}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span className={`text-xs font-bold uppercase ${member.isActive === false ? 'text-rose-500' : 'text-emerald-600'}`}>
                                            {member.isActive === false ? 'Inactive' : 'Active'}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="py-3 text-right">
                                            {member.id !== currentUser?.id && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Remove
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAdmin && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Invitations</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 pr-4">Email</th>
                                    <th className="py-3 pr-4">Role</th>
                                    <th className="py-3 pr-4">Status</th>
                                    <th className="py-3 pr-4">Created</th>
                                    <th className="py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invitations.map((invite) => (
                                    <tr key={invite.id} className="border-b border-slate-100 dark:border-slate-800">
                                        <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{invite.email}</td>
                                        <td className="py-3 pr-4"><RoleBadge role={invite.role} /></td>
                                        <td className="py-3 pr-4 text-xs uppercase font-bold text-slate-500">{invite.status}</td>
                                        <td className="py-3 pr-4 text-slate-500">{invite.createdAt ? new Date(invite.createdAt).toLocaleString() : '-'}</td>
                                        <td className="py-3 text-right">
                                            {(invite.status || '').toLowerCase() === 'pending' && (
                                                <button
                                                    onClick={() => handleRevokeInvite(invite.id)}
                                                    className="text-xs text-rose-500 hover:text-rose-600"
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!isAdmin && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm">
                    You are signed in as <b>{currentRole}</b>. Team management is restricted to organization admins.
                </div>
            )}
        </div>
    );
}
