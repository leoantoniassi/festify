import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const SETTINGS_ITEMS = [
  {
    id: "identidade-visual",
    label: "Identidade Visual",
    description: "Personalizar cores, logo e marca",
    icon: "palette",
    to: "/configuracoes",
    requiredRole: "gerente",
  },
];

export default function SettingsMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Filtra itens com base no nível de permissão do usuário
  const visibleItems = SETTINGS_ITEMS.filter(
    (item) => !item.requiredRole || item.requiredRole === user?.role
  );

  // Fecha o dropdown ao clicar fora ou ao pressionar a tecla Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Se o usuário não tiver permissão para ver nenhum item de configuração, não renderiza o botão
  if (visibleItems.length === 0) {
    return null;
  }

  const handleSelect = (to) => {
    setIsOpen(false);
    navigate(to);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-2 rounded-full transition-all flex items-center justify-center ${
          isOpen
            ? "bg-primary/15 text-primary"
            : "text-on-surface-variant hover:text-primary hover:bg-surface-variant/40"
        }`}
        title="Configurações e Ferramentas"
        aria-label="Configurações e Ferramentas"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        id="btn-settings-menu"
      >
        <span
          className={`material-symbols-outlined transition-transform duration-200 ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          settings
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface-container-high border border-outline-variant/30 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="btn-settings-menu"
        >
          <div className="px-4 py-2 border-b border-outline-variant/20 mb-1">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Configurações
            </p>
          </div>

          <div className="space-y-0.5">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.to)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-on-surface hover:bg-primary/10 transition-colors group"
                role="menuitem"
                id={`menu-item-${item.id}`}
              >
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors shrink-0">
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                </div>
                <div>
                  <p className="font-semibold text-on-surface text-sm leading-snug">
                    {item.label}
                  </p>
                  <p className="text-xs text-on-surface-variant/80">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
