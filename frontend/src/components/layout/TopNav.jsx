import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import GlobalSearch from "./GlobalSearch";
import SettingsMenu from "./SettingsMenu";

export default function TopNav({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="flex justify-between items-center w-full px-4 md:px-8 h-16 sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
      {/* Lado Esquerdo: Menu Mobile e Pesquisa */}
      <div className="flex items-center gap-4">
        {/* Botão do Menu Hambúrguer (Apenas Mobile) */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-on-surface-variant hover:text-primary transition-colors p-1 flex items-center justify-center"
          aria-label="Abrir menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        {/* Search (Oculto no mobile, visível do md para cima) */}
        <GlobalSearch />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Menu de Configurações / Ferramentas */}
        <SettingsMenu />

        <div className="h-8 w-[1px] bg-outline-variant/30" />

        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
            {(user?.nome || "Admin")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <span className="hidden sm:block font-bold text-on-surface font-headline text-sm">
            {(user?.nome || "Admin").split(" ")[0]}
          </span>
          <button
            onClick={handleLogout}
            className="text-on-surface-variant hover:text-error transition-colors ml-1"
            title="Sair"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
