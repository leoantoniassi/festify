import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsMenu from '../SettingsMenu';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

let mockUser = { id: '1', nome: 'Admin Teste', role: 'gerente' };
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

describe('SettingsMenu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('não renderiza o ícone de configurações quando o usuário é operador', () => {
    mockUser = { id: '2', nome: 'Operador Teste', role: 'operador' };
    const { container } = render(<SettingsMenu />);
    expect(screen.queryByTitle('Configurações e Ferramentas')).not.toBeInTheDocument();
    expect(screen.queryByText('Identidade Visual')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  test('renderiza o ícone de ferramentas quando o usuário é gerente', () => {
    mockUser = { id: '1', nome: 'Gerente Teste', role: 'gerente' };
    render(<SettingsMenu />);
    const btn = screen.getByTitle('Configurações e Ferramentas');
    expect(btn).toBeInTheDocument();
  });

  test('ao clicar no ícone de ferramentas, exibe a opção de Identidade Visual', () => {
    mockUser = { id: '1', nome: 'Gerente Teste', role: 'gerente' };
    render(<SettingsMenu />);
    
    // Inicialmente fechado
    expect(screen.queryByText('Identidade Visual')).not.toBeInTheDocument();

    // Clica no botão de configurações
    const btn = screen.getByTitle('Configurações e Ferramentas');
    fireEvent.click(btn);

    // Agora exibe a opção
    const option = screen.getByText('Identidade Visual');
    expect(option).toBeInTheDocument();
    expect(screen.getByText('Personalizar cores, logo e marca')).toBeInTheDocument();
  });

  test('ao clicar em Identidade Visual, navega para /configuracoes e fecha o menu', () => {
    mockUser = { id: '1', nome: 'Gerente Teste', role: 'gerente' };
    render(<SettingsMenu />);

    // Abre o menu
    fireEvent.click(screen.getByTitle('Configurações e Ferramentas'));

    // Clica na opção
    fireEvent.click(screen.getByText('Identidade Visual'));

    expect(mockNavigate).toHaveBeenCalledWith('/configuracoes');
    expect(screen.queryByText('Identidade Visual')).not.toBeInTheDocument();
  });
});
