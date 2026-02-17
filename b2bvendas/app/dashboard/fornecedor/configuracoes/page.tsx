'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

interface ProfileData {
  nomeEmpresa: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
}

interface AccountData {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  novoPedido: boolean;
  statusPedido: boolean;
  estoqueMinimo: boolean;
  emailMarketing: boolean;
}

type Tab = 'profile' | 'account' | 'notifications';

export default function ConfiguracoesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const [profileData, setProfileData] = useState<ProfileData>({
    nomeEmpresa: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
  });

  const [accountData, setAccountData] = useState<AccountData>({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    novoPedido: true,
    statusPedido: true,
    estoqueMinimo: true,
    emailMarketing: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadSettings();
    }
  }, [status]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProfileData({
        nomeEmpresa: 'Minha Empresa Fornecedora',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 98765-4321',
        email: 'contato@minhaempresa.com.br',
        endereco: 'Rua das Flores, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
      });

      setAccountData({
        email: session?.user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAccount = async () => {
    if (accountData.newPassword !== accountData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      setSaving(true);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert('Conta atualizada com sucesso!');
      setAccountData({
        ...accountData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Erro ao salvar conta.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert('Configurações de notificações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving notifications:', error);
      alert('Erro ao salvar notificações.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout userType="fornecedor">
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" label="Carregando..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userType="fornecedor"
      userName={session?.user?.nome}
      userEmail={session?.user?.email}
      userAvatar={session?.user?.avatar}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-2 text-gray-600">Gerencie as configurações da sua conta e preferências.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              Perfil
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={cn(
                'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
                activeTab === 'account'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              Conta
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={cn(
                'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              Notificações
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card>
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Informações da Empresa</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="nomeEmpresa">Nome da Empresa *</Label>
              <Input
                id="nomeEmpresa"
                value={profileData.nomeEmpresa}
                onChange={(e) => setProfileData({ ...profileData, nomeEmpresa: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={profileData.cnpj}
                onChange={(e) => setProfileData({ ...profileData, cnpj: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={profileData.telefone}
                onChange={(e) => setProfileData({ ...profileData, telefone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="profileEmail">Email *</Label>
              <Input
                id="profileEmail"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="endereco">Endereço *</Label>
              <Input
                id="endereco"
                value={profileData.endereco}
                onChange={(e) => setProfileData({ ...profileData, endereco: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                value={profileData.cidade}
                onChange={(e) => setProfileData({ ...profileData, cidade: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="estado">Estado *</Label>
              <Input
                id="estado"
                value={profileData.estado}
                onChange={(e) => setProfileData({ ...profileData, estado: e.target.value })}
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                value={profileData.cep}
                onChange={(e) => setProfileData({ ...profileData, cep: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'account' && (
        <Card>
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Segurança da Conta</h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="accountEmail">Email</Label>
              <Input
                id="accountEmail"
                type="email"
                value={accountData.email}
                onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Alterar Senha</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Senha Atual *</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={accountData.currentPassword}
                    onChange={(e) => setAccountData({ ...accountData, currentPassword: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">Nova Senha *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={accountData.newPassword}
                    onChange={(e) => setAccountData({ ...accountData, newPassword: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={accountData.confirmPassword}
                    onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveAccount} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Preferências de Notificações</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="novoPedido"
                checked={notifications.novoPedido}
                onChange={(e) => setNotifications({ ...notifications, novoPedido: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <label htmlFor="novoPedido" className="cursor-pointer font-medium text-gray-900">
                  Novos Pedidos
                </label>
                <p className="text-sm text-gray-500">
                  Receba notificações quando um novo pedido for realizado.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="statusPedido"
                checked={notifications.statusPedido}
                onChange={(e) => setNotifications({ ...notifications, statusPedido: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <label htmlFor="statusPedido" className="cursor-pointer font-medium text-gray-900">
                  Atualizações de Status
                </label>
                <p className="text-sm text-gray-500">
                  Receba notificações sobre mudanças no status dos pedidos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="estoqueMinimo"
                checked={notifications.estoqueMinimo}
                onChange={(e) => setNotifications({ ...notifications, estoqueMinimo: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <label htmlFor="estoqueMinimo" className="cursor-pointer font-medium text-gray-900">
                  Alerta de Estoque Mínimo
                </label>
                <p className="text-sm text-gray-500">
                  Receba notificações quando produtos atingirem o estoque mínimo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="emailMarketing"
                checked={notifications.emailMarketing}
                onChange={(e) => setNotifications({ ...notifications, emailMarketing: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <label htmlFor="emailMarketing" className="cursor-pointer font-medium text-gray-900">
                  Newsletter e Promoções
                </label>
                <p className="text-sm text-gray-500">
                  Receba emails sobre novidades, dicas e promoções especiais.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveNotifications} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Preferências'}
            </Button>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
